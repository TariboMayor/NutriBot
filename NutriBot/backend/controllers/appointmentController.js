const db = require("../config/db");

const {
  sendAppointmentReplyEmail,
} = require("../services/emailService");


function queryDatabase(
  sql,
  values = []
) {
  return new Promise(
    (resolve, reject) => {
      db.query(
        sql,
        values,
        (error, results) => {
          if (error) {
            reject(error);
          } else {
            resolve(results);
          }
        }
      );
    }
  );
}


function getDatabaseConnection() {
  return new Promise(
    (resolve, reject) => {
      db.getConnection(
        (error, connection) => {
          if (error) {
            reject(error);
          } else {
            resolve(connection);
          }
        }
      );
    }
  );
}


function queryConnection(
  connection,
  sql,
  values = []
) {
  return new Promise(
    (resolve, reject) => {
      connection.query(
        sql,
        values,
        (error, results) => {
          if (error) {
            reject(error);
          } else {
            resolve(results);
          }
        }
      );
    }
  );
}


function beginTransaction(
  connection
) {
  return new Promise(
    (resolve, reject) => {
      connection.beginTransaction(
        (error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        }
      );
    }
  );
}


function commitTransaction(
  connection
) {
  return new Promise(
    (resolve, reject) => {
      connection.commit(
        (error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        }
      );
    }
  );
}


function rollbackTransaction(
  connection
) {
  return new Promise(
    (resolve) => {
      connection.rollback(
        () => resolve()
      );
    }
  );
}


function releaseConnection(
  connection
) {
  if (connection) {
    connection.release();
  }
}


function toMinutes(
  value
) {
  if (!value) {
    return 0;
  }

  const parts =
    String(value)
      .substring(0, 5)
      .split(":");

  const hours =
    Number(parts[0] || 0);

  const minutes =
    Number(parts[1] || 0);

  return (
    hours * 60 +
    minutes
  );
}


function minutesToTime(
  totalMinutes
) {
  const hours =
    Math.floor(
      totalMinutes / 60
    );

  const minutes =
    totalMinutes % 60;

  return (
    `${String(hours).padStart(2, "0")}:` +
    `${String(minutes).padStart(2, "0")}:00`
  );
}


function getDayOfWeek(
  dateString
) {
  const [
    year,
    month,
    day,
  ] = String(
    dateString
  )
    .substring(0, 10)
    .split("-")
    .map(Number);

  return new Date(
    year,
    month - 1,
    day
  ).getDay();
}


