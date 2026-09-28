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
    patient_id,
    hospital_id,
    doctor_id,
    hospital_service_id,
    appointment_date,
    start_time,
    reason,
    patient_notes,
  } = req.body;

  if (
    !patient_id ||
    !hospital_id ||
    !doctor_id ||
    !hospital_service_id ||
    !appointment_date ||
    !start_time
  ) {
    return res.status(400).json({
      message:
        "patient_id, hospital_id, doctor_id, hospital_service_id, appointment_date and start_time are required",
    });
  }

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
          message: "Failed to verify appointment details",
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
          message: "Hospital service is not active",
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
        const [hours, minutes] = String(time)
          .substring(0, 5)
          .split(":")
          .map(Number);

        return hours * 60 + minutes;
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

      const endMinutes =
        startMinutes + durationMinutes;

      const calculatedEndTime =
        minutesToTime(endMinutes);

      /*
        Start transaction.

        The transaction makes the booking operation
        atomic: either everything succeeds or nothing
        is saved.
      */

      db.beginTransaction((transactionError) => {
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

            if (conflictResults.length > 0) {
              return db.rollback(() => {
                res.status(409).json({
                  message:
                    "This appointment time is no longer available",
                });
              });
            }

            // Verify patient exists
            const patientSql = `
              SELECT id
              FROM patient_profiles
              WHERE id = ?
              LIMIT 1
            `;

            db.query(
              patientSql,
              [patient_id],
              (patientError, patientResults) => {
                if (patientError) {
                  return db.rollback(() => {
                    console.error(
                      "Patient verification error:",
                      patientError.message
                    );

                    res.status(500).json({
                      message:
                        "Failed to verify patient",
                    });
                  });
                }

                if (patientResults.length === 0) {
                  return db.rollback(() => {
                    res.status(404).json({
                      message:
                        "Patient profile not found",
                    });
                  });
                }

                // Create appointment
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
                              The appointment has now been
                              successfully saved.

                              Create the automatic reminders
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

                                  /*
                                    The appointment itself
                                    was successfully created.

                                    Do not fail the appointment
                                    just because reminder
                                    creation failed.
                                  */
                                  return res.status(201).json({
                                    message:
                                      "Appointment created successfully, but reminders could not be created",
                                    appointmentId,
                                    status: "PENDING",
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
                                        reason || null,
                                      patient_notes:
                                        patient_notes ||
                                        null,
                                    },
                                    reminder_error:
                                      reminderError.message,
                                  });
                                }

                                res.status(201).json({
                                  message:
                                    "Appointment created successfully",
                                  appointmentId,
                                  status: "PENDING",
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
                                      reason || null,
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
      });
    }
  );
};

module.exports = {
  getAvailableSlots,
  createAppointment,
};