const express = require("express");

const {
  addHospitalService,
  getHospitalService,
  getHospitalServices,
  getMyHospitalServices,
  getMedicalServiceCatalogue,
  updateHospitalService,
  deactivateHospitalService,
} = require("../controllers/hospitalServiceController");

const {
  authenticateToken,
} = require("../middleware/authMiddleware");

const {
  requireRole,
} = require("../middleware/roleMiddleware");

const router = express.Router();


/*
 * =================================================
 * ADD HOSPITAL SERVICE
 * =================================================
 *
 * Hospital staff and administrators
 * can add services.
 */

router.post(
  "/",
  authenticateToken,
  requireRole(
    "HOSPITAL_STAFF",
    "ADMIN"
  ),
  addHospitalService
);


/*
 * =================================================
 * CURRENT HOSPITAL SERVICES
 * =================================================
 *
 * Hospital staff can get their own
 * hospital's services.
 *
 * IMPORTANT:
 * This route must come BEFORE
 * /hospital/:hospitalId.
 */

router.get(
  "/hospital/current",
  authenticateToken,
  requireRole("HOSPITAL_STAFF"),
  getMyHospitalServices
);


/*
 * =================================================
 * MEDICAL SERVICE CATALOGUE
 * =================================================
 *
 * Returns the master list of medical services
 * from the medical_services table.
 *
 * This is used when hospital staff want to
 * choose a medical service to add to their
 * hospital.
 */

router.get(
  "/catalogue",
  getMedicalServiceCatalogue
);


/*
 * =================================================
 * HOSPITAL SERVICES
 * =================================================
 *
 * Patients need this endpoint when selecting
 * services for a doctor.
 */

router.get(
  "/hospital/:hospitalId",
  getHospitalServices
);


/*
 * =================================================
 * GET ONE HOSPITAL SERVICE
 * =================================================
 */

router.get(
  "/:id",
  getHospitalService
);


/*
 * =================================================
 * UPDATE HOSPITAL SERVICE
 * =================================================
 */

router.put(
  "/:id",
  authenticateToken,
  requireRole(
    "HOSPITAL_STAFF",
    "ADMIN"
  ),
  updateHospitalService
);


/*
 * =================================================
 * DEACTIVATE HOSPITAL SERVICE
 * =================================================
 */

router.delete(
  "/:id",
  authenticateToken,
  requireRole(
    "HOSPITAL_STAFF",
    "ADMIN"
  ),
  deactivateHospitalService
);


module.exports = router;