async function getAvailableSlots(
  req,
  res
) {
  try {
    const doctorId =
      Number(
        req.query.doctorId
      );

    const hospitalServiceId =
      Number(
        req.query.hospitalServiceId
      );

    const appointmentDate =
      req.query.appointmentDate;

    if (
      !doctorId ||
      !hospitalServiceId ||
      !appointmentDate
    ) {
      return res.status(400).json({
        message:
          "Doctor, hospital service, and appointment date are required.",
      });
    }

    const serviceRows =
      await queryDatabase(
        `
          SELECT
            ds.id AS doctor_service_id,
            ds.doctor_id,
            ds.hospital_service_id,
            hs.hospital_id,
            hs.duration_minutes,
            hs.price,
            hs.status AS hospital_service_status
          FROM doctor_services ds
          INNER JOIN hospital_services hs
            ON hs.id = ds.hospital_service_id
          WHERE ds.doctor_id = ?
            AND ds.hospital_service_id = ?
            AND ds.status = 'ACTIVE'
            AND hs.status = 'ACTIVE'
          LIMIT 1
        `,
        [
          doctorId,
          hospitalServiceId,
        ]
      );

    if (!serviceRows.length) {
      return res.status(404).json({
        message:
          "The selected doctor service is not available.",
      });
    }

    const service =
      serviceRows[0];

    const dayOfWeek =
      getDayOfWeek(
        appointmentDate
      );

    const availabilityRows =
      await queryDatabase(
        `
          SELECT
            id,
            availability_type,
            day_of_week,
            specific_date,
            start_time,
            end_time,
            reason,
            status
          FROM doctor_availability
          WHERE doctor_id = ?
            AND status = 'ACTIVE'
            AND (
              (
                availability_type = 'SPECIFIC_DATE'
                AND specific_date = ?
              )
              OR
              (
                availability_type = 'RECURRING'
                AND day_of_week = ?
              )
              OR
              (
                availability_type = 'BLOCKED'
                AND specific_date = ?
              )
            )
          ORDER BY
            CASE
              WHEN availability_type = 'BLOCKED'
                THEN 1
              WHEN availability_type = 'SPECIFIC_DATE'
                THEN 2
              ELSE 3
            END,
            start_time
        `,
        [
          doctorId,
          appointmentDate,
          dayOfWeek,
          appointmentDate,
        ]
      );

    const blocked =
      availabilityRows.some(
        (row) =>
          row.availability_type ===
            "BLOCKED" &&
          String(
            row.specific_date
          ).slice(0, 10) ===
            String(
              appointmentDate
            ).slice(0, 10)
      );

    if (blocked) {
      return res.status(200).json({
        slots: [],
      });
    }

    const specificAvailability =
      availabilityRows.filter(
        (row) =>
          row.availability_type ===
            "SPECIFIC_DATE" &&
          String(
            row.specific_date
          ).slice(0, 10) ===
            String(
              appointmentDate
            ).slice(0, 10)
      );

    const recurringAvailability =
      availabilityRows.filter(
        (row) =>
          row.availability_type ===
            "RECURRING" &&
          Number(
            row.day_of_week
          ) === dayOfWeek
      );

    const selectedAvailability =
      specificAvailability.length > 0
        ? specificAvailability
        : recurringAvailability;

    if (!selectedAvailability.length) {
      return res.status(200).json({
        slots: [],
      });
    }

    const existingAppointments =
      await queryDatabase(
        `
          SELECT
            start_time,
            end_time,
            status
          FROM appointments
          WHERE doctor_id = ?
            AND appointment_date = ?
            AND status NOT IN (
              'CANCELLED'
            )
        `,
        [
          doctorId,
          appointmentDate,
        ]
      );

    const duration =
      Number(
        service.duration_minutes
      ) > 0
        ? Number(
            service.duration_minutes
          )
        : 30;

    const slots = [];

    for (
      const availability
      of selectedAvailability
    ) {
      const availabilityStart =
        toMinutes(
          availability.start_time
        );

      const availabilityEnd =
        toMinutes(
          availability.end_time
        );

      for (
        let start =
          availabilityStart;
        start + duration <=
          availabilityEnd;
        start += duration
      ) {
        const slotStart =
          minutesToTime(start);

        const slotEnd =
          minutesToTime(
            start + duration
          );

        const isTaken =
          existingAppointments.some(
            (appointment) => {
              const existingStart =
                toMinutes(
                  appointment.start_time
                );

              const existingEnd =
                toMinutes(
                  appointment.end_time
                );

              return (
                existingStart <
                  start + duration &&
                existingEnd >
                  start
              );
            }
          );

        if (!isTaken) {
          slots.push({
            start_time:
              slotStart,
            end_time:
              slotEnd,
          });
        }
      }
    }

    const uniqueSlots =
      slots.filter(
        (
          slot,
          index,
          array
        ) =>
          index ===
          array.findIndex(
            (item) =>
              item.start_time ===
                slot.start_time &&
              item.end_time ===
                slot.end_time
          )
      );

    return res.status(200).json({
      slots:
        uniqueSlots,
    });
  } catch (error) {
    console.error(
      "Get available slots error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to load available appointment slots.",
      error:
        error.message,
    });
  }
}


