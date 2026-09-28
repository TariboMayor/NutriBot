const express = require("express");

const {
  createReminders,
  getAppointmentReminders,
  processDueReminders,
} = require("../controllers/reminderController");

const router = express.Router();

// Create reminders for an appointment
router.post(
  "/appointment/:appointmentId/create",
  createReminders
);

// Get reminders for an appointment
router.get(
  "/appointment/:appointmentId",
  getAppointmentReminders
);

// Process reminders that are currently due
router.post(
  "/process",
  processDueReminders
);

module.exports = router;