const db = require("../config/db");

const createPersonalReminder = (
  userId,
  reminderData,
  callback
) => {
  const {
    title,
    description,
    reminder_type,
    scheduled_for,
    frequency,
  } = reminderData;

  const sql = `
    INSERT INTO personal_reminders (
      user_id,
      title,
      description,
      reminder_type,
      scheduled_for,
      frequency,
      status
    )
    VALUES (?, ?, ?, ?, ?, ?, 'PENDING')
  `;

  db.query(
    sql,
    [
      userId,
      title,
      description || null,
      reminder_type || "CUSTOM",
      scheduled_for,
      frequency || "ONCE",
    ],
    (error, result) => {
      if (error) {
        console.error(
          "Create personal reminder error:",
          error.message
        );

        return callback(error);
      }

      callback(null, {
        id: result.insertId,
        message: "Personal reminder created successfully",
      });
    }
  );
};

const getPersonalReminders = (
  userId,
  callback
) => {
  const sql = `
    SELECT
      id,
      user_id,
      title,
      description,
      reminder_type,
      scheduled_for,
      frequency,
      status,
      completed_at,
      created_at,
      updated_at
    FROM personal_reminders
    WHERE user_id = ?
      AND status != 'CANCELLED'
    ORDER BY
      status = 'COMPLETED',
      scheduled_for ASC
  `;

  db.query(
    sql,
    [userId],
    (error, results) => {
      if (error) {
        console.error(
          "Get personal reminders error:",
          error.message
        );

        return callback(error);
      }

      callback(null, results);
    }
  );
};

const completePersonalReminder = (
  userId,
  reminderId,
  callback
) => {
  const sql = `
    UPDATE personal_reminders
    SET
      status = 'COMPLETED',
      completed_at = CURRENT_TIMESTAMP
    WHERE id = ?
      AND user_id = ?
      AND status = 'PENDING'
  `;

  db.query(
    sql,
    [reminderId, userId],
    (error, result) => {
      if (error) {
        console.error(
          "Complete personal reminder error:",
          error.message
        );

        return callback(error);
      }

      if (result.affectedRows === 0) {
        return callback(
          new Error(
            "Reminder not found or already completed"
          )
        );
      }

      callback(null, {
        message:
          "Personal reminder completed successfully",
      });
    }
  );
};

const cancelPersonalReminder = (
  userId,
  reminderId,
  callback
) => {
  const sql = `
    UPDATE personal_reminders
    SET status = 'CANCELLED'
    WHERE id = ?
      AND user_id = ?
      AND status = 'PENDING'
  `;

  db.query(
    sql,
    [reminderId, userId],
    (error, result) => {
      if (error) {
        console.error(
          "Cancel personal reminder error:",
          error.message
        );

        return callback(error);
      }

      if (result.affectedRows === 0) {
        return callback(
          new Error(
            "Reminder not found or already completed"
          )
        );
      }

      callback(null, {
        message:
          "Personal reminder cancelled successfully",
      });
    }
  );
};

module.exports = {
  createPersonalReminder,
  getPersonalReminders,
  completePersonalReminder,
  cancelPersonalReminder,
};