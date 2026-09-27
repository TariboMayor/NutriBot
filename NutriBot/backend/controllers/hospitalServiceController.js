const db = require("../config/db");

// Add a medical service to a hospital
const addHospitalService = (req, res) => {
  const {
    hospital_id,
    service_id,
    duration_minutes,
    price,
  } = req.body;

  if (!hospital_id || !service_id) {
    return res.status(400).json({
      message: "hospital_id and service_id are required",
    });
  }

  const sql = `
    INSERT INTO hospital_services (
      hospital_id,
      service_id,
      duration_minutes,
      price,
      status
    )
    VALUES (?, ?, ?, ?, 'ACTIVE')
  `;

  const values = [
    hospital_id,
    service_id,
    duration_minutes || 30,
    price ?? null,
  ];

  db.query(sql, values, (error, result) => {
    if (error) {
      console.error("Add hospital service error:", error.message);

      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
          message: "This service is already added to the hospital",
        });
      }

      return res.status(500).json({
        message: "Failed to add hospital service",
      });
    }

    res.status(201).json({
      message: "Hospital service added successfully",
      hospitalServiceId: result.insertId,
    });
  });
};

// Get one hospital service
const getHospitalService = (req, res) => {
  const hospitalServiceId = req.params.id;

  const sql = `
    SELECT
      hs.id,
      hs.hospital_id,
      h.name AS hospital_name,
      hs.service_id,
      ms.name AS service_name,
      ms.description,
      ms.category,
      hs.duration_minutes,
      hs.price,
      hs.status,
      hs.created_at,
      hs.updated_at
    FROM hospital_services hs
    INNER JOIN hospitals h
      ON hs.hospital_id = h.id
    INNER JOIN medical_services ms
      ON hs.service_id = ms.id
    WHERE hs.id = ?
  `;

  db.query(sql, [hospitalServiceId], (error, results) => {
    if (error) {
      console.error("Get hospital service error:", error.message);

      return res.status(500).json({
        message: "Failed to get hospital service",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "Hospital service not found",
      });
    }

    res.json(results[0]);
  });
};

// Get all services offered by a hospital
const getHospitalServices = (req, res) => {
  const hospitalId = req.params.hospitalId;

  const sql = `
    SELECT
      hs.id,
      hs.hospital_id,
      hs.service_id,
      ms.name AS service_name,
      ms.description,
      ms.category,
      hs.duration_minutes,
      hs.price,
      hs.status,
      hs.created_at,
      hs.updated_at
    FROM hospital_services hs
    INNER JOIN medical_services ms
      ON hs.service_id = ms.id
    WHERE hs.hospital_id = ?
    ORDER BY ms.name ASC
  `;

  db.query(sql, [hospitalId], (error, results) => {
    if (error) {
      console.error("Get hospital services error:", error.message);

      return res.status(500).json({
        message: "Failed to get hospital services",
      });
    }

    res.json(results);
  });
};

// Update hospital service
const updateHospitalService = (req, res) => {
  const hospitalServiceId = req.params.id;

  const {
    duration_minutes,
    price,
    status,
  } = req.body;

  if (
    duration_minutes === undefined &&
    price === undefined &&
    status === undefined
  ) {
    return res.status(400).json({
      message: "At least one hospital service field is required",
    });
  }

  const sql = `
    UPDATE hospital_services
    SET
      duration_minutes = COALESCE(?, duration_minutes),
      price = COALESCE(?, price),
      status = COALESCE(?, status)
    WHERE id = ?
  `;

  const values = [
    duration_minutes ?? null,
    price ?? null,
    status ?? null,
    hospitalServiceId,
  ];

  db.query(sql, values, (error, result) => {
    if (error) {
      console.error("Update hospital service error:", error.message);

      return res.status(500).json({
        message: "Failed to update hospital service",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Hospital service not found",
      });
    }

    res.json({
      message: "Hospital service updated successfully",
    });
  });
};

// Deactivate hospital service
const deactivateHospitalService = (req, res) => {
  const hospitalServiceId = req.params.id;

  const sql = `
    UPDATE hospital_services
    SET status = 'INACTIVE'
    WHERE id = ?
  `;

  db.query(sql, [hospitalServiceId], (error, result) => {
    if (error) {
      console.error(
        "Deactivate hospital service error:",
        error.message
      );

      return res.status(500).json({
        message: "Failed to deactivate hospital service",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Hospital service not found",
      });
    }

    res.json({
      message: "Hospital service deactivated successfully",
    });
  });
};

module.exports = {
  addHospitalService,
  getHospitalService,
  getHospitalServices,
  updateHospitalService,
  deactivateHospitalService,
};