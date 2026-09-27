const db = require("../config/db");

// Add doctor availability
const createDoctorAvailability = (req, res) => {
  const {
    doctor_id,
    availability_type,
    day_of_week,
    specific_date,
    start_time,
    end_time,
    reason,
  } = req.body;

  if (!doctor_id || !availability_type) {
    return res.status(400).json({
      message: "doctor_id and availability_type are required",
    });
  }

  const validTypes = [
    "RECURRING",
    "SPECIFIC_DATE",
    "BLOCKED",
  ];

  if (!validTypes.includes(availability_type)) {
    return res.status(400).json({
      message:
        "availability_type must be RECURRING, SPECIFIC_DATE, or BLOCKED",
    });
  }

  if (
    availability_type === "RECURRING" &&
    (!day_of_week || day_of_week < 1 || day_of_week > 7)
  ) {
    return res.status(400).json({
      message:
        "day_of_week must be between 1 and 7 for recurring availability",
    });
  }

  if (
    availability_type !== "RECURRING" &&
    !specific_date
  ) {
    return res.status(400).json({
      message:
        "specific_date is required for SPECIFIC_DATE and BLOCKED availability",
    });
  }

  if (
    availability_type !== "BLOCKED" &&
    (!start_time || !end_time)
  ) {
    return res.status(400).json({
      message:
        "start_time and end_time are required for working availability",
    });
  }

  if (
    start_time &&
    end_time &&
    start_time >= end_time
  ) {
    return res.status(400).json({
      message: "start_time must be earlier than end_time",
    });
  }

  const sql = `
    INSERT INTO doctor_availability (
      doctor_id,
      availability_type,
      day_of_week,
      specific_date,
      start_time,
      end_time,
      reason,
      status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE')
  `;

  const values = [
    doctor_id,
    availability_type,
    availability_type === "RECURRING"
      ? day_of_week
      : null,
    availability_type === "RECURRING"
      ? null
      : specific_date,
    start_time || null,
    end_time || null,
    reason || null,
  ];

  db.query(sql, values, (error, result) => {
    if (error) {
      console.error(
        "Create doctor availability error:",
        error.message
      );

      return res.status(500).json({
        message: "Failed to create doctor availability",
      });
    }

    res.status(201).json({
      message: "Doctor availability created successfully",
      availabilityId: result.insertId,
    });
  });
};

// Get availability by ID
const getDoctorAvailability = (req, res) => {
  const availabilityId = req.params.id;

  const sql = `
    SELECT
      da.id,
      da.doctor_id,
      CONCAT(d.first_name, ' ', d.last_name) AS doctor_name,
      da.availability_type,
      da.day_of_week,
      da.specific_date,
      da.start_time,
      da.end_time,
      da.reason,
      da.status,
      da.created_at,
      da.updated_at
    FROM doctor_availability da
    INNER JOIN doctors d
      ON da.doctor_id = d.id
    WHERE da.id = ?
  `;

  db.query(sql, [availabilityId], (error, results) => {
    if (error) {
      console.error(
        "Get doctor availability error:",
        error.message
      );

      return res.status(500).json({
        message: "Failed to get doctor availability",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "Doctor availability not found",
      });
    }

    res.json(results[0]);
  });
};

// Get all availability for a doctor
const getDoctorAvailabilities = (req, res) => {
  const doctorId = req.params.doctorId;

  const sql = `
    SELECT
      da.id,
      da.doctor_id,
      da.availability_type,
      da.day_of_week,
      da.specific_date,
      da.start_time,
      da.end_time,
      da.reason,
      da.status,
      da.created_at,
      da.updated_at
    FROM doctor_availability da
    WHERE da.doctor_id = ?
    ORDER BY
      da.specific_date ASC,
      da.day_of_week ASC,
      da.start_time ASC
  `;

  db.query(sql, [doctorId], (error, results) => {
    if (error) {
      console.error(
        "Get doctor availabilities error:",
        error.message
      );

      return res.status(500).json({
        message: "Failed to get doctor availabilities",
      });
    }

    res.json(results);
  });
};

// Update doctor availability
const updateDoctorAvailability = (req, res) => {
  const availabilityId = req.params.id;

  const {
    day_of_week,
    specific_date,
    start_time,
    end_time,
    reason,
    status,
  } = req.body;

  if (
    day_of_week === undefined &&
    specific_date === undefined &&
    start_time === undefined &&
    end_time === undefined &&
    reason === undefined &&
    status === undefined
  ) {
    return res.status(400).json({
      message:
        "At least one availability field is required",
    });
  }

  if (
    start_time !== undefined &&
    end_time !== undefined &&
    start_time >= end_time
  ) {
    return res.status(400).json({
      message: "start_time must be earlier than end_time",
    });
  }

  const sql = `
    UPDATE doctor_availability
    SET
      day_of_week = COALESCE(?, day_of_week),
      specific_date = COALESCE(?, specific_date),
      start_time = COALESCE(?, start_time),
      end_time = COALESCE(?, end_time),
      reason = COALESCE(?, reason),
      status = COALESCE(?, status)
    WHERE id = ?
  `;

  const values = [
    day_of_week ?? null,
    specific_date ?? null,
    start_time ?? null,
    end_time ?? null,
    reason ?? null,
    status ?? null,
    availabilityId,
  ];

  db.query(sql, values, (error, result) => {
    if (error) {
      console.error(
        "Update doctor availability error:",
        error.message
      );

      return res.status(500).json({
        message: "Failed to update doctor availability",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Doctor availability not found",
      });
    }

    res.json({
      message: "Doctor availability updated successfully",
    });
  });
};

// Deactivate availability
const deactivateDoctorAvailability = (req, res) => {
  const availabilityId = req.params.id;

  const sql = `
    UPDATE doctor_availability
    SET status = 'INACTIVE'
    WHERE id = ?
  `;

  db.query(sql, [availabilityId], (error, result) => {
    if (error) {
      console.error(
        "Deactivate doctor availability error:",
        error.message
      );

      return res.status(500).json({
        message: "Failed to deactivate doctor availability",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Doctor availability not found",
      });
    }

    res.json({
      message:
        "Doctor availability deactivated successfully",
    });
  });
};

module.exports = {
  createDoctorAvailability,
  getDoctorAvailability,
  getDoctorAvailabilities,
  updateDoctorAvailability,
  deactivateDoctorAvailability,
};