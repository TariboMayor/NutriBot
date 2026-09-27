const db = require("../config/db");

// Add staff member to a hospital
const addHospitalStaff = (req, res) => {
  const {
    hospital_id,
    user_id,
    staff_role,
  } = req.body;

  if (!hospital_id || !user_id || !staff_role) {
    return res.status(400).json({
      message: "hospital_id, user_id and staff_role are required",
    });
  }

  const sql = `
    INSERT INTO hospital_staff (
      hospital_id,
      user_id,
      staff_role,
      status
    )
    VALUES (?, ?, ?, 'ACTIVE')
  `;

  db.query(
    sql,
    [hospital_id, user_id, staff_role],
    (error, result) => {
      if (error) {
        console.error("Add hospital staff error:", error.message);

        if (error.code === "ER_DUP_ENTRY") {
          return res.status(409).json({
            message: "This user is already a staff member of this hospital",
          });
        }

        return res.status(500).json({
          message: "Failed to add hospital staff",
        });
      }

      res.status(201).json({
        message: "Hospital staff added successfully",
        staffId: result.insertId,
      });
    }
  );
};

// Get all staff members for a hospital
const getHospitalStaff = (req, res) => {
  const hospitalId = req.params.hospitalId;

  const sql = `
    SELECT
      hs.id,
      hs.hospital_id,
      hs.user_id,
      u.name,
      u.email,
      u.phone,
      hs.staff_role,
      hs.status,
      hs.created_at,
      hs.updated_at
    FROM hospital_staff hs
    INNER JOIN users_tbl u ON hs.user_id = u.id
    WHERE hs.hospital_id = ?
    ORDER BY hs.created_at ASC
  `;

  db.query(sql, [hospitalId], (error, results) => {
    if (error) {
      console.error("Get hospital staff error:", error.message);

      return res.status(500).json({
        message: "Failed to get hospital staff",
      });
    }

    res.json(results);
  });
};

// Update staff role/status
const updateHospitalStaff = (req, res) => {
  const staffId = req.params.id;

  const {
    staff_role,
    status,
  } = req.body;

  if (!staff_role && !status) {
    return res.status(400).json({
      message: "staff_role or status is required",
    });
  }

  const sql = `
    UPDATE hospital_staff
    SET
      staff_role = COALESCE(?, staff_role),
      status = COALESCE(?, status)
    WHERE id = ?
  `;

  db.query(
    sql,
    [staff_role || null, status || null, staffId],
    (error, result) => {
      if (error) {
        console.error("Update hospital staff error:", error.message);

        return res.status(500).json({
          message: "Failed to update hospital staff",
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Hospital staff member not found",
        });
      }

      res.json({
        message: "Hospital staff updated successfully",
      });
    }
  );
};

// Deactivate staff member
const deactivateHospitalStaff = (req, res) => {
  const staffId = req.params.id;

  const sql = `
    UPDATE hospital_staff
    SET status = 'DEACTIVATED'
    WHERE id = ?
  `;

  db.query(sql, [staffId], (error, result) => {
    if (error) {
      console.error(
        "Deactivate hospital staff error:",
        error.message
      );

      return res.status(500).json({
        message: "Failed to deactivate hospital staff",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Hospital staff member not found",
      });
    }

    res.json({
      message: "Hospital staff deactivated successfully",
    });
  });
};

module.exports = {
  addHospitalStaff,
  getHospitalStaff,
  updateHospitalStaff,
  deactivateHospitalStaff,
};