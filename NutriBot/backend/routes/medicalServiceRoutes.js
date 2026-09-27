const express = require("express");

const {
  createMedicalService,
  getMedicalService,
  getMedicalServices,
  updateMedicalService,
  deactivateMedicalService,
} = require("../controllers/medicalServiceController");

const router = express.Router();

router.post("/", createMedicalService);
router.get("/", getMedicalServices);
router.get("/:id", getMedicalService);
router.put("/:id", updateMedicalService);
router.delete("/:id", deactivateMedicalService);

module.exports = router;