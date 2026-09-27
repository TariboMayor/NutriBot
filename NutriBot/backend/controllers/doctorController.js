const db = require("../config/db");

// Add doctor to a hospital
const createDoctor = (req, res) => {
  const {
    hospital_id,
    user_id,
    first_name,
    last_name,
    specialty,
    license_number,
    phone,
    email,
    bio,
  } = req.body;

  if (!hospital_id || !first_name || !last_name || !specialty) {
    return res.status(400).json({
      message:
        "hospital_id, first_name, last_name and specialty are required",
    });
  }

  const sql = `
    INSERT INTO doctors (
      hospital_id,
      user_id,
      first_name,
      last_name,
      specialty,
      license_number,
      phone,
      email,
      bio,
      status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')
  `;

  const values = [
    hospital_id,
    user_id || null,
    first_name,
    last_name,
    specialty,
    license_number || null,
    phone || null,
    email || null,
    bio || null,
  ];

  db.query(sql, values, (error, result) => {
    if (error) {
      console.error("Create doctor error:", error.message);

      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
          message: "License number already exists",
        });
      }

      return res.status(500).json({
        message: "Failed to create doctor",
      });
    }

    res.status(201).json({
      message: "Doctor created successfully",
      doctorId: result.insertId,
    });
  });
};

// Get doctor by ID
const getDoctor = (req, res) => {
  const doctorId = req.params.id;

  const sql = `
    SELECT
      d.id,
      d.hospital_id,
      d.user_id,
      d.first_name,
      d.last_name,
      d.specialty,
      d.license_number,
      d.phone,
      d.email,
      d.bio,
      d.status,
      d.created_at,
      d.updated_at,
      h.name AS hospital_name
    FROM doctors d
    INNER JOIN hospitals h ON d.hospital_id = h.id
    WHERE d.id = ?
  `;

  db.query(sql, [doctorId], (error, results) => {
    if (error) {
      console.error("Get doctor error:", error.message);

      return res.status(500).json({
        message: "Failed to get doctor",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    res.json(results[0]);
  });
};

// Get all doctors in a hospital
const getHospitalDoctors = (req, res) => {
  const hospitalId = req.params.hospitalId;

  const sql = `
    SELECT
      id,
      hospital_id,
      user_id,
      first_name,
      last_name,
      specialty,
      license_number,
      phone,
      email,
      bio,
      status,
      created_at,
      updated_at
    FROM doctors
    WHERE hospital_id = ?
    ORDER BY first_name ASC, last_name ASC
  `;

  db.query(sql, [hospitalId], (error, results) => {
    if (error) {
      console.error("Get hospital doctors error:", error.message);

      return res.status(500).json({
        message: "Failed to get hospital doctors",
      });
    }

    res.json(results);
  });
};

// Update doctor
const updateDoctor = (req, res) => {
  const doctorId = req.params.id;

  const {
    first_name,
    last_name,
    specialty,
    license_number,
    phone,
    email,
    bio,
    status,
  } = req.body;

  if (
    !first_name &&
    !last_name &&
    !specialty &&
    !license_number &&
    !phone &&
    !email &&
    !bio &&
    !status
  ) {
    return res.status(400).json({
      message: "At least one doctor field is required",
    });
  }

  const sql = `
    UPDATE doctors
    SET
      first_name = COALESCE(?, first_name),
      last_name = COALESCE(?, last_name),
      specialty = COALESCE(?, specialty),
      license_number = COALESCE(?, license_number),
      phone = COALESCE(?, phone),
      email = COALESCE(?, email),
      bio = COALESCE(?, bio),
      status = COALESCE(?, status)
    WHERE id = ?
  `;

  const values = [
    first_name || null,
    last_name || null,
    specialty || null,
    license_number || null,
    phone || null,
    email || null,
    bio || null,
    status || null,
    doctorId,
  ];

  db.query(sql, values, (error, result) => {
    if (error) {
      console.error("Update doctor error:", error.message);

      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
          message: "License number already exists",
        });
      }

      return res.status(500).json({
        message: "Failed to update doctor",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    res.json({
      message: "Doctor updated successfully",
    });
  });
};

// Deactivate doctor
const deactivateDoctor = (req, res) => {
  const doctorId = req.params.id;

  const sql = `
    UPDATE doctors
    SET status = 'INACTIVE'
    WHERE id = ?
  `;

  db.query(sql, [doctorId], (error, result) => {
    if (error) {
      console.error("Deactivate doctor error:", error.message);

      return res.status(500).json({
        message: "Failed to deactivate doctor",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    res.json({
      message: "Doctor deactivated successfully",
    });
  });
};

module.exports = {
  createDoctor,
  getDoctor,
  getHospitalDoctors,
  updateDoctor,
  deactivateDoctor,
};