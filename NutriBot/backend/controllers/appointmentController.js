const db = require("../config/db");

const appointmentService = require("../services/appointmentService");
const reminderService = require("../services/reminderService");


// ======================================================
// GET AVAILABLE APPOINTMENT SLOTS
// ======================================================

const getAvailableSlots = (req, res) => {
  const {
    doctorId,
    hospitalServiceId,
    appointmentDate,
  } = req.query;

  if (
    !doctorId ||
    !hospitalServiceId ||
    !appointmentDate
  ) {
    return res.status(400).json({
      message:
        "doctorId, hospitalServiceId and appointmentDate are required",
    });
  }

  const datePattern = /^\d{4}-\d{2}-\d{2}$/;

  if (!datePattern.test(appointmentDate)) {
    return res.status(400).json({
      message:
        "appointmentDate must use YYYY-MM-DD format",
    });
  }

  appointmentService.getAvailableSlots(
    doctorId,
    hospitalServiceId,
    appointmentDate,
    (error, slots) => {
      if (error) {
        console.error(
          "Get available slots error:",
          error.message
        );

        return res.status(500).json({
          message: error.message,
        });
      }

      res.json({
        doctorId: Number(doctorId),
        hospitalServiceId: Number(hospitalServiceId),
        appointmentDate,
        slots,
      });
    }
  );
};


// ======================================================
// CREATE APPOINTMENT
// ======================================================

