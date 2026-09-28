const db = require("../config/db");
const notificationService = require("./notificationService");

const processDueReminders = (callback) => {
  const sql = `
    SELECT
      r.id,
      r.appointment_id,
      r.reminder_type,
      r.scheduled_for
    FROM reminders r
    INNER JOIN appointments a
      ON r.appointment_id = a.id
    WHERE r.status = 'PENDING'
      AND r.scheduled_for <= CURRENT_TIMESTAMP
      AND a.status IN ('PENDING', 'CONFIRMED', 'RESCHEDULED')
    ORDER BY r.scheduled_for ASC
  `;

  db.query(sql, (error, reminders) => {
    if (error) {
      console.error("Get due reminders error:", error.message);
      return callback(error);
    }

    if (reminders.length === 0) {
      return callback(null, {
        processed: 0,
        message: "No due reminders found",
      });
    }

    let processed = 0;
    let failed = 0;

    const processNext = (index) => {
      if (index >= reminders.length) {
        return callback(null, {
          processed,
          failed,
        });
      }

      const reminder = reminders[index];

      notificationService.notifyAppointmentReminder(
        reminder.appointment_id,
        reminder.reminder_type,
        (notificationError) => {
          if (notificationError) {
            console.error(
              `Reminder ${reminder.id} notification error:`,
              notificationError.message
            );

            db.query(
              `
                UPDATE reminders
                SET status = 'FAILED'
                WHERE id = ?
              `,
              [reminder.id],
              () => {
                failed++;
                processNext(index + 1);
              }
            );

            return;
          }

          db.query(
            `
              UPDATE reminders
              SET
                status = 'SENT',
                sent_at = CURRENT_TIMESTAMP
              WHERE id = ?
            `,
            [reminder.id],
            (updateError) => {
              if (updateError) {
                console.error(
                  `Update reminder ${reminder.id} error:`,
                  updateError.message
                );

                failed++;
              } else {
                processed++;
              }

              processNext(index + 1);
            }
          );
        }
      );
    };

    processNext(0);
  });
};

module.exports = {
  processDueReminders,
};