async function createAppointment(
  req,
  res
) {
  let connection;

  try {
    const patientId =
      req.user?.id;

    const {
      doctorId,
      hospitalServiceId,
      appointmentDate,
      startTime,
      endTime,
    } = req.body;

    if (!patientId) {
      return res.status(401).json({
        message:
          "Authenticated patient could not be identified.",
      });
    }

    if (
      !doctorId ||
      !hospitalServiceId ||
      !appointmentDate ||
      !startTime ||
      !endTime
    ) {
      return res.status(400).json({
        message:
          "Doctor, service, date, start time, and end time are required.",
      });
    }

    connection =
      await getDatabaseConnection();

    await beginTransaction(
      connection
    );

    const serviceRows =
      await queryConnection(
        connection,
        `
          SELECT
            ds.doctor_id,
            ds.hospital_service_id,
            hs.hospital_id,
            hs.duration_minutes,
            hs.price,
            hs.status AS hospital_service_status,
            ds.status AS doctor_service_status
          FROM doctor_services ds
          INNER JOIN hospital_services hs
            ON hs.id = ds.hospital_service_id
          WHERE ds.doctor_id = ?
            AND ds.hospital_service_id = ?
            AND ds.status = 'ACTIVE'
            AND hs.status = 'ACTIVE'
          LIMIT 1
        `,
        [
          doctorId,
          hospitalServiceId,
        ]
      );

    if (!serviceRows.length) {
      await rollbackTransaction(
        connection
      );

      return res.status(404).json({
        message:
          "The selected doctor service is not available.",
      });
    }

    const existingRows =
      await queryConnection(
        connection,
        `
          SELECT
            id
          FROM appointments
          WHERE doctor_id = ?
            AND appointment_date = ?
            AND status NOT IN (
              'CANCELLED'
            )
            AND start_time < ?
            AND end_time > ?
          LIMIT 1
        `,
        [
          doctorId,
          appointmentDate,
          endTime,
          startTime,
        ]
      );

    if (existingRows.length) {
      await rollbackTransaction(
        connection
      );

      return res.status(409).json({
        message:
          "The selected appointment time is no longer available.",
      });
    }

    const result =
      await queryConnection(
        connection,
        `
          INSERT INTO appointments (
            patient_id,
            doctor_id,
            hospital_service_id,
            appointment_date,
            start_time,
            end_time,
            status
          )
          VALUES (
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            'PENDING'
          )
        `,
        [
          patientId,
          doctorId,
          hospitalServiceId,
          appointmentDate,
          startTime,
          endTime,
        ]
      );

    await commitTransaction(
      connection
    );

    return res.status(201).json({
      message:
        "Appointment created successfully.",
      appointmentId:
        result.insertId,
      status:
        "PENDING",
    });
  } catch (error) {
    if (connection) {
      await rollbackTransaction(
        connection
      );
    }

    console.error(
      "Create appointment error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to create appointment.",
      error:
        error.message,
    });
  } finally {
    releaseConnection(
      connection
    );
  }
}


async function getMyAppointments(
  req,
  res
) {
  try {
    const patientId =
      req.user?.id;

    if (!patientId) {
      return res.status(401).json({
        message:
          "Authenticated patient could not be identified.",
      });
    }

    const appointments =
      await queryDatabase(
        `
          SELECT
            a.id,
            a.patient_id,
            a.doctor_id,
            a.hospital_service_id,
            a.appointment_date,
            a.start_time,
            a.end_time,
            a.status,
            a.created_at,
            a.updated_at,

            h.id AS hospital_id,
            h.name AS hospital_name,
            h.address AS hospital_address,
            h.city AS hospital_city,
            h.state AS hospital_state,

            doctor.name AS doctor_name,
            doctor.email AS doctor_email,

            ms.id AS service_id,
            ms.name AS service_name,

            hs.duration_minutes,
            hs.price

          FROM appointments a

          INNER JOIN hospital_services hs
            ON hs.id =
              a.hospital_service_id

          INNER JOIN hospitals h
            ON h.id =
              hs.hospital_id

          INNER JOIN medical_services ms
            ON ms.id =
              hs.service_id

          INNER JOIN users_tbl doctor
            ON doctor.id =
              a.doctor_id

          WHERE a.patient_id = ?

          ORDER BY
            a.appointment_date ASC,
            a.start_time ASC
        `,
        [patientId]
      );

    return res.status(200).json({
      appointments,
    });
  } catch (error) {
    console.error(
      "Get patient appointments error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to load your appointments.",
      error:
        error.message,
    });
  }
}


async function getHospitalAppointments(
  req,
  res
) {
  try {
    const userId =
      req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message:
          "Authenticated user could not be identified.",
      });
    }

    const staffRows =
      await queryDatabase(
        `
          SELECT
            hospital_id
          FROM hospital_staff
          WHERE user_id = ?
          LIMIT 1
        `,
        [userId]
      );

    if (!staffRows.length) {
      return res.status(404).json({
        message:
          "No hospital staff record was found for this account.",
      });
    }

    const hospitalId =
      staffRows[0].hospital_id;

    if (!hospitalId) {
      return res.status(404).json({
        message:
          "No hospital is associated with this staff account.",
      });
    }

    const hospitalRows =
      await queryDatabase(
        `
          SELECT
            id,
            name,
            address,
            city,
            state
          FROM hospitals
          WHERE id = ?
          LIMIT 1
        `,
        [hospitalId]
      );

    if (!hospitalRows.length) {
      return res.status(404).json({
        message:
          "The hospital associated with this staff account no longer exists.",
      });
    }

    const appointments =
      await queryDatabase(
        `
          SELECT
            a.id,
            a.patient_id,
            a.doctor_id,
            a.hospital_service_id,

            a.appointment_date,
            a.start_time AS appointment_time,
            a.start_time,
            a.end_time,

            a.status,

            a.created_at,
            a.updated_at,

            patient.name AS patient_name,
            patient.email AS patient_email,

            doctor.name AS doctor_name,
            doctor.email AS doctor_email,

            ms.name AS service_name

          FROM appointments a

          INNER JOIN hospital_services hs
            ON hs.id =
              a.hospital_service_id

          INNER JOIN medical_services ms
            ON ms.id =
              hs.service_id

          INNER JOIN users_tbl patient
            ON patient.id =
              a.patient_id

          INNER JOIN users_tbl doctor
            ON doctor.id =
              a.doctor_id

          WHERE hs.hospital_id = ?

          ORDER BY
            a.appointment_date DESC,
            a.start_time DESC
        `,
        [hospitalId]
      );

    return res.status(200).json({
      hospital:
        hospitalRows[0],
      appointments,
    });
  } catch (error) {
    console.error(
      "Get hospital appointments error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to load hospital appointments.",
      error:
        error.message,
    });
  }
}


