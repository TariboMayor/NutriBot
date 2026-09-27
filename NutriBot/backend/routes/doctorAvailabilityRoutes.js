const express = require("express");

const {
  createDoctorAvailability,
  getDoctorAvailability,
  getDoctorAvailabilities,
  updateDoctorAvailability,
  deactivateDoctorAvailability,
} = require("../controllers/doctorAvailabilityController");

const router = express.Router();

router.post("/", createDoctorAvailability);

router.get(
  "/doctor/:doctorId",
  getDoctorAvailabilities
);

router.get("/:id", getDoctorAvailability);

router.put("/:id", updateDoctorAvailability);

router.delete(
  "/:id",
  deactivateDoctorAvailability
);

module.exports = router;