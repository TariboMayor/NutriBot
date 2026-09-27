const db = require("../config/db");

// Get appointment by ID
const getAppointment = (req, res) => {
  const appointmentId = req.params.id;

  const sql = `
    SELECT
      a.id,
      a.patient_id,
      a.hospital_id,
      h.name AS hospital_name,
      a.doctor_id,
      CONCAT(d.first_name, ' ', d.last_name) AS doctor_name,
      a.hospital_service_id,
      ms.name AS service_name,
      a.appointment_date,
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

  db.query(sql, [appointmentId], (error, results) => {
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
  });
};

// Get appointment status history
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

  db.query(sql, [appointmentId], (error, results) => {
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
  });
};

// Update appointment status
const updateAppointmentStatus = (req, res) => {
  const appointmentId = req.params.id;

  const {
    status,
    changed_by,
    reason,
  } = req.body;

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
      message:
        "Invalid appointment status",
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

  // Get current appointment status
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

      if (oldStatus === status) {
        return res.status(400).json({
          message:
            "Appointment already has this status",
        });
      }

      // Start transaction
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

              // Record status history
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
                  changed_by || null,
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

module.exports = {
  getAppointment,
  getAppointmentHistory,
  updateAppointmentStatus,
};