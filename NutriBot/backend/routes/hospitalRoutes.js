const express = require("express");

const {
  createHospital,
  getHospitals,
  searchHospitals,
  getHospital,
  updateHospital,
} = require("../controllers/hospitalController");

const router = express.Router();

/* ========================================
   HOSPITAL ROUTES
======================================== */

router.post("/", createHospital);

router.get("/", getHospitals);

/*
   IMPORTANT:
   /search MUST come before /:id
   so "search" is not treated as a hospital ID.
*/
router.get("/search", searchHospitals);

router.get("/:id", getHospital);

router.put("/:id", updateHospital);

module.exports = router;
