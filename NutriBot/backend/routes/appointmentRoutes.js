const express = require("express");

const {
  getAvailableSlots,
  createAppointment,
} = require("../controllers/appointmentController");

const router = express.Router();

router.get(
  "/available-slots",
  getAvailableSlots
);

router.post(
  "/",
  createAppointment
);

module.exports = router;