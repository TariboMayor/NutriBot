const db = require("../config/db");

// Create hospital
const createHospital = (req, res) => {
  const {
    name,
    phone,
    email,
    address,
    city,
    state,
    country,
    description,
    website,
  } = req.body;

  if (!name) {
    return res.status(400).json({
      message: "Hospital name is required",
    });
  }

  const sql = `
    INSERT INTO hospitals (
      name,
      phone,
      email,
      address,
      city,
      state,
      country,
      description,
      website,
      status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'REGISTERED')
  `;

  const values = [
    name,
    phone || null,
    email || null,
    address || null,
    city || null,
    state || null,
    country || "Nigeria",
    description || null,
    website || null,
  ];

  db.query(sql, values, (error, result) => {
    if (error) {
      console.error("Create hospital error:", error.message);

      return res.status(500).json({
        message: "Failed to create hospital",
      });
    }

    res.status(201).json({
      message: "Hospital registered successfully",
      hospitalId: result.insertId,
    });
  });
};
// Get all hospitals available to patients
const getHospitals = (req, res) => {
  const sql = `
    SELECT
      id,
      name,
      phone,
      email,
      address,
      city,
      state,
      country,
      description,
      website,
      status
    FROM hospitals
    WHERE status = 'REGISTERED'
    ORDER BY name ASC
  `;

  db.query(sql, (error, results) => {
    if (error) {
      console.error("Get hospitals error:", error.message);

      return res.status(500).json({
        message: "Failed to get hospitals",
      });
    }

    res.json(results);
  });
};
// Get hospital by ID
const getHospital = (req, res) => {
  const hospitalId = req.params.id;

  const sql = `
    SELECT
      id,
      name,
      phone,
      email,
      address,
      city,
      state,
      country,
      description,
      website,
      status,
      created_at,
      updated_at
    FROM hospitals
    WHERE id = ?
  `;

  db.query(sql, [hospitalId], (error, results) => {
    if (error) {
      console.error("Get hospital error:", error.message);

      return res.status(500).json({
        message: "Failed to get hospital",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "Hospital not found",
      });
    }

    res.json(results[0]);
  });
};

// Update hospital
const updateHospital = (req, res) => {
  const hospitalId = req.params.id;

  const {
    name,
    phone,
    email,
    address,
    city,
    state,
    country,
    description,
    website,
  } = req.body;

  if (!name) {
    return res.status(400).json({
      message: "Hospital name is required",
    });
  }

  const sql = `
    UPDATE hospitals
    SET
      name = ?,
      phone = ?,
      email = ?,
      address = ?,
      city = ?,
      state = ?,
      country = ?,
      description = ?,
      website = ?
    WHERE id = ?
  `;

  const values = [
    name,
    phone || null,
    email || null,
    address || null,
    city || null,
    state || null,
    country || "Nigeria",
    description || null,
    website || null,
    hospitalId,
  ];

  db.query(sql, values, (error, result) => {
    if (error) {
      console.error("Update hospital error:", error.message);

      return res.status(500).json({
        message: "Failed to update hospital",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Hospital not found",
      });
    }

    res.json({
      message: "Hospital updated successfully",
    });
  });
};

module.exports = {
  createHospital,
  getHospital,
  getHospitals,
  updateHospital,
};