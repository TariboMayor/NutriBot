const db = require("../config/db");
const appointmentService = require("../services/appointmentService");
const reminderService = require("../services/reminderService");

// Get available appointment slots
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

// Create appointment
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

      // Step 1: Verify doctor + hospital service relationship
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

          // Convert HH:MM or HH:MM:SS into minutes
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
            )}:${String(mins).padStart(2, "0")}:00`;
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

          /*
            IMPORTANT:

            Verify that the requested start time is
            actually one of the currently available slots.

            This prevents someone from manually sending
            an arbitrary time that was never offered.
          */
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

              /*
                Start transaction.

                The transaction makes the booking operation
                atomic: either everything succeeds or nothing
                is saved.
              */

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

                  // Lock conflicting appointments for this doctor/date
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
                    (conflictError, conflictResults) => {
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

                      /*
                        Create appointment.

                        patient_id comes from the authenticated
                        user's patient profile, NOT the request body.
                      */
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
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')
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
                        (insertError, insertResult) => {
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

                          // Create initial status history
                          const historySql = `
                            INSERT INTO appointment_status_history (
                              appointment_id,
                              old_status,
                              new_status,
                              reason
                            )
                            VALUES (?, NULL, 'PENDING', ?)
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

                              // Commit appointment transaction
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

                                  /*
                                    Appointment has now been
                                    successfully saved.

                                    Create automatic reminders
                                    after the appointment transaction
                                    has completed.
                                  */
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
// Get appointments belonging to the authenticated patient
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

      CONCAT(d.first_name, ' ', d.last_name) AS doctor_name,
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

module.exports = {
  getAvailableSlots,
  createAppointment,
  getMyAppointments,
};