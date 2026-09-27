const express = require("express");

const {
  getAppointment,
  getAppointmentHistory,
  updateAppointmentStatus,
} = require("../controllers/appointmentStatusController");

const router = express.Router();

router.get("/:id", getAppointment);

router.get(
  "/:id/history",
  getAppointmentHistory
);

router.put(
  "/:id/status",
  updateAppointmentStatus
);

module.exports = router;