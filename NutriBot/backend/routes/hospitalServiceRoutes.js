const express = require("express");

const {
  addHospitalService,
  getHospitalService,
  getHospitalServices,
  updateHospitalService,
  deactivateHospitalService,
} = require("../controllers/hospitalServiceController");

const router = express.Router();

router.post("/", addHospitalService);
router.get("/hospital/:hospitalId", getHospitalServices);
router.get("/:id", getHospitalService);
router.put("/:id", updateHospitalService);
router.delete("/:id", deactivateHospitalService);

module.exports = router;