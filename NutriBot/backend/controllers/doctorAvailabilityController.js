const db = require("../config/db");

/*
========================================================
HELPERS
========================================================
*/

/*
  Monday    = 1
  Tuesday   = 2
  Wednesday = 3
  Thursday  = 4
  Friday    = 5
  Saturday  = 6
  Sunday    = 7
*/

const VALID_DAYS = [1, 2, 3, 4, 5, 6, 7];

const queryDatabase = (sql, values = []) => {
  return new Promise((resolve, reject) => {
    db.query(sql, values, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};

/*
  Check that the hospital staff member owns the hospital
  that the doctor belongs to.
*/
const verifyDoctorHospitalAccess = async (doctorId, userId) => {
  const sql = `
    SELECT
      d.id AS doctor_id,
      d.hospital_id,
      d.first_name,
      d.last_name
    FROM doctors d
    INNER JOIN hospital_staff hs
      ON hs.hospital_id = d.hospital_id
    WHERE d.id = ?
      AND hs.user_id = ?
      AND d.status = 'ACTIVE'
    LIMIT 1
  `;

  const results = await queryDatabase(sql, [doctorId, userId]);

  return results.length > 0 ? results[0] : null;
};

/*
========================================================
GET DOCTOR AVAILABILITY
========================================================
GET /api/doctor-availability/doctor/:doctorId
*/
const getDoctorAvailability = async (req, res) => {
  try {
    const doctorId = Number(req.params.doctorId);

    if (!Number.isInteger(doctorId) || doctorId <= 0) {
      return res.status(400).json({
        message: "Invalid doctor ID",
      });
    }

    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "User authentication required",
      });
    }

    const doctor = await verifyDoctorHospitalAccess(
      doctorId,
      userId
    );

    if (!doctor) {
      return res.status(403).json({
        message:
          "You do not have permission to manage this doctor",
      });
    }

    const sql = `
      SELECT
        id,
        doctor_id,
        availability_type,
        day_of_week,
        specific_date,
        start_time,
        end_time,
        reason,
        status,
        created_at,
        updated_at
      FROM doctor_availability
      WHERE doctor_id = ?
      ORDER BY
        CASE availability_type
          WHEN 'RECURRING' THEN 1
          WHEN 'SPECIFIC_DATE' THEN 2
          WHEN 'BLOCKED' THEN 3
        END,
        day_of_week ASC,
        specific_date ASC,
        start_time ASC
    `;

    const availability = await queryDatabase(sql, [doctorId]);

    return res.json({
      doctor,
      availability,
    });
  } catch (error) {
    console.error(
      "Get doctor availability error:",
      error.message
    );

    return res.status(500).json({
      message: "Failed to get doctor availability",
    });
  }
};

