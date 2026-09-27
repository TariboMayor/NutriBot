const express = require("express");

const {
  assignDoctorService,
  getDoctorService,
  getDoctorServices,
  getServiceDoctors,
  updateDoctorService,
  deactivateDoctorService,
} = require("../controllers/doctorServiceController");

const router = express.Router();

router.post("/", assignDoctorService);

router.get("/doctor/:doctorId", getDoctorServices);

router.get(
  "/hospital-service/:hospitalServiceId",
  getServiceDoctors
);

router.get("/:id", getDoctorService);

router.put("/:id", updateDoctorService);

router.delete("/:id", deactivateDoctorService);

module.exports = router;