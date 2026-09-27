const db = require("../config/db");

// Create medical service
const createMedicalService = (req, res) => {
  const {
    name,
    description,
    category,
    default_duration_minutes,
  } = req.body;

  if (!name) {
    return res.status(400).json({
      message: "Service name is required",
    });
  }

  const sql = `
    INSERT INTO medical_services (
      name,
      description,
      category,
      default_duration_minutes,
      status
    )
    VALUES (?, ?, ?, ?, 'ACTIVE')
  `;

  const values = [
    name,
    description || null,
    category || null,
    default_duration_minutes || 30,
  ];

  db.query(sql, values, (error, result) => {
    if (error) {
      console.error("Create medical service error:", error.message);

      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
          message: "Medical service already exists",
        });
      }

      return res.status(500).json({
        message: "Failed to create medical service",
      });
    }

    res.status(201).json({
      message: "Medical service created successfully",
      serviceId: result.insertId,
    });
  });
};

// Get medical service by ID
const getMedicalService = (req, res) => {
  const serviceId = req.params.id;

  const sql = `
    SELECT
      id,
      name,
      description,
      category,
      default_duration_minutes,
      status,
      created_at
    FROM medical_services
    WHERE id = ?
  `;

  db.query(sql, [serviceId], (error, results) => {
    if (error) {
      console.error("Get medical service error:", error.message);

      return res.status(500).json({
        message: "Failed to get medical service",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "Medical service not found",
      });
    }

    res.json(results[0]);
  });
};

// Get all medical services
const getMedicalServices = (req, res) => {
  const sql = `
    SELECT
      id,
      name,
      description,
      category,
      default_duration_minutes,
      status,
      created_at
    FROM medical_services
    ORDER BY name ASC
  `;

  db.query(sql, (error, results) => {
    if (error) {
      console.error("Get medical services error:", error.message);

      return res.status(500).json({
        message: "Failed to get medical services",
      });
    }

    res.json(results);
  });
};

// Update medical service
const updateMedicalService = (req, res) => {
  const serviceId = req.params.id;

  const {
    name,
    description,
    category,
    default_duration_minutes,
    status,
  } = req.body;

  if (
    !name &&
    !description &&
    !category &&
    !default_duration_minutes &&
    !status
  ) {
    return res.status(400).json({
      message: "At least one service field is required",
    });
  }

  const sql = `
    UPDATE medical_services
    SET
      name = COALESCE(?, name),
      description = COALESCE(?, description),
      category = COALESCE(?, category),
      default_duration_minutes = COALESCE(?, default_duration_minutes),
      status = COALESCE(?, status)
    WHERE id = ?
  `;

  const values = [
    name || null,
    description || null,
    category || null,
    default_duration_minutes || null,
    status || null,
    serviceId,
  ];

  db.query(sql, values, (error, result) => {
    if (error) {
      console.error("Update medical service error:", error.message);

      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
          message: "Medical service name already exists",
        });
      }

      return res.status(500).json({
        message: "Failed to update medical service",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Medical service not found",
      });
    }

    res.json({
      message: "Medical service updated successfully",
    });
  });
};

// Deactivate medical service
const deactivateMedicalService = (req, res) => {
  const serviceId = req.params.id;

  const sql = `
    UPDATE medical_services
    SET status = 'INACTIVE'
    WHERE id = ?
  `;

  db.query(sql, [serviceId], (error, result) => {
    if (error) {
      console.error("Deactivate medical service error:", error.message);

      return res.status(500).json({
        message: "Failed to deactivate medical service",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Medical service not found",
      });
    }

    res.json({
      message: "Medical service deactivated successfully",
    });
  });
};

module.exports = {
  createMedicalService,
  getMedicalService,
  getMedicalServices,
  updateMedicalService,
  deactivateMedicalService,
};