/*
========================================================
SAVE WEEKLY SCHEDULE
========================================================
PUT /api/doctor-availability/doctor/:doctorId/schedule
========================================================

Expected body:

{
  "schedule": [
    {
      "day_of_week": 1,
      "start_time": "09:00",
      "end_time": "17:00",
      "enabled": true
    },
    ...
  ]
}

Monday = 1
Sunday = 7
*/
const saveWeeklySchedule = async (req, res) => {
  const doctorId = Number(req.params.doctorId);
  const userId = req.user?.id;
  const schedule = req.body?.schedule;

  if (!Number.isInteger(doctorId) || doctorId <= 0) {
    return res.status(400).json({
      message: "Invalid doctor ID",
    });
  }

  if (!userId) {
    return res.status(401).json({
      message: "User authentication required",
    });
  }

  if (!Array.isArray(schedule)) {
    return res.status(400).json({
      message: "schedule must be an array",
    });
  }

  if (schedule.length !== 7) {
    return res.status(400).json({
      message:
        "Weekly schedule must contain all 7 days",
    });
  }

  try {
    const doctor = await verifyDoctorHospitalAccess(
      doctorId,
      userId
    );

    if (!doctor) {
      return res.status(403).json({
        message:
          "You do not have permission to manage this doctor",
      });
    }

    /*
      Validate all days before changing anything.
    */
    const seenDays = new Set();

    for (const item of schedule) {
      const day = Number(item.day_of_week);

      if (!VALID_DAYS.includes(day)) {
        return res.status(400).json({
          message:
            "day_of_week must be between 1 and 7",
        });
      }

      if (seenDays.has(day)) {
        return res.status(400).json({
          message:
            "Each day can only appear once in the schedule",
        });
      }

      seenDays.add(day);

      const enabled = Boolean(item.enabled);

      /*
        Disabled day does not need times.
      */
      if (!enabled) {
        continue;
      }

      if (!item.start_time || !item.end_time) {
        return res.status(400).json({
          message:
            `Start time and end time are required for day ${day}`,
        });
      }

      if (item.start_time >= item.end_time) {
        return res.status(400).json({
          message:
            `Start time must be earlier than end time for day ${day}`,
        });
      }
    }

    /*
      Use a transaction so the weekly schedule is replaced
      completely and safely.
    */
    const connection = await new Promise(
      (resolve, reject) => {
        db.getConnection((error, conn) => {
          if (error) {
            reject(error);
          } else {
            resolve(conn);
          }
        });
      }
    );

    try {
      await new Promise((resolve, reject) => {
        connection.beginTransaction((error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });

      /*
        Remove the existing recurring schedule only.

        IMPORTANT:
        SPECIFIC_DATE and BLOCKED records are preserved.
      */
      await new Promise((resolve, reject) => {
        connection.query(
          `
            DELETE FROM doctor_availability
            WHERE doctor_id = ?
              AND availability_type = 'RECURRING'
          `,
          [doctorId],
          (error) => {
            if (error) {
              reject(error);
            } else {
              resolve();
            }
          }
        );
      });

      /*
        Insert enabled working days.
      */
      for (const item of schedule) {
        if (!item.enabled) {
          continue;
        }

        await new Promise((resolve, reject) => {
          connection.query(
            `
              INSERT INTO doctor_availability (
                doctor_id,
                availability_type,
                day_of_week,
                specific_date,
                start_time,
                end_time,
                reason,
                status
              )
              VALUES (
                ?,
                'RECURRING',
                ?,
                NULL,
                ?,
                ?,
                NULL,
                'ACTIVE'
              )
            `,
            [
              doctorId,
              Number(item.day_of_week),
              item.start_time,
              item.end_time,
            ],
            (error) => {
              if (error) {
                reject(error);
              } else {
                resolve();
              }
            }
          );
        });
      }

      await new Promise((resolve, reject) => {
        connection.commit((error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });

      connection.release();

      return res.json({
        message: "Doctor weekly schedule saved successfully",
      });
    } catch (transactionError) {
      await new Promise((resolve) => {
        connection.rollback(() => {
          resolve();
        });
      });

      connection.release();

      throw transactionError;
    }
  } catch (error) {
    console.error(
      "Save weekly schedule error:",
      error.message
    );

    return res.status(500).json({
      message: "Failed to save doctor weekly schedule",
    });
  }
};

/*
========================================================
ADD LEAVE / BLOCKED DATE
========================================================
POST /api/doctor-availability/doctor/:doctorId/leave

Expected body:

{
  "specific_date": "2026-10-20",
  "reason": "Annual leave"
}
*/
const addDoctorLeave = async (req, res) => {
  const doctorId = Number(req.params.doctorId);
  const userId = req.user?.id;

  const {
    specific_date,
    reason,
  } = req.body || {};

  if (!Number.isInteger(doctorId) || doctorId <= 0) {
    return res.status(400).json({
      message: "Invalid doctor ID",
    });
  }

  if (!userId) {
    return res.status(401).json({
      message: "User authentication required",
    });
  }

  if (!specific_date) {
    return res.status(400).json({
      message: "Leave date is required",
    });
  }

  try {
    const doctor = await verifyDoctorHospitalAccess(
      doctorId,
      userId
    );

    if (!doctor) {
      return res.status(403).json({
        message:
          "You do not have permission to manage this doctor",
      });
    }

    /*
      Check if the doctor already has an active BLOCKED
      record for this date.
    */
    const existing = await queryDatabase(
      `
        SELECT id
        FROM doctor_availability
        WHERE doctor_id = ?
          AND availability_type = 'BLOCKED'
          AND specific_date = ?
          AND status = 'ACTIVE'
        LIMIT 1
      `,
      [doctorId, specific_date]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        message:
          "This doctor already has leave recorded for this date",
      });
    }

    const result = await queryDatabase(
      `
        INSERT INTO doctor_availability (
          doctor_id,
          availability_type,
          day_of_week,
          specific_date,
          start_time,
          end_time,
          reason,
          status
        )
        VALUES (
          ?,
          'BLOCKED',
          NULL,
          ?,
          NULL,
          NULL,
          ?,
          'ACTIVE'
        )
      `,
      [
        doctorId,
        specific_date,
        reason || "Doctor unavailable",
      ]
    );

    return res.status(201).json({
      message: "Doctor leave added successfully",
      leaveId: result.insertId,
    });
  } catch (error) {
    console.error(
      "Add doctor leave error:",
      error.message
    );

    return res.status(500).json({
      message: "Failed to add doctor leave",
    });
  }
};

/*
========================================================
DELETE / REMOVE LEAVE
========================================================
DELETE /api/doctor-availability/:availabilityId
*/
const removeDoctorAvailability = async (req, res) => {
  const availabilityId = Number(
    req.params.availabilityId
  );

  const userId = req.user?.id;

  if (
    !Number.isInteger(availabilityId) ||
    availabilityId <= 0
  ) {
    return res.status(400).json({
      message: "Invalid availability ID",
    });
  }

  if (!userId) {
    return res.status(401).json({
      message: "User authentication required",
    });
  }

  try {
    /*
      Verify the availability record belongs to a doctor
      in the hospital managed by this staff member.
    */
    const records = await queryDatabase(
      `
        SELECT
          da.id,
          da.doctor_id,
          da.availability_type,
          da.specific_date,
          d.hospital_id
        FROM doctor_availability da
        INNER JOIN doctors d
          ON d.id = da.doctor_id
        INNER JOIN hospital_staff hs
          ON hs.hospital_id = d.hospital_id
        WHERE da.id = ?
          AND hs.user_id = ?
        LIMIT 1
      `,
      [availabilityId, userId]
    );

    if (records.length === 0) {
      return res.status(404).json({
        message: "Availability record not found",
      });
    }

    const record = records[0];

    /*
      We only allow deletion of BLOCKED records here.

      Weekly schedules are managed through the schedule
      endpoint and are replaced as a complete weekly set.
    */
    if (record.availability_type !== "BLOCKED") {
      return res.status(400).json({
        message:
          "Only doctor leave records can be removed using this endpoint",
      });
    }

    await queryDatabase(
      `
        DELETE FROM doctor_availability
        WHERE id = ?
      `,
      [availabilityId]
    );

    return res.json({
      message: "Doctor leave removed successfully",
    });
  } catch (error) {
    console.error(
      "Remove doctor availability error:",
      error.message
    );

    return res.status(500).json({
      message: "Failed to remove doctor leave",
    });
  }
};

/*
========================================================
EXPORTS
========================================================
*/

module.exports = {
  getDoctorAvailability,
  saveWeeklySchedule,
  addDoctorLeave,
  removeDoctorAvailability,
};