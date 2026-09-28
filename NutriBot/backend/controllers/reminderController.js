const db = require("../config/db");
const reminderService = require("../services/reminderService");
const reminderProcessor = require("../services/reminderProcessor");

// Create reminders for an appointment
const createReminders = (req, res) => {
  const appointmentId = req.params.appointmentId;

  reminderService.createAppointmentReminders(
    appointmentId,
    (error, result) => {
      if (error) {
        console.error("Create reminders error:", error.message);

        return res.status(400).json({
          message: error.message,
        });
      }

      res.status(201).json({
        message: "Appointment reminders created successfully",
        ...result,
      });
    }
  );
};

// Get reminders for an appointment
const getAppointmentReminders = (req, res) => {
  const appointmentId = req.params.appointmentId;

  const sql = `
    SELECT
      id,
      appointment_id,
      reminder_type,
      scheduled_for,
      status,
      sent_at,
      created_at
    FROM reminders
    WHERE appointment_id = ?
    ORDER BY scheduled_for ASC
  `;

  db.query(sql, [appointmentId], (error, results) => {
    if (error) {
      console.error(
        "Get appointment reminders error:",
        error.message
      );

      return res.status(500).json({
        message: "Failed to get appointment reminders",
      });
    }

    res.json(results);
  });
};

// Process reminders that are currently due
const processDueReminders = (req, res) => {
  reminderProcessor.processDueReminders((error, result) => {
    if (error) {
      console.error(
        "Process due reminders error:",
        error.message
      );

      return res.status(500).json({
        message: "Failed to process due reminders",
        error: error.message,
      });
    }

    res.json(result);
  });
};

module.exports = {
  createReminders,
  getAppointmentReminders,
  processDueReminders,
};