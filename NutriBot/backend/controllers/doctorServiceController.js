const db = require("../config/db");

// Assign a hospital service to a doctor
const assignDoctorService = (req, res) => {
  const {
    doctor_id,
    hospital_service_id,
  } = req.body;

  if (!doctor_id || !hospital_service_id) {
    return res.status(400).json({
      message: "doctor_id and hospital_service_id are required",
    });
  }

  const sql = `
    INSERT INTO doctor_services (
      doctor_id,
      hospital_service_id,
      status
    )
    VALUES (?, ?, 'ACTIVE')
  `;

  db.query(
    sql,
    [doctor_id, hospital_service_id],
    (error, result) => {
      if (error) {
        console.error(
          "Assign doctor service error:",
          error.message
        );

        if (error.code === "ER_DUP_ENTRY") {
          return res.status(409).json({
            message: "This service is already assigned to the doctor",
          });
        }

        return res.status(500).json({
          message: "Failed to assign doctor service",
        });
      }

      res.status(201).json({
        message: "Doctor service assigned successfully",
        doctorServiceId: result.insertId,
      });
    }
  );
};

// Get one doctor-service assignment
const getDoctorService = (req, res) => {
  const doctorServiceId = req.params.id;

  const sql = `
    SELECT
      ds.id,
      ds.doctor_id,
      CONCAT(d.first_name, ' ', d.last_name) AS doctor_name,
      d.specialty,
      ds.hospital_service_id,
      ms.name AS service_name,
      hs.hospital_id,
      h.name AS hospital_name,
      hs.duration_minutes,
      hs.price,
      ds.status,
      ds.created_at
    FROM doctor_services ds
    INNER JOIN doctors d
      ON ds.doctor_id = d.id
    INNER JOIN hospital_services hs
      ON ds.hospital_service_id = hs.id
    INNER JOIN medical_services ms
      ON hs.service_id = ms.id
    INNER JOIN hospitals h
      ON hs.hospital_id = h.id
    WHERE ds.id = ?
  `;

  db.query(sql, [doctorServiceId], (error, results) => {
    if (error) {
      console.error(
        "Get doctor service error:",
        error.message
      );

      return res.status(500).json({
        message: "Failed to get doctor service",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "Doctor service assignment not found",
      });
    }

    res.json(results[0]);
  });
};

// Get all services assigned to a doctor
const getDoctorServices = (req, res) => {
  const doctorId = req.params.doctorId;

  const sql = `
    SELECT
      ds.id,
      ds.doctor_id,
      ds.hospital_service_id,
      ms.name AS service_name,
      ms.description,
      ms.category,
      hs.hospital_id,
      h.name AS hospital_name,
      hs.duration_minutes,
      hs.price,
      ds.status,
      ds.created_at
    FROM doctor_services ds
    INNER JOIN hospital_services hs
      ON ds.hospital_service_id = hs.id
    INNER JOIN medical_services ms
      ON hs.service_id = ms.id
    INNER JOIN hospitals h
      ON hs.hospital_id = h.id
    WHERE ds.doctor_id = ?
    ORDER BY ms.name ASC
  `;

  db.query(sql, [doctorId], (error, results) => {
    if (error) {
      console.error(
        "Get doctor services error:",
        error.message
      );

      return res.status(500).json({
        message: "Failed to get doctor services",
      });
    }

    res.json(results);
  });
};

// Get all doctors assigned to a hospital service
const getServiceDoctors = (req, res) => {
  const hospitalServiceId = req.params.hospitalServiceId;

  const sql = `
    SELECT
      ds.id,
      ds.doctor_id,
      CONCAT(d.first_name, ' ', d.last_name) AS doctor_name,
      d.specialty,
      d.phone,
      d.email,
      ds.hospital_service_id,
      hs.hospital_id,
      h.name AS hospital_name,
      ds.status
    FROM doctor_services ds
    INNER JOIN doctors d
      ON ds.doctor_id = d.id
    INNER JOIN hospital_services hs
      ON ds.hospital_service_id = hs.id
    INNER JOIN hospitals h
      ON hs.hospital_id = h.id
    WHERE ds.hospital_service_id = ?
    ORDER BY d.first_name ASC, d.last_name ASC
  `;

  db.query(sql, [hospitalServiceId], (error, results) => {
    if (error) {
      console.error(
        "Get service doctors error:",
        error.message
      );

      return res.status(500).json({
        message: "Failed to get service doctors",
      });
    }

    res.json(results);
  });
};

// Update doctor-service assignment
const updateDoctorService = (req, res) => {
  const doctorServiceId = req.params.id;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({
      message: "status is required",
    });
  }

  const sql = `
    UPDATE doctor_services
    SET status = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [status, doctorServiceId],
    (error, result) => {
      if (error) {
        console.error(
          "Update doctor service error:",
          error.message
        );

        return res.status(500).json({
          message: "Failed to update doctor service",
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Doctor service assignment not found",
        });
      }

      res.json({
        message: "Doctor service updated successfully",
      });
    }
  );
};

// Deactivate doctor-service assignment
const deactivateDoctorService = (req, res) => {
  const doctorServiceId = req.params.id;

  const sql = `
    UPDATE doctor_services
    SET status = 'INACTIVE'
    WHERE id = ?
  `;

  db.query(
    sql,
    [doctorServiceId],
    (error, result) => {
      if (error) {
        console.error(
          "Deactivate doctor service error:",
          error.message
        );

        return res.status(500).json({
          message: "Failed to deactivate doctor service",
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Doctor service assignment not found",
        });
      }

      res.json({
        message: "Doctor service deactivated successfully",
      });
    }
  );
};

module.exports = {
  assignDoctorService,
  getDoctorService,
  getDoctorServices,
  getServiceDoctors,
  updateDoctorService,
  deactivateDoctorService,
};