const express = require("express");

const {
  getAvailableSlots,
  createAppointment,
  getMyAppointments,
  getHospitalAppointments,
} = require("../controllers/appointmentController");

const {
  authenticateToken,
} = require("../middleware/authMiddleware");

const {
  requireRole,
} = require("../middleware/roleMiddleware");

const router = express.Router();


// ======================================================
// PATIENT APPOINTMENTS
// ======================================================

router.get(
  "/my",
  authenticateToken,
  requireRole("PATIENT"),
  getMyAppointments
);


// ======================================================
// AVAILABLE APPOINTMENT SLOTS
// ======================================================

router.get(
  "/available-slots",
  authenticateToken,
  requireRole("PATIENT"),
  getAvailableSlots
);


// ======================================================
// CREATE APPOINTMENT
// ======================================================

router.post(
  "/",
  authenticateToken,
  requireRole("PATIENT"),
  createAppointment
);


// ======================================================
// HOSPITAL APPOINTMENTS
// ======================================================
//
// Hospital staff can see appointments belonging
// to their own hospital only.
//
// The hospital ID is NOT taken from the frontend.
// The controller determines the hospital from
// the authenticated staff user's account.
//

router.get(
  "/hospital",
  authenticateToken,
  requireRole("HOSPITAL_STAFF"),
  getHospitalAppointments
);


module.exports = router;
