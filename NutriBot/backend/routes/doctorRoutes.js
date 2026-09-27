const express = require("express");

const {
  createDoctor,
  getDoctor,
  getHospitalDoctors,
  updateDoctor,
  deactivateDoctor,
} = require("../controllers/doctorController");

const router = express.Router();

router.post("/", createDoctor);

router.get("/hospital/:hospitalId", getHospitalDoctors);

router.get("/:id", getDoctor);

router.put("/:id", updateDoctor);

router.delete("/:id", deactivateDoctor);

module.exports = router;