async function replyToAppointment(
  req,
  res
) {
  let connection;

  try {
    const staffUserId =
      req.user?.id;

    const appointmentId =
      Number(
        req.params.appointmentId
      );

    const subject =
      req.body?.subject
        ? String(
            req.body.subject
          ).trim()
        : "";

    const message =
      req.body?.message
        ? String(
            req.body.message
          ).trim()
        : "";

    if (!staffUserId) {
      return res.status(401).json({
        message:
          "Authenticated hospital staff could not be identified.",
      });
    }

    if (!appointmentId) {
      return res.status(400).json({
        message:
          "Appointment ID is required.",
      });
    }

    if (!message) {
      return res.status(400).json({
        message:
          "Reply message is required.",
      });
    }

    connection =
      await getDatabaseConnection();

    await beginTransaction(
      connection
    );

    const appointmentRows =
      await queryConnection(
        connection,
        `
          SELECT
            a.id,
            a.patient_id,
            a.doctor_id,
            a.appointment_date,
            a.start_time,
            a.status,

            h.id AS hospital_id,
            h.name AS hospital_name,

            patient.name AS patient_name,
            patient.email AS patient_email,

            doctor.name AS doctor_name,

            ms.name AS service_name

          FROM appointments a

          INNER JOIN hospital_services hs
            ON hs.id =
              a.hospital_service_id

          INNER JOIN hospitals h
            ON h.id =
              hs.hospital_id

          INNER JOIN medical_services ms
            ON ms.id =
              hs.service_id

          INNER JOIN users_tbl patient
            ON patient.id =
              a.patient_id

          INNER JOIN users_tbl doctor
            ON doctor.id =
              a.doctor_id

          INNER JOIN hospital_staff staff
            ON staff.hospital_id =
              h.id

          WHERE a.id = ?
            AND staff.user_id = ?

          LIMIT 1
        `,
        [
          appointmentId,
          staffUserId,
        ]
      );

    if (!appointmentRows.length) {
      await rollbackTransaction(
        connection
      );

      return res.status(404).json({
        message:
          "Appointment not found or you are not authorized to reply to it.",
      });
    }

    const appointment =
      appointmentRows[0];

    await commitTransaction(
      connection
    );

    releaseConnection(
      connection
    );

    connection = null;

    const emailSubject =
      subject ||
      `NutriBot - Message from ${
        appointment.hospital_name ||
        "Hospital"
      }`;

    if (
      appointment.patient_email
    ) {
      setImmediate(() => {
        sendAppointmentReplyEmail(
          {
            recipientEmail:
              appointment.patient_email,

            patientName:
              appointment.patient_name,

            hospitalName:
              appointment.hospital_name,

            doctorName:
              appointment.doctor_name,

            serviceName:
              appointment.service_name,

            appointmentDate:
              appointment.appointment_date,

            startTime:
              appointment.start_time,

            subject:
              emailSubject,

            message,
          },
          (
            emailError
          ) => {
            if (emailError) {
              console.error(
                "Appointment reply email error:",
                emailError.message
              );
            }
          }
        );
      });
    }

    return res.status(200).json({
      message:
        "Reply sent successfully.",
      appointmentId,
    });
  } catch (error) {
    if (connection) {
      await rollbackTransaction(
        connection
      );
    }

    console.error(
      "Reply to appointment error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to send appointment reply.",
      error:
        error.message,
    });
  } finally {
    releaseConnection(
      connection
    );
  }
}


module.exports = {
  getAvailableSlots,
  createAppointment,
  getMyAppointments,
  getHospitalAppointments,
  replyToAppointment,
};
