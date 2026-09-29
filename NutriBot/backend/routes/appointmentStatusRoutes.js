const express = require("express");

const {
  getAppointment,
  getAppointmentHistory,
  updateAppointmentStatus,
  rescheduleAppointment,
} = require("../controllers/appointmentStatusController");

const {
  authenticateToken,
} = require("../middleware/authMiddleware");

const {
  requireRole,
} = require("../middleware/roleMiddleware");

const {
  authorizeAppointmentAccess,
} = require("../middleware/appointmentAuthorizationMiddleware");

const router = express.Router();

/*
  Patients can view their own appointments.
  Admins can view appointments.
*/
router.get(
  "/:id",
  authenticateToken,
  requireRole(
    "PATIENT",
    "HOSPITAL_STAFF",
    "ADMIN"
  ),
  authorizeAppointmentAccess({
    allowPatient: true,
    allowHospitalStaff: true,
    allowAdmin: true,
  }),
  getAppointment
);

/*
  Patients can view their own appointment history.
  Admins can view appointment history.
*/
router.get(
  "/:id/history",
  authenticateToken,
  requireRole(
    "PATIENT",
    "HOSPITAL_STAFF",
    "ADMIN"
  ),
  authorizeAppointmentAccess({
    allowPatient: true,
    allowHospitalStaff: true,
    allowAdmin: true,
  }),
  getAppointmentHistory
);

/*
  Status changes:

  Patients are allowed into the controller because
  they may cancel their own appointments.

  Hospital staff can manage appointments belonging
  to their hospital.

  Admins can manage all appointments.
*/
router.put(
  "/:id/status",
  authenticateToken,
  requireRole(
    "PATIENT",
    "HOSPITAL_STAFF",
    "ADMIN"
  ),
  authorizeAppointmentAccess({
    allowPatient: true,
    allowHospitalStaff: true,
    allowAdmin: true,
  }),
  updateAppointmentStatus
);

/*
  Patients can reschedule their own appointments.

  Hospital staff can reschedule appointments
  belonging to their hospital.

  Admins can reschedule any appointment.
*/
router.put(
  "/:id/reschedule",
  authenticateToken,
  requireRole(
    "PATIENT",
    "HOSPITAL_STAFF",
    "ADMIN"
  ),
  authorizeAppointmentAccess({
    allowPatient: true,
    allowHospitalStaff: true,
    allowAdmin: true,
  }),
  rescheduleAppointment
);

module.exports = router;