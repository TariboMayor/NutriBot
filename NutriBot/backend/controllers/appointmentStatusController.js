const db = require("../config/db");

const notificationService = require("../services/notificationService");
const reminderService = require("../services/reminderService");
const emailService = require("../services/emailService");

const allowedStatusTransitions = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: [
    "RESCHEDULED",
    "COMPLETED",
    "CANCELLED",
  ],
  RESCHEDULED: ["CONFIRMED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
};

const isAllowedStatusTransition = (
  currentStatus,
  newStatus
) => {
  const allowed =
    allowedStatusTransitions[currentStatus] || [];

  return allowed.includes(newStatus);
};


// ======================================================
// GET APPOINTMENT BY ID
// ======================================================

const getAppointment = (req, res) => {
  const appointmentId = req.params.id;

  const sql = `
    SELECT
      a.id,
      a.patient_id,
      a.hospital_id,
      h.name AS hospital_name,
      a.doctor_id,
      CONCAT(
        d.first_name,
        ' ',
        d.last_name
      ) AS doctor_name,
      a.hospital_service_id,
      ms.name AS service_name,
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
      a.updated_at
    FROM appointments a
    INNER JOIN hospitals h
      ON a.hospital_id = h.id
    INNER JOIN doctors d
      ON a.doctor_id = d.id
    INNER JOIN hospital_services hs
      ON a.hospital_service_id = hs.id
    INNER JOIN medical_services ms
      ON hs.service_id = ms.id
    WHERE a.id = ?
  `;

  db.query(
    sql,
    [appointmentId],
    (error, results) => {
      if (error) {
        console.error(
          "Get appointment error:",
          error.message
        );

        return res.status(500).json({
          message: "Failed to get appointment",
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          message: "Appointment not found",
        });
      }

      res.json(results[0]);
    }
  );
};


// ======================================================
// GET APPOINTMENT STATUS HISTORY
// ======================================================

const getAppointmentHistory = (req, res) => {
  const appointmentId = req.params.id;

  const sql = `
    SELECT
      ash.id,
      ash.appointment_id,
      ash.old_status,
      ash.new_status,
      ash.changed_by,
      u.name AS changed_by_name,
      ash.reason,
      ash.created_at
    FROM appointment_status_history ash
    LEFT JOIN users_tbl u
      ON ash.changed_by = u.id
    WHERE ash.appointment_id = ?
    ORDER BY ash.created_at ASC, ash.id ASC
  `;

  db.query(
    sql,
    [appointmentId],
    (error, results) => {
      if (error) {
        console.error(
          "Get appointment history error:",
          error.message
        );

        return res.status(500).json({
          message:
            "Failed to get appointment status history",
        });
      }

      res.json(results);
    }
  );
};


// ======================================================
// UPDATE APPOINTMENT STATUS
// ======================================================