const createAppointment = (req, res) => {
  const {
    hospital_id,
    doctor_id,
    hospital_service_id,
    appointment_date,
    start_time,
    reason,
    patient_notes,
  } = req.body;

  /*
    IMPORTANT SECURITY RULE:

    We do NOT accept patient_id from the request body.

    The patient is identified from the authenticated JWT:
      req.user.id

    Then we find the matching patient_profiles record.
  */

  if (
    !hospital_id ||
    !doctor_id ||
    !hospital_service_id ||
    !appointment_date ||
    !start_time
  ) {
    return res.status(400).json({
      message:
        "hospital_id, doctor_id, hospital_service_id, appointment_date and start_time are required",
    });
  }

  const datePattern = /^\d{4}-\d{2}-\d{2}$/;

  if (!datePattern.test(appointment_date)) {
    return res.status(400).json({
      message:
        "appointment_date must use YYYY-MM-DD format",
    });
  }

  /*
    Find the authenticated user's patient profile.

    req.user.id comes from the verified JWT.
  */

  const patientProfileSql = `
    SELECT
      id,
      user_id
    FROM patient_profiles
    WHERE user_id = ?
    LIMIT 1
  `;

  db.query(
    patientProfileSql,
    [req.user.id],
    (patientProfileError, patientProfileResults) => {
      if (patientProfileError) {
        console.error(
          "Find patient profile error:",
          patientProfileError.message
        );

        return res.status(500).json({
          message:
            "Failed to verify patient profile",
        });
      }

      if (patientProfileResults.length === 0) {
        return res.status(404).json({
          message:
            "Patient profile not found. Please create your patient profile first.",
        });
      }

      const patientProfile =
        patientProfileResults[0];

      const patient_id = patientProfile.id;


      // ==================================================
      // VERIFY DOCTOR + HOSPITAL SERVICE
      // ==================================================

      const serviceSql = `
        SELECT
          hs.id AS hospital_service_id,
          hs.hospital_id,
          hs.duration_minutes,
          hs.status AS hospital_service_status,

          d.id AS doctor_id,
          d.status AS doctor_status,

          ds.status AS doctor_service_status

        FROM hospital_services hs

        INNER JOIN doctor_services ds
          ON ds.hospital_service_id = hs.id

        INNER JOIN doctors d
          ON d.id = ds.doctor_id

        WHERE hs.id = ?
          AND hs.hospital_id = ?
          AND d.id = ?

        LIMIT 1
      `;

      db.query(
        serviceSql,
        [
          hospital_service_id,
          hospital_id,
          doctor_id,
        ],
        (serviceError, serviceResults) => {
          if (serviceError) {
            console.error(
              "Verify appointment service error:",
              serviceError.message
            );

            return res.status(500).json({
              message:
                "Failed to verify appointment details",
            });
          }

          if (serviceResults.length === 0) {
            return res.status(400).json({
              message:
                "Doctor is not assigned to this hospital service",
            });
          }

          const service = serviceResults[0];

          if (
            service.hospital_service_status !==
            "ACTIVE"
          ) {
            return res.status(400).json({
              message:
                "Hospital service is not active",
            });
          }

          if (service.doctor_status !== "ACTIVE") {
            return res.status(400).json({
              message: "Doctor is not active",
            });
          }

          if (
            service.doctor_service_status !==
            "ACTIVE"
          ) {
            return res.status(400).json({
              message:
                "Doctor is not currently assigned to this service",
            });
          }

          const durationMinutes =
            service.duration_minutes;


          // ==================================================
          // TIME HELPERS
          // ==================================================

          const timeToMinutes = (time) => {
            const parts = String(time)
              .substring(0, 5)
              .split(":")
              .map(Number);

            if (
              parts.length !== 2 ||
              Number.isNaN(parts[0]) ||
              Number.isNaN(parts[1])
            ) {
              return NaN;
            }

            return parts[0] * 60 + parts[1];
          };


          const minutesToTime = (minutes) => {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;

            return `${String(hours).padStart(
              2,
              "0"
            )}:${String(mins).padStart(
              2,
              "0"
            )}:00`;
          };


          const startMinutes =
            timeToMinutes(start_time);

          if (Number.isNaN(startMinutes)) {
            return res.status(400).json({
              message:
                "start_time must use HH:MM or HH:MM:SS format",
            });
          }

          const endMinutes =
            startMinutes + durationMinutes;

          if (
            startMinutes < 0 ||
            startMinutes >= 24 * 60 ||
            endMinutes > 24 * 60
          ) {
            return res.status(400).json({
              message:
                "Invalid appointment start time",
            });
          }

          const calculatedEndTime =
            minutesToTime(endMinutes);


          // ==================================================
          // VERIFY REQUESTED SLOT
          // ==================================================

          appointmentService.getAvailableSlots(
            doctor_id,
            hospital_service_id,
            appointment_date,
            (slotError, availableSlots) => {
              if (slotError) {
                console.error(
                  "Verify appointment slot error:",
                  slotError.message
                );

                return res.status(500).json({
                  message:
                    "Failed to verify appointment availability",
                });
              }

              const requestedSlot =
                availableSlots.find(
                  (slot) =>
                    slot.start_time ===
                    calculatedStartTime(start_time)
                );

              if (!requestedSlot) {
                return res.status(409).json({
                  message:
                    "The requested appointment time is not available",
                });
              }


              // ==================================================
              // START TRANSACTION
              // ==================================================

              db.beginTransaction(
                (transactionError) => {
                  if (transactionError) {
                    console.error(
                      "Begin appointment transaction error:",
                      transactionError.message
                    );

                    return res.status(500).json({
                      message:
                        "Failed to start appointment booking",
                    });
                  }


                  // ==================================================
                  // CHECK FOR CONFLICTING APPOINTMENTS
                  // ==================================================

                  const conflictSql = `
                    SELECT
                      id,
                      start_time,
                      end_time,
                      status

                    FROM appointments

                    WHERE doctor_id = ?
                      AND appointment_date = ?

                      AND status IN (
                        'PENDING',
                        'CONFIRMED',
                        'RESCHEDULED'
                      )

                      AND start_time < ?
                      AND end_time > ?

                    FOR UPDATE
                  `;

                  db.query(
                    conflictSql,
                    [
                      doctor_id,
                      appointment_date,
                      calculatedEndTime,
                      start_time,
                    ],
                    (
                      conflictError,
                      conflictResults
                    ) => {
                      if (conflictError) {
                        return db.rollback(() => {
                          console.error(
                            "Appointment conflict check error:",
                            conflictError.message
                          );

                          res.status(500).json({
                            message:
                              "Failed to check appointment availability",
                          });
                        });
                      }

                      if (
                        conflictResults.length > 0
                      ) {
                        return db.rollback(() => {
                          res.status(409).json({
                            message:
                              "This appointment time is no longer available",
                          });
                        });
                      }


                      // ==================================================
                      // CREATE APPOINTMENT
                      // ==================================================

                      const insertSql = `
                        INSERT INTO appointments (
                          patient_id,
                          hospital_id,
                          doctor_id,
                          hospital_service_id,
                          appointment_date,
                          start_time,
                          end_time,
                          reason,
                          patient_notes,
                          status
                        )

                        VALUES (
                          ?,
                          ?,
                          ?,
                          ?,
                          ?,
                          ?,
                          ?,
                          ?,
                          ?,
                          'PENDING'
                        )
                      `;

                      const insertValues = [
                        patient_id,
                        hospital_id,
                        doctor_id,
                        hospital_service_id,
                        appointment_date,
                        start_time,
                        calculatedEndTime,
                        reason || null,
                        patient_notes || null,
                      ];

                      db.query(
                        insertSql,
                        insertValues,
                        (
                          insertError,
                          insertResult
                        ) => {
                          if (insertError) {
                            return db.rollback(() => {
                              console.error(
                                "Create appointment error:",
                                insertError.message
                              );

                              res.status(500).json({
                                message:
                                  "Failed to create appointment",
                              });
                            });
                          }

                          const appointmentId =
                            insertResult.insertId;


                          // ==================================================
                          // CREATE INITIAL STATUS HISTORY
                          // ==================================================

                          const historySql = `
                            INSERT INTO appointment_status_history (
                              appointment_id,
                              old_status,
                              new_status,
                              reason
                            )

                            VALUES (
                              ?,
                              NULL,
                              'PENDING',
                              ?
                            )
                          `;

                          db.query(
                            historySql,
                            [
                              appointmentId,
                              "Appointment created",
                            ],
                            (historyError) => {
                              if (historyError) {
                                return db.rollback(() => {
                                  console.error(
                                    "Create appointment history error:",
                                    historyError.message
                                  );

                                  res.status(500).json({
                                    message:
                                      "Failed to create appointment history",
                                  });
                                });
                              }


                              // ==================================================
                              // COMMIT APPOINTMENT
                              // ==================================================

                              db.commit(
                                (commitError) => {
                                  if (commitError) {
                                    return db.rollback(
                                      () => {
                                        console.error(
                                          "Commit appointment error:",
                                          commitError.message
                                        );

                                        res.status(500).json({
                                          message:
                                            "Failed to complete appointment booking",
                                        });
                                      }
                                    );
                                  }


                                  // ==================================================
                                  // CREATE REMINDERS
                                  // ==================================================

                                  reminderService.createAppointmentReminders(
                                    appointmentId,
                                    (
                                      reminderError,
                                      reminderResult
                                    ) => {
                                      if (reminderError) {
                                        console.error(
                                          "Create appointment reminders error:",
                                          reminderError.message
                                        );

                                        return res
                                          .status(201)
                                          .json({
                                            message:
                                              "Appointment created successfully, but reminders could not be created",

                                            appointmentId,

                                            status:
                                              "PENDING",

                                            appointment: {
                                              patient_id,
                                              hospital_id,
                                              doctor_id,
                                              hospital_service_id,
                                              appointment_date,
                                              start_time,
                                              end_time:
                                                calculatedEndTime,
                                              reason:
                                                reason ||
                                                null,
                                              patient_notes:
                                                patient_notes ||
                                                null,
                                            },

                                            reminder_error:
                                              reminderError.message,
                                          });
                                      }

                                      res
                                        .status(201)
                                        .json({
                                          message:
                                            "Appointment created successfully",

                                          appointmentId,

                                          status:
                                            "PENDING",

                                          appointment: {
                                            patient_id,
                                            hospital_id,
                                            doctor_id,
                                            hospital_service_id,
                                            appointment_date,
                                            start_time,
                                            end_time:
                                              calculatedEndTime,
                                            reason:
                                              reason ||
                                              null,
                                            patient_notes:
                                              patient_notes ||
                                              null,
                                          },

                                          reminders_created:
                                            reminderResult.remindersCreated,
                                        });
                                    }
                                  );
                                }
                              );
                            }
                          );
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );
};


// ======================================================
// NORMALIZE START TIME
// ======================================================

/*
  Normalize a supplied time to HH:MM:SS.

  Example:
    09:00     -> 09:00:00
    09:00:00  -> 09:00:00
*/

const calculatedStartTime = (time) => {
  const value = String(time).trim();

  if (/^\d{2}:\d{2}$/.test(value)) {
    return `${value}:00`;
  }

  if (/^\d{2}:\d{2}:\d{2}$/.test(value)) {
    return value;
  }

  return value;
};


// ======================================================
// GET PATIENT APPOINTMENTS
// ======================================================

const getMyAppointments = (req, res) => {
  const sql = `
    SELECT
      a.id,
      a.patient_id,
      a.hospital_id,
      a.doctor_id,
      a.hospital_service_id,

      a.appointment_date,
      a.start_time,
      a.end_time,

      a.reason,
      a.patient_notes,
      a.status,
      a.created_at,

      h.name AS hospital_name,
      h.address AS hospital_address,
      h.city AS hospital_city,
      h.state AS hospital_state,

      CONCAT(
        d.first_name,
        ' ',
        d.last_name
      ) AS doctor_name,

      d.specialty AS doctor_specialty,

      ms.name AS service_name,
      ms.category AS service_category,

      hs.duration_minutes,
      hs.price

    FROM appointments a

    INNER JOIN patient_profiles pp
      ON a.patient_id = pp.id

    INNER JOIN hospitals h
      ON a.hospital_id = h.id

    INNER JOIN doctors d
      ON a.doctor_id = d.id

    INNER JOIN hospital_services hs
      ON a.hospital_service_id = hs.id

    INNER JOIN medical_services ms
      ON hs.service_id = ms.id

    WHERE pp.user_id = ?

    ORDER BY
      a.appointment_date DESC,
      a.start_time DESC
  `;

  db.query(
    sql,
    [req.user.id],
    (error, results) => {
      if (error) {
        console.error(
          "Get patient appointments error:",
          error.message
        );

        return res.status(500).json({
          message: "Failed to get appointments",
        });
      }

      res.json(results);
    }
  );
};


// ======================================================
// GET HOSPITAL APPOINTMENTS
// ======================================================
//
// This endpoint is for the Hospital Dashboard.
//
// The hospital is determined from the authenticated
// hospital staff user's hospital_staff record.
//
// IMPORTANT:
// We do NOT accept hospital_id from the frontend.
//
// This prevents hospital staff from manually requesting
// another hospital's appointments.
//

const getHospitalAppointments = (req, res) => {
  const userId = req.user.id;


  // ====================================================
  // FIND ACTIVE HOSPITAL STAFF RECORD
  // ====================================================

  const staffSql = `
    SELECT
      hs.hospital_id,
      hs.staff_role,
      hs.status AS staff_status,

      h.name AS hospital_name,
      h.address AS hospital_address,
      h.city AS hospital_city,
      h.state AS hospital_state,
      h.phone AS hospital_phone,
      h.email AS hospital_email

    FROM hospital_staff hs

    INNER JOIN hospitals h
      ON hs.hospital_id = h.id

    WHERE hs.user_id = ?
      AND hs.status = 'ACTIVE'

    ORDER BY hs.id ASC

    LIMIT 1
  `;

  db.query(
    staffSql,
    [userId],
    (staffError, staffResults) => {
      if (staffError) {
        console.error(
          "Get hospital staff information error:",
          staffError.message
        );

        return res.status(500).json({
          message:
            "Failed to verify hospital staff information",
        });
      }

      if (staffResults.length === 0) {
        return res.status(403).json({
          message:
            "You are not an active staff member of a hospital.",
        });
      }

      const hospital = staffResults[0];


      // ==================================================
      // GET HOSPITAL APPOINTMENTS
      // ==================================================

      const appointmentsSql = `
        SELECT
          a.id,
          a.patient_id,
          a.hospital_id,
          a.doctor_id,
          a.hospital_service_id,

          DATE_FORMAT(
            a.appointment_date,
            '%Y-%m-%d'
          ) AS appointment_date,

          a.start_time,
          a.end_time,

          a.reason,
          a.patient_notes,
          a.status,
          a.cancellation_reason,
          a.created_at,
          a.updated_at,


          -- ==============================================
          -- PATIENT
          -- ==============================================

          pp.user_id AS patient_user_id,

          pu.name AS patient_name,
          pu.email AS patient_email,
          pu.phone AS patient_phone,


          -- ==============================================
          -- DOCTOR
          -- ==============================================

          CONCAT(
            d.first_name,
            ' ',
            d.last_name
          ) AS doctor_name,

          d.specialty AS doctor_specialty,


          -- ==============================================
          -- SERVICE
          -- ==============================================

          ms.name AS service_name,
          ms.category AS service_category,

          hs.duration_minutes,
          hs.price


        FROM appointments a

        INNER JOIN patient_profiles pp
          ON a.patient_id = pp.id

        INNER JOIN users_tbl pu
          ON pp.user_id = pu.id

        INNER JOIN doctors d
          ON a.doctor_id = d.id

        INNER JOIN hospital_services hs
          ON a.hospital_service_id = hs.id

        INNER JOIN medical_services ms
          ON hs.service_id = ms.id

        WHERE a.hospital_id = ?

        ORDER BY
          a.appointment_date ASC,
          a.start_time ASC
      `;

      db.query(
        appointmentsSql,
        [hospital.hospital_id],
        (appointmentsError, appointments) => {
          if (appointmentsError) {
            console.error(
              "Get hospital appointments error:",
              appointmentsError.message
            );

            return res.status(500).json({
              message:
                "Failed to get hospital appointments",
            });
          }

          return res.json({
            hospital: {
              id: hospital.hospital_id,
              name: hospital.hospital_name,
              address: hospital.hospital_address,
              city: hospital.hospital_city,
              state: hospital.hospital_state,
              phone: hospital.hospital_phone,
              email: hospital.hospital_email,
              staff_role: hospital.staff_role,
            },

            appointments,
          });
        }
      );
    }
  );
};


// ======================================================
// EXPORT CONTROLLERS
// ======================================================

module.exports = {
  getAvailableSlots,
  createAppointment,
  getMyAppointments,
  getHospitalAppointments,
};
