const express = require("express");

const router = express.Router();

const {
  authenticateToken,
} = require("../middleware/authMiddleware");

const {
  requireRole,
} = require("../middleware/roleMiddleware");

const {
  getDoctorAvailability,
  saveWeeklySchedule,
  addDoctorLeave,
  removeDoctorAvailability,
} = require("../controllers/doctorAvailabilityController");

/*
========================================================
HOSPITAL STAFF
========================================================
*/

/*
  Get doctor's complete availability
*/
router.get(
  "/doctor/:doctorId",
  authenticateToken,
  requireRole("HOSPITAL_STAFF"),
  getDoctorAvailability
);

/*
  Save doctor's weekly schedule
*/
router.put(
  "/doctor/:doctorId/schedule",
  authenticateToken,
  requireRole("HOSPITAL_STAFF"),
  saveWeeklySchedule
);

/*
  Add doctor leave / blocked date
*/
router.post(
  "/doctor/:doctorId/leave",
  authenticateToken,
  requireRole("HOSPITAL_STAFF"),
  addDoctorLeave
);

/*
  Remove doctor leave
*/
router.delete(
  "/:availabilityId",
  authenticateToken,
  requireRole("HOSPITAL_STAFF"),
  removeDoctorAvailability
);

module.exports = router;