const updateAppointmentStatus = (req, res) => {
  const appointmentId = req.params.id;

  const { status, reason } = req.body;

  const validStatuses = [
    "PENDING",
    "CONFIRMED",
    "CANCELLED",
    "COMPLETED",
    "NO_SHOW",
    "RESCHEDULED",
  ];

  if (!status) {
    return res.status(400).json({
      message: "status is required",
    });
  }

  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      message: "Invalid appointment status",
    });
  }

  if (
    status === "CANCELLED" &&
    !reason
  ) {
    return res.status(400).json({
      message:
        "Cancellation reason is required",
    });
  }

  if (
    req.user.role === "PATIENT" &&
    status !== "CANCELLED"
  ) {
    return res.status(403).json({
      message:
        "Patients can only cancel their own appointments.",
    });
  }

  const getSql = `
    SELECT
      id,
      status
    FROM appointments
    WHERE id = ?
  `;

  db.query(
    getSql,
    [appointmentId],
    (getError, appointmentResults) => {
      if (getError) {
        console.error(
          "Get appointment status error:",
          getError.message
        );

        return res.status(500).json({
          message:
            "Failed to get appointment",
        });
      }

      if (appointmentResults.length === 0) {
        return res.status(404).json({
          message:
            "Appointment not found",
        });
      }

      const oldStatus =
        appointmentResults[0].status;

      if (
        !isAllowedStatusTransition(
          oldStatus,
          status
        )
      ) {
        return res.status(400).json({
          message:
            `Invalid appointment status transition: ${oldStatus} -> ${status}.`,
        });
      }

      if (oldStatus === status) {
        return res.status(400).json({
          message:
            "Appointment already has this status",
        });
      }

      db.beginTransaction(
        (transactionError) => {
          if (transactionError) {
            console.error(
              "Begin status transaction error:",
              transactionError.message
            );

            return res.status(500).json({
              message:
                "Failed to update appointment status",
            });
          }

          const updateSql = `
            UPDATE appointments
            SET
              status = ?,
              cancellation_reason = ?
            WHERE id = ?
          `;

          const cancellationReason =
            status === "CANCELLED"
              ? reason
              : null;

          db.query(
            updateSql,
            [
              status,
              cancellationReason,
              appointmentId,
            ],
            (updateError, updateResult) => {
              if (updateError) {
                return db.rollback(() => {
                  console.error(
                    "Update appointment status error:",
                    updateError.message
                  );

                  res.status(500).json({
                    message:
                      "Failed to update appointment status",
                  });
                });
              }

              if (
                updateResult.affectedRows === 0
              ) {
                return db.rollback(() => {
                  res.status(404).json({
                    message:
                      "Appointment not found",
                  });
                });
              }

              const historySql = `
                INSERT INTO appointment_status_history (
                  appointment_id,
                  old_status,
                  new_status,
                  changed_by,
                  reason
                )
                VALUES (?, ?, ?, ?, ?)
              `;

              db.query(
                historySql,
                [
                  appointmentId,
                  oldStatus,
                  status,
                  req.user.id,
                  reason || null,
                ],
                (historyError) => {
                  if (historyError) {
                    return db.rollback(() => {
                      console.error(
                        "Create status history error:",
                        historyError.message
                      );

                      res.status(500).json({
                        message:
                          "Failed to record appointment status history",
                      });
                    });
                  }


                  // ==================================================
                  // CONFIRMED
                  // ==================================================

                  if (status === "CONFIRMED") {
                    /*
                      The appointment has been changed to CONFIRMED.

                      First create the in-app notification.
                    */

                    notificationService.notifyAppointmentConfirmed(
                      appointmentId,
                      (notificationError) => {
                        if (notificationError) {
                          return db.rollback(() => {
                            console.error(
                              "Appointment confirmation notification error:",
                              notificationError.message
                            );

                            res.status(500).json({
                              message:
                                "Failed to create appointment notification",
                            });
                          });
                        }

                        /*
                          Commit the appointment confirmation.

                          Once committed, the appointment is
                          officially CONFIRMED.
                        */

                        db.commit(
                          (commitError) => {
                            if (commitError) {
                              return db.rollback(
                                () => {
                                  console.error(
                                    "Commit status transaction error:",
                                    commitError.message
                                  );

                                  res.status(500).json({
                                    message:
                                      "Failed to complete status update",
                                  });
                                }
                              );
                            }


                            // ==========================================
                            // CREATE APPOINTMENT REMINDERS
                            // ==========================================

                            reminderService.createAppointmentReminders(
                              appointmentId,
                              (
                                reminderError,
                                reminderResult
                              ) => {
                                if (reminderError) {
                                  console.error(
                                    "Create appointment confirmation reminders error:",
                                    reminderError.message
                                  );
                                }


                                // ======================================
                                // GET PATIENT EMAIL INFORMATION
                                // ======================================

                                const emailSql = `
                                  SELECT
                                    u.email AS patient_email,
                                    u.name AS patient_name,
                                    h.name AS hospital_name,
                                    CONCAT(
                                      d.first_name,
                                      ' ',
                                      d.last_name
                                    ) AS doctor_name,
                                    ms.name AS service_name,
                                    DATE_FORMAT(
                                      a.appointment_date,
                                      '%Y-%m-%d'
                                    ) AS appointment_date,
                                    a.start_time
                                  FROM appointments a
                                  INNER JOIN patient_profiles pp
                                    ON a.patient_id = pp.id
                                  INNER JOIN users_tbl u
                                    ON pp.user_id = u.id
                                  INNER JOIN hospitals h
                                    ON a.hospital_id = h.id
                                  INNER JOIN doctors d
                                    ON a.doctor_id = d.id
                                  INNER JOIN hospital_services hs
                                    ON a.hospital_service_id = hs.id
                                  INNER JOIN medical_services ms
                                    ON hs.service_id = ms.id
                                  WHERE a.id = ?
                                `;

                                db.query(
                                  emailSql,
                                  [appointmentId],
                                  (
                                    emailDataError,
                                    emailResults
                                  ) => {
                                    if (
                                      emailDataError
                                    ) {
                                      console.error(
                                        "Get appointment email information error:",
                                        emailDataError.message
                                      );

                                      return res.json({
                                        message:
                                          "Appointment confirmed successfully, but email information could not be retrieved.",
                                        appointmentId:
                                          Number(
                                            appointmentId
                                          ),
                                        old_status:
                                          oldStatus,
                                        new_status:
                                          status,
                                        reminders_created:
                                          reminderResult
                                            ? reminderResult.remindersCreated
                                            : 0,
                                        email_sent:
                                          false,
                                        email_warning:
                                          emailDataError.message,
                                      });
                                    }

                                    if (
                                      emailResults.length ===
                                      0
                                    ) {
                                      return res.json({
                                        message:
                                          "Appointment confirmed successfully, but patient email information was not found.",
                                        appointmentId:
                                          Number(
                                            appointmentId
                                          ),
                                        old_status:
                                          oldStatus,
                                        new_status:
                                          status,
                                        reminders_created:
                                          reminderResult
                                            ? reminderResult.remindersCreated
                                            : 0,
                                        email_sent:
                                          false,
                                        email_warning:
                                          "Patient email information not found.",
                                      });
                                    }

                                    const appointmentEmailData =
                                      emailResults[0];


                                    // ==================================
                                    // SEND CONFIRMATION EMAIL
                                    // ==================================

                                    emailService.sendAppointmentConfirmationEmail(
                                      {
                                        recipientEmail:
                                          appointmentEmailData.patient_email,

                                        patientName:
                                          appointmentEmailData.patient_name,

                                        hospitalName:
                                          appointmentEmailData.hospital_name,

                                        doctorName:
                                          appointmentEmailData.doctor_name,

                                        serviceName:
                                          appointmentEmailData.service_name,

                                        appointmentDate:
                                          appointmentEmailData.appointment_date,

                                        startTime:
                                          appointmentEmailData.start_time,
                                      },
                                      (emailError) => {
                                        if (
                                          emailError
                                        ) {
                                          console.error(
                                            "Appointment confirmation email error:",
                                            emailError.message
                                          );

                                          return res.json({
                                            message:
                                              "Appointment confirmed successfully, but the confirmation email could not be sent.",

                                            appointmentId:
                                              Number(
                                                appointmentId
                                              ),

                                            old_status:
                                              oldStatus,

                                            new_status:
                                              status,

                                            reminders_created:
                                              reminderResult
                                                ? reminderResult.remindersCreated
                                                : 0,

                                            email_sent:
                                              false,

                                            email_warning:
                                              emailError.message,
                                          });
                                        }

                                        return res.json({
                                          message:
                                            "Appointment confirmed successfully.",

                                          appointmentId:
                                            Number(
                                              appointmentId
                                            ),

                                          old_status:
                                            oldStatus,

                                          new_status:
                                            status,

                                          reminders_created:
                                            reminderResult
                                              ? reminderResult.remindersCreated
                                              : 0,

                                          email_sent:
                                            true,
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

                    return;
                  }


                  // ==================================================
                  // CANCELLED
                  // ==================================================

                  if (status === "CANCELLED") {
                    db.commit(
                      (commitError) => {
                        if (commitError) {
                          return db.rollback(
                            () => {
                              console.error(
                                "Commit status transaction error:",
                                commitError.message
                              );

                              res.status(500).json({
                                message:
                                  "Failed to complete status update",
                              });
                            }
                          );
                        }

                        db.query(
                          `
                            UPDATE reminders
                            SET status = 'CANCELLED'
                            WHERE appointment_id = ?
                              AND status = 'PENDING'
                          `,
                          [appointmentId],
                          (reminderError) => {
                            if (reminderError) {
                              console.error(
                                "Cancel appointment reminders error:",
                                reminderError.message
                              );
                            }

                            notificationService.notifyAppointmentCancelled(
                              appointmentId,
                              reason,
                              (notificationError) => {
                                if (notificationError) {
                                  console.error(
                                    "Appointment cancellation notification error:",
                                    notificationError.message
                                  );
                                }

                                res.json({
                                  message:
                                    "Appointment status updated successfully",
                                  appointmentId:
                                    Number(
                                      appointmentId
                                    ),
                                  old_status:
                                    oldStatus,
                                  new_status:
                                    status,
                                });
                              }
                            );
                          }
                        );
                      }
                    );

                    return;
                  }


                  // ==================================================
                  // OTHER STATUS CHANGES
                  // ==================================================

                  db.commit(
                    (commitError) => {
                      if (commitError) {
                        return db.rollback(
                          () => {
                            console.error(
                              "Commit status transaction error:",
                              commitError.message
                            );

                            res.status(500).json({
                              message:
                                "Failed to complete status update",
                            });
                          }
                        );
                      }

                      res.json({
                        message:
                          "Appointment status updated successfully",

                        appointmentId:
                          Number(
                            appointmentId
                          ),

                        old_status:
                          oldStatus,

                        new_status:
                          status,
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
};


// ======================================================
// RESCHEDULE APPOINTMENT
// ======================================================

const rescheduleAppointment = (req, res) => {
  const appointmentId = req.params.id;

  const {
    appointment_date,
    start_time,
    reason,
  } = req.body;

  if (!appointment_date || !start_time) {
    return res.status(400).json({
      message:
        "appointment_date and start_time are required",
    });
  }

  const datePattern = /^\d{4}-\d{2}-\d{2}$/;

  if (!datePattern.test(appointment_date)) {
    return res.status(400).json({
      message:
        "appointment_date must use YYYY-MM-DD format",
    });
  }

  const getAppointmentSql = `
    SELECT
      a.id,
      a.status,
      a.doctor_id,
      a.hospital_id,
      a.hospital_service_id,
      hs.duration_minutes
    FROM appointments a
    INNER JOIN hospital_services hs
      ON a.hospital_service_id = hs.id
    WHERE a.id = ?
  `;

  db.query(
    getAppointmentSql,
    [appointmentId],
    (appointmentError, appointmentResults) => {
      if (appointmentError) {
        console.error(
          "Get appointment for reschedule error:",
          appointmentError.message
        );

        return res.status(500).json({
          message:
            "Failed to get appointment",
        });
      }

      if (appointmentResults.length === 0) {
        return res.status(404).json({
          message:
            "Appointment not found",
        });
      }

      const appointment =
        appointmentResults[0];

      if (
        appointment.status === "CANCELLED" ||
        appointment.status === "COMPLETED" ||
        appointment.status === "NO_SHOW"
      ) {
        return res.status(400).json({
          message:
            "This appointment cannot be rescheduled",
        });
      }

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
        )}:${String(mins).padStart(
          2,
          "0"
        )}:00`;
      };

      const startMinutes =
        timeToMinutes(start_time);

      const durationMinutes =
        appointment.duration_minutes;

      const endMinutes =
        startMinutes + durationMinutes;

      if (
        startMinutes < 0 ||
        endMinutes > 24 * 60
      ) {
        return res.status(400).json({
          message:
            "Invalid appointment time",
        });
      }

      const calculatedEndTime =
        minutesToTime(endMinutes);

      const date = new Date(
        `${appointment_date}T00:00:00`
      );

      const jsDay = date.getDay();

      const dayOfWeek =
        jsDay === 0 ? 7 : jsDay;

      const availabilitySql = `
        SELECT
          availability_type,
          day_of_week,
          specific_date,
          start_time,
          end_time
        FROM doctor_availability
        WHERE doctor_id = ?
          AND status = 'ACTIVE'
          AND (
            (
              availability_type = 'RECURRING'
              AND day_of_week = ?
            )
            OR
            (
              availability_type IN (
                'SPECIFIC_DATE',
                'BLOCKED'
              )
              AND specific_date = ?
            )
          )
        ORDER BY
          availability_type ASC,
          start_time ASC
      `;

      db.query(
        availabilitySql,
        [
          appointment.doctor_id,
          dayOfWeek,
          appointment_date,
        ],
        (
          availabilityError,
          availabilityResults
        ) => {
          if (availabilityError) {
            console.error(
              "Get reschedule availability error:",
              availabilityError.message
            );

            return res.status(500).json({
              message:
                "Failed to check doctor availability",
            });
          }

          const recurringPeriods =
            availabilityResults.filter(
              (item) =>
                item.availability_type ===
                "RECURRING"
            );

          const specificPeriods =
            availabilityResults.filter(
              (item) =>
                item.availability_type ===
                "SPECIFIC_DATE"
            );

          const blockedPeriods =
            availabilityResults.filter(
              (item) =>
                item.availability_type ===
                "BLOCKED"
            );

          const workingPeriods =
            specificPeriods.length > 0
              ? specificPeriods
              : recurringPeriods;

          if (workingPeriods.length === 0) {
            return res.status(409).json({
              message:
                "Doctor is not available on this date",
            });
          }

          const fitsWorkingHours =
            workingPeriods.some((period) => {
              if (
                !period.start_time ||
                !period.end_time
              ) {
                return false;
              }

              const periodStart =
                timeToMinutes(
                  period.start_time
                );

              const periodEnd =
                timeToMinutes(
                  period.end_time
                );

              return (
                startMinutes >= periodStart &&
                endMinutes <= periodEnd
              );
            });

          if (!fitsWorkingHours) {
            return res.status(409).json({
              message:
                "Selected time is outside the doctor's working hours",
            });
          }

          const conflictsWithBlockedPeriod =
            blockedPeriods.some((blocked) => {
              if (
                !blocked.start_time ||
                !blocked.end_time
              ) {
                return true;
              }

              const blockedStart =
                timeToMinutes(
                  blocked.start_time
                );

              const blockedEnd =
                timeToMinutes(
                  blocked.end_time
                );

              return (
                startMinutes < blockedEnd &&
                endMinutes > blockedStart
              );
            });

          if (conflictsWithBlockedPeriod) {
            return res.status(409).json({
              message:
                "Selected time is blocked",
            });
          }

          db.beginTransaction(
            (transactionError) => {
              if (transactionError) {
                console.error(
                  "Begin reschedule transaction error:",
                  transactionError.message
                );

                return res.status(500).json({
                  message:
                    "Failed to start rescheduling",
                });
              }

              const conflictSql = `
                SELECT
                  id,
                  start_time,
                  end_time,
                  status
                FROM appointments
                WHERE doctor_id = ?
                  AND appointment_date = ?
                  AND id <> ?
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
                  appointment.doctor_id,
                  appointment_date,
                  appointmentId,
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
                        "Reschedule conflict check error:",
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

                  const oldStatus =
                    appointment.status;

                  const updateSql = `
                    UPDATE appointments
                    SET
                      appointment_date = ?,
                      start_time = ?,
                      end_time = ?,
                      status = 'RESCHEDULED',
                      cancellation_reason = NULL
                    WHERE id = ?
                  `;

                  db.query(
                    updateSql,
                    [
                      appointment_date,
                      start_time,
                      calculatedEndTime,
                      appointmentId,
                    ],
                    (updateError) => {
                      if (updateError) {
                        return db.rollback(() => {
                          console.error(
                            "Reschedule appointment update error:",
                            updateError.message
                          );

                          res.status(500).json({
                            message:
                              "Failed to reschedule appointment",
                          });
                        });
                      }

                      const historySql = `
                        INSERT INTO appointment_status_history (
                          appointment_id,
                          old_status,
                          new_status,
                          changed_by,
                          reason
                        )
                        VALUES (?, ?, 'RESCHEDULED', ?, ?)
                      `;

                      db.query(
                        historySql,
                        [
                          appointmentId,
                          oldStatus,
                          req.user.id,
                          reason ||
                            "Appointment rescheduled",
                        ],
                        (historyError) => {
                          if (historyError) {
                            return db.rollback(() => {
                              console.error(
                                "Create reschedule history error:",
                                historyError.message
                              );

                              res.status(500).json({
                                message:
                                  "Failed to record reschedule history",
                              });
                            });
                          }

                          db.commit(
                            (commitError) => {
                              if (commitError) {
                                return db.rollback(
                                  () => {
                                    console.error(
                                      "Commit reschedule error:",
                                      commitError.message
                                    );

                                    res.status(500).json({
                                      message:
                                        "Failed to complete rescheduling",
                                    });
                                  }
                                );
                              }

                              db.query(
                                `
                                  UPDATE reminders
                                  SET status = 'CANCELLED'
                                  WHERE appointment_id = ?
                                    AND status = 'PENDING'
                                `,
                                [appointmentId],
                                (
                                  reminderCancelError
                                ) => {
                                  if (
                                    reminderCancelError
                                  ) {
                                    console.error(
                                      "Cancel old appointment reminders error:",
                                      reminderCancelError.message
                                    );

                                    return res.json({
                                      message:
                                        "Appointment rescheduled successfully, but old reminders could not be cancelled",

                                      appointmentId:
                                        Number(
                                          appointmentId
                                        ),

                                      old_status:
                                        oldStatus,

                                      new_status:
                                        "RESCHEDULED",

                                      appointment: {
                                        appointment_date,
                                        start_time,
                                        end_time:
                                          calculatedEndTime,
                                      },

                                      reminder_warning:
                                        reminderCancelError.message,
                                    });
                                  }

                                  reminderService.createAppointmentReminders(
                                    appointmentId,
                                    (
                                      reminderCreateError,
                                      reminderResult
                                    ) => {
                                      if (
                                        reminderCreateError
                                      ) {
                                        console.error(
                                          "Create new appointment reminders error:",
                                          reminderCreateError.message
                                        );

                                        return res.json({
                                          message:
                                            "Appointment rescheduled successfully, but new reminders could not be created",

                                          appointmentId:
                                            Number(
                                              appointmentId
                                            ),

                                          old_status:
                                            oldStatus,

                                          new_status:
                                            "RESCHEDULED",

                                          appointment: {
                                            appointment_date,
                                            start_time,
                                            end_time:
                                              calculatedEndTime,
                                          },

                                          reminder_warning:
                                            reminderCreateError.message,
                                        });
                                      }

                                      res.json({
                                        message:
                                          "Appointment rescheduled successfully",

                                        appointmentId:
                                          Number(
                                            appointmentId
                                          ),

                                        old_status:
                                          oldStatus,

                                        new_status:
                                          "RESCHEDULED",

                                        appointment: {
                                          appointment_date,
                                          start_time,
                                          end_time:
                                            calculatedEndTime,
                                        },

                                        reminders_created:
                                          reminderResult
                                            .remindersCreated,
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


module.exports = {
  getAppointment,
  getAppointmentHistory,
  updateAppointmentStatus,
  rescheduleAppointment,
};
