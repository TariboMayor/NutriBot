const express = require("express");

const {
  getAvailableSlots,
  createAppointment,
  getMyAppointments,
  getHospitalAppointments,
  replyToAppointment,
} = require("../controllers/appointmentController");

const {
  authenticateToken,
} = require("../middleware/authMiddleware");

const {
  requireRole,
} = require("../middleware/roleMiddleware");

const router = express.Router();


/*
=========================================================
PATIENT ROUTES
=========================================================
*/


/*
 * Get patient's appointments
 */
router.get(
  "/my",
  authenticateToken,
  requireRole("PATIENT"),
  getMyAppointments
);


/*
 * Get available appointment slots
 */
router.get(
  "/available-slots",
  authenticateToken,
  requireRole("PATIENT"),
  getAvailableSlots
);


/*
 * Create a new appointment
 */
router.post(
  "/",
  authenticateToken,
  requireRole("PATIENT"),
  createAppointment
);


/*
=========================================================
HOSPITAL STAFF ROUTES
=========================================================
*/


/*
 * Get appointments belonging to the
 * authenticated hospital staff member's hospital.
 */
router.get(
  "/hospital",
  authenticateToken,
  requireRole("HOSPITAL_STAFF"),
  getHospitalAppointments
);


/*
 * Hospital staff reply to a patient's appointment.
 *
 * This will:
 * - save the message
 * - save the message recipient
 * - create an in-app notification
 * - save the notification recipient
 * - send an email to the patient
 */
router.post(
  "/:appointmentId/reply",
  authenticateToken,
  requireRole("HOSPITAL_STAFF"),
  replyToAppointment
);


module.exports = router;
