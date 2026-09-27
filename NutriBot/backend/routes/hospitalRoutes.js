const express = require("express");

const {
  createHospital,
  getHospital,
  updateHospital,
} = require("../controllers/hospitalController");

const router = express.Router();

router.post("/", createHospital);

router.get("/:id", getHospital);

router.put("/:id", updateHospital);

module.exports = router;
