const db = require("../config/db");

const REMINDER_TYPES = [
  {
    type: "24_HOURS",
    minutesBefore: 24 * 60,
  },
  {
    type: "12_HOURS",
    minutesBefore: 12 * 60,
  },
  {
    type: "2_HOURS",
    minutesBefore: 2 * 60,
  },
  {
    type: "1_HOUR",
    minutesBefore: 60,
  },
];

const createAppointmentReminders = (
  appointmentId,
  callback
) => {
  const appointmentSql = `
    SELECT
      id,
      DATE_FORMAT(
        appointment_date,
        '%Y-%m-%d'
      ) AS appointment_date,
      start_time,
      status
    FROM appointments
    WHERE id = ?
  `;

  db.query(
    appointmentSql,
    [appointmentId],
    (error, results) => {
      if (error) {
        console.error(
          "Get appointment for reminders error:",
          error.message
        );

        return callback(error);
      }

      if (results.length === 0) {
        return callback(
          new Error("Appointment not found")
        );
      }

      const appointment = results[0];

      /*
        These appointment statuses should not
        receive reminders.
      */
      if (
        appointment.status === "CANCELLED" ||
        appointment.status === "COMPLETED" ||
        appointment.status === "NO_SHOW"
      ) {
        return callback(
          new Error(
            "This appointment is not eligible for reminders"
          )
        );
      }

      const appointmentDate =
        appointment.appointment_date;

      const appointmentTime =
        String(
          appointment.start_time
        ).substring(0, 8);

      const appointmentDateTime = new Date(
        `${appointmentDate}T${appointmentTime}`
      );

      if (
        Number.isNaN(
          appointmentDateTime.getTime()
        )
      ) {
        return callback(
          new Error(
            "Invalid appointment date or time"
          )
        );
      }

      /*
        Calculate all four reminder times.
      */
      const remindersToCreate =
        REMINDER_TYPES.map(
          (reminder) => {
            const scheduledFor =
              new Date(
                appointmentDateTime.getTime() -
                  reminder.minutesBefore *
                    60 *
                    1000
              );

            return {
              type: reminder.type,
              scheduledFor,
            };
          }
        );

      /*
        Only active reminder records should
        prevent duplicate creation.

        PENDING = active
        SENT = historical but already processed
        CANCELLED = historical and should NOT
        block creation of a new reminder.
      */
      const checkSql = `
        SELECT
          reminder_type,
          scheduled_for,
          status
        FROM reminders
        WHERE appointment_id = ?
          AND status IN ('PENDING', 'SENT')
      `;

      db.query(
        checkSql,
        [appointmentId],
        (
          checkError,
          existingReminders
        ) => {
          if (checkError) {
            console.error(
              "Check existing reminders error:",
              checkError.message
            );

            return callback(checkError);
          }

          const remindersToInsert =
            remindersToCreate
              .filter((reminder) => {
                return !existingReminders.some(
                  (existing) => {
                    const existingScheduledFor =
                      new Date(
                        existing.scheduled_for
                      );

                    return (
                      existing.reminder_type ===
                        reminder.type &&
                      existingScheduledFor.getTime() ===
                        reminder.scheduledFor.getTime()
                    );
                  }
                );
              })
              .map((reminder) => [
                appointmentId,
                reminder.type,
                reminder.scheduledFor,
                "PENDING",
              ]);

          /*
            Nothing new needs to be created.
          */
          if (
            remindersToInsert.length === 0
          ) {
            return callback(null, {
              appointmentId,
              remindersCreated: 0,
              message:
                "Reminders already exist for this appointment schedule",
            });
          }

          const insertSql = `
            INSERT INTO reminders (
              appointment_id,
              reminder_type,
              scheduled_for,
              status
            )
            VALUES ?
          `;

          db.query(
            insertSql,
            [remindersToInsert],
            (insertError, result) => {
              if (insertError) {
                console.error(
                  "Create appointment reminders error:",
                  insertError.message
                );

                return callback(
                  insertError
                );
              }

              callback(null, {
                appointmentId,
                remindersCreated:
                  result.affectedRows,
                message:
                  "Appointment reminders created successfully",
              });
            }
          );
        }
      );
    }
  );
};

module.exports = {
  createAppointmentReminders,
};