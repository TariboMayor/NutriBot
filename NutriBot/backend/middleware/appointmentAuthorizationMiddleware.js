const db = require("../config/db");

const authorizeAppointmentAccess = (
  options = {}
) => {
  const {
    allowPatient = false,
    allowHospitalStaff = false,
    allowAdmin = false,
  } = options;

  return (req, res, next) => {
    const appointmentId = Number(req.params.id);

    if (!Number.isInteger(appointmentId) || appointmentId <= 0) {
      return res.status(400).json({
        message: "Invalid appointment ID.",
      });
    }

    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    const sql = `
      SELECT
        a.id,
        a.patient_id,
        a.hospital_id,
        a.status,
        pp.user_id AS patient_user_id,
        hs_user.id AS hospital_staff_user_id,
        hs_user.status AS hospital_staff_status
      FROM appointments a
      INNER JOIN patient_profiles pp
        ON a.patient_id = pp.id
      LEFT JOIN hospital_staff hs
        ON hs.hospital_id = a.hospital_id
        AND hs.user_id = ?
      LEFT JOIN users_tbl hs_user
        ON hs_user.id = hs.user_id
      WHERE a.id = ?
      LIMIT 1
    `;

    db.query(
      sql,
      [req.user.id, appointmentId],
      (error, results) => {
        if (error) {
          console.error(
            "Appointment authorization error:",
            error.message
          );

          return res.status(500).json({
            message:
              "Failed to verify appointment access.",
          });
        }

        if (results.length === 0) {
          return res.status(404).json({
            message: "Appointment not found.",
          });
        }

        const appointment = results[0];

        const isAdmin =
          req.user.role === "ADMIN";

        const isPatient =
          req.user.role === "PATIENT" &&
          Number(appointment.patient_user_id) ===
            Number(req.user.id);

        const isHospitalStaff =
          req.user.role === "HOSPITAL_STAFF" &&
          Number(appointment.hospital_staff_user_id) ===
            Number(req.user.id) &&
          appointment.hospital_staff_status ===
            "ACTIVE";

        if (isAdmin && allowAdmin) {
          req.appointment = appointment;
          return next();
        }

        if (isPatient && allowPatient) {
          req.appointment = appointment;
          return next();
        }

        if (
          isHospitalStaff &&
          allowHospitalStaff
        ) {
          req.appointment = appointment;
          return next();
        }

        return res.status(403).json({
          message:
            "You do not have permission to access this appointment.",
        });
      }
    );
  };
};

module.exports = {
  authorizeAppointmentAccess,
};