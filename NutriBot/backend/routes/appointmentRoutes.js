const express = require("express");

const router = express.Router();

const {
  authenticateToken,
} = require("../middleware/authMiddleware");

const {
  requireRole,
} = require("../middleware/roleMiddleware");

const {
  getAvailableSlots,
  createAppointment,
  getMyAppointments,
  getHospitalAppointments,
  replyToAppointment,
} = require("../controllers/appointmentController");


/* =========================================================
   PATIENT APPOINTMENT ROUTES
========================================================= */


/*
 * GET MY APPOINTMENTS
 */
router.get(
  "/my",
  authenticateToken,
  requireRole("PATIENT"),
  getMyAppointments
);


/*
 * GET AVAILABLE APPOINTMENT SLOTS
 */
router.get(
  "/available-slots",
  authenticateToken,
  requireRole("PATIENT"),
  getAvailableSlots
);


/*
 * CREATE APPOINTMENT
 */
router.post(
  "/",
  authenticateToken,
  requireRole("PATIENT"),
  createAppointment
);


/* =========================================================
   HOSPITAL APPOINTMENT ROUTES
========================================================= */


/*
 * GET HOSPITAL APPOINTMENTS
 */
router.get(
  "/hospital",
  authenticateToken,
  requireRole("HOSPITAL_STAFF"),
  getHospitalAppointments
);


/*
 * HOSPITAL REPLY TO PATIENT
 */
router.post(
  "/:appointmentId/reply",
  authenticateToken,
  requireRole("HOSPITAL_STAFF"),
  replyToAppointment
);


/*
 * IMPORTANT:
 * Export the router itself.
 */
module.exports = router;
