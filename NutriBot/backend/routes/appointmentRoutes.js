const express = require("express");

const {
  getAvailableSlots,
  createAppointment,
  getMyAppointments,
} = require("../controllers/appointmentController");

const {
  authenticateToken,
} = require("../middleware/authMiddleware");

const {
  requireRole,
} = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/my",
  authenticateToken,
  requireRole("PATIENT"),
  getMyAppointments
);

router.get(
  "/available-slots",
  authenticateToken,
  requireRole("PATIENT"),
  getAvailableSlots
);

router.post(
  "/",
  authenticateToken,
  requireRole("PATIENT"),
  createAppointment
);

module.exports = router;