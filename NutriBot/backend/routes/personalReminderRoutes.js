const express = require("express");

const {
  authenticateToken,
} = require("../middleware/authMiddleware");

const {
  createPersonalReminder,
  getMyPersonalReminders,
  completePersonalReminder,
  cancelPersonalReminder,
} = require("../controllers/personalReminderController");

const router = express.Router();

// Get current user's reminders
router.get(
  "/my",
  authenticateToken,
  getMyPersonalReminders
);

// Create a personal reminder
router.post(
  "/",
  authenticateToken,
  createPersonalReminder
);

// Mark reminder as completed
router.patch(
  "/:id/complete",
  authenticateToken,
  completePersonalReminder
);

// Cancel a reminder
router.patch(
  "/:id/cancel",
  authenticateToken,
  cancelPersonalReminder
);

module.exports = router;
