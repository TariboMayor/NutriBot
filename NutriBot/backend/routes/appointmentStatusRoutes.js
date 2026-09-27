const express = require("express");

const {
  getAppointment,
  getAppointmentHistory,
  updateAppointmentStatus,
  rescheduleAppointment,
} = require("../controllers/appointmentStatusController");

const router = express.Router();

router.get(
  "/:id/history",
  getAppointmentHistory
);

router.get(
  "/:id",
  getAppointment
);

router.put(
  "/:id/status",
  updateAppointmentStatus
);

router.put(
  "/:id/reschedule",
  rescheduleAppointment
);

module.exports = router;