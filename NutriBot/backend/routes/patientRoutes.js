const express = require("express");

const {
  getPatientProfile,
  createPatientProfile,
  updatePatientProfile,
} = require("../controllers/patientController");

const {
  authenticateToken,
} = require("../middleware/authMiddleware");

const {
  requireRole,
} = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/:userId",
  authenticateToken,
  requireRole("PATIENT"),
  getPatientProfile
);

router.post(
  "/",
  authenticateToken,
  requireRole("PATIENT"),
  createPatientProfile
);

router.put(
  "/:userId",
  authenticateToken,
  requireRole("PATIENT"),
  updatePatientProfile
);

module.exports = router;