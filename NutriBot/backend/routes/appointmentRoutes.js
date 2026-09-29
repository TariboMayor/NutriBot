const express = require("express");

const {
  getAvailableSlots,
  createAppointment,
} = require("../controllers/appointmentController");

const {
  authenticateToken,
} = require("../middleware/authMiddleware");

const {
  requireRole,
} = require("../middleware/roleMiddleware");

const router = express.Router();

/*
  Appointment availability is currently part of the
  patient booking flow.

  Only authenticated patients can request booking
  availability.
*/
router.get(
  "/available-slots",
  authenticateToken,
  requireRole("PATIENT"),
  getAvailableSlots
);

/*
  Only authenticated patients can create appointments.

  The controller gets the patient's identity from
  req.user.id rather than trusting patient_id
  supplied by the client.
*/
router.post(
  "/",
  authenticateToken,
  requireRole("PATIENT"),
  createAppointment
);

module.exports = router;