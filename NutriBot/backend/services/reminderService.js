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

const createAppointmentReminders = (appointmentId, callback) => {
  const appointmentSql = `
    SELECT
      id,
      appointment_date,
      start_time,
      status
    FROM appointments
    WHERE id = ?
  `;

  db.query(appointmentSql, [appointmentId], (error, results) => {
    if (error) {
      console.error("Get appointment for reminders error:", error.message);
      return callback(error);
    }

    if (results.length === 0) {
      return callback(new Error("Appointment not found"));
    }

    const appointment = results[0];

    if (appointment.status === "CANCELLED") {
      return callback(new Error("Cancelled appointments cannot have reminders"));
    }

    const appointmentDateTime = new Date(
      `${appointment.appointment_date
        .toISOString()
        .split("T")[0]}T${appointment.start_time}`
    );

    const reminders = REMINDER_TYPES.map((reminder) => {
      const scheduledFor = new Date(
        appointmentDateTime.getTime() -
          reminder.minutesBefore * 60 * 1000
      );

      return [
        appointmentId,
        reminder.type,
        scheduledFor,
        "PENDING",
      ];
    });

    const insertSql = `
      INSERT INTO reminders (
        appointment_id,
        reminder_type,
        scheduled_for,
        status
      )
      VALUES ?
    `;

    db.query(insertSql, [reminders], (insertError, result) => {
      if (insertError) {
        console.error("Create appointment reminders error:", insertError.message);
        return callback(insertError);
      }

      callback(null, {
        appointmentId,
        remindersCreated: result.affectedRows,
      });
    });
  });
};

module.exports = {
  createAppointmentReminders,
};