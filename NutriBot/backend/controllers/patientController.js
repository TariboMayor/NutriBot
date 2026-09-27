const db = require("../config/db");

// Get patient profile
const getPatientProfile = (req, res) => {
  const userId = req.params.userId;

  const sql = `
    SELECT
      pp.id,
      pp.user_id,
      u.name,
      u.email,
      u.phone,
      pp.date_of_birth,
      pp.gender,
      pp.address,
      pp.city,
      pp.state,
      pp.country,
      pp.emergency_contact_name,
      pp.emergency_contact_phone,
      pp.created_at,
      pp.updated_at
    FROM patient_profiles pp
    INNER JOIN users_tbl u ON pp.user_id = u.id
    WHERE pp.user_id = ?
  `;

  db.query(sql, [userId], (error, results) => {
    if (error) {
      console.error("Get patient profile error:", error.message);

      return res.status(500).json({
        message: "Failed to get patient profile",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "Patient profile not found",
      });
    }

    res.json(results[0]);
  });
};

// Create patient profile
const createPatientProfile = (req, res) => {
  const {
    user_id,
    date_of_birth,
    gender,
    address,
    city,
    state,
    country,
    emergency_contact_name,
    emergency_contact_phone,
  } = req.body;

  if (!user_id) {
    return res.status(400).json({
      message: "user_id is required",
    });
  }

  const sql = `
    INSERT INTO patient_profiles (
      user_id,
      date_of_birth,
      gender,
      address,
      city,
      state,
      country,
      emergency_contact_name,
      emergency_contact_phone
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    user_id,
    date_of_birth || null,
    gender || null,
    address || null,
    city || null,
    state || null,
    country || "Nigeria",
    emergency_contact_name || null,
    emergency_contact_phone || null,
  ];

  db.query(sql, values, (error, result) => {
    if (error) {
      console.error("Create patient profile error:", error.message);

      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
          message: "Patient profile already exists",
        });
      }

      return res.status(500).json({
        message: "Failed to create patient profile",
      });
    }

    res.status(201).json({
      message: "Patient profile created successfully",
      profileId: result.insertId,
    });
  });
};

// Update patient profile
const updatePatientProfile = (req, res) => {
  const userId = req.params.userId;

  const {
    date_of_birth,
    gender,
    address,
    city,
    state,
    country,
    emergency_contact_name,
    emergency_contact_phone,
  } = req.body;

  const sql = `
    UPDATE patient_profiles
    SET
      date_of_birth = ?,
      gender = ?,
      address = ?,
      city = ?,
      state = ?,
      country = ?,
      emergency_contact_name = ?,
      emergency_contact_phone = ?
    WHERE user_id = ?
  `;

  const values = [
    date_of_birth || null,
    gender || null,
    address || null,
    city || null,
    state || null,
    country || "Nigeria",
    emergency_contact_name || null,
    emergency_contact_phone || null,
    userId,
  ];

  db.query(sql, values, (error, result) => {
    if (error) {
      console.error("Update patient profile error:", error.message);

      return res.status(500).json({
        message: "Failed to update patient profile",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Patient profile not found",
      });
    }

    res.json({
      message: "Patient profile updated successfully",
    });
  });
};

module.exports = {
  getPatientProfile,
  createPatientProfile,
  updatePatientProfile,
};