const express = require("express");

const {
  getPatientProfile,
  createPatientProfile,
  updatePatientProfile,
} = require("../controllers/patientController");

const router = express.Router();

router.get("/:userId", getPatientProfile);

router.post("/", createPatientProfile);

router.put("/:userId", updatePatientProfile);

module.exports = router;