const express = require("express");

const {
  addHospitalStaff,
  getHospitalStaff,
  updateHospitalStaff,
  deactivateHospitalStaff,
} = require("../controllers/hospitalStaffController");

const router = express.Router();

router.post("/", addHospitalStaff);

router.get("/hospital/:hospitalId", getHospitalStaff);

router.put("/:id", updateHospitalStaff);

router.delete("/:id", deactivateHospitalStaff);

module.exports = router;