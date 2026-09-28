const db = require("../config/db");

// Create a notification for a user
const createNotification = (
  {
    sender_user_id = null,
    hospital_id = null,
    appointment_id = null,
    notification_type,
    title,
    message,
    recipient_user_id,
  },
  callback
) => {
  if (
    !notification_type ||
    !title ||
    !message ||
    !recipient_user_id
  ) {
    return callback(
      new Error(
        "notification_type, title, message and recipient_user_id are required"
      )
    );
  }

  const notificationSql = `
    INSERT INTO notifications (
      sender_user_id,
      hospital_id,
      appointment_id,
      notification_type,
      title,
      message
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    notificationSql,
    [
      sender_user_id,
      hospital_id,
      appointment_id,
      notification_type,
      title,
      message,
    ],
    (notificationError, notificationResult) => {
      if (notificationError) {
        console.error(
          "Create notification error:",
          notificationError.message
        );

        return callback(notificationError);
      }

      const notificationId =
        notificationResult.insertId;

      const recipientSql = `
        INSERT INTO notification_recipients (
          notification_id,
          user_id,
          is_read,
          in_app_sent,
          email_sent,
          sms_sent
        )
        VALUES (?, ?, FALSE, TRUE, FALSE, FALSE)
      `;

      db.query(
        recipientSql,
        [
          notificationId,
          recipient_user_id,
        ],
        (recipientError) => {
          if (recipientError) {
            console.error(
              "Create notification recipient error:",
              recipientError.message
            );

            return callback(recipientError);
          }

          callback(null, {
            notificationId,
            recipientUserId:
              recipient_user_id,
          });
        }
      );
    }
  );
};

// Create appointment confirmation notification
const notifyAppointmentConfirmed = (
  appointmentId,
  callback
) => {
  const sql = `
    SELECT
      a.id,
      a.patient_id,
      a.hospital_id,
      h.name AS hospital_name,
      CONCAT(
        d.first_name,
        ' ',
        d.last_name
      ) AS doctor_name,
      ms.name AS service_name,
      DATE_FORMAT(
        a.appointment_date,
        '%Y-%m-%d'
      ) AS appointment_date,
      a.start_time,
      a.end_time,
      pp.user_id AS patient_user_id
    FROM appointments a
    INNER JOIN patient_profiles pp
      ON a.patient_id = pp.id
    INNER JOIN hospitals h
      ON a.hospital_id = h.id
    INNER JOIN doctors d
      ON a.doctor_id = d.id
    INNER JOIN hospital_services hs
      ON a.hospital_service_id = hs.id
    INNER JOIN medical_services ms
      ON hs.service_id = ms.id
    WHERE a.id = ?
  `;

  db.query(
    sql,
    [appointmentId],
    (error, results) => {
      if (error) {
        return callback(error);
      }

      if (results.length === 0) {
        return callback(
          new Error(
            "Appointment not found"
          )
        );
      }

      const appointment = results[0];

      const message =
        `Your appointment at ${appointment.hospital_name} ` +
        `with Dr. ${appointment.doctor_name} ` +
        `for ${appointment.service_name} ` +
        `has been confirmed for ` +
        `${appointment.appointment_date} ` +
        `at ${appointment.start_time}.`;

      createNotification(
        {
          hospital_id:
            appointment.hospital_id,
          appointment_id:
            appointment.id,
          notification_type:
            "APPOINTMENT",
          title:
            "Appointment Confirmed",
          message,
          recipient_user_id:
            appointment.patient_user_id,
        },
        callback
      );
    }
  );
};

// Create appointment cancellation notification
const notifyAppointmentCancelled = (
  appointmentId,
  reason,
  callback
) => {
  const sql = `
    SELECT
      a.id,
      a.patient_id,
      a.hospital_id,
      h.name AS hospital_name,
      DATE_FORMAT(
        a.appointment_date,
        '%Y-%m-%d'
      ) AS appointment_date,
      a.start_time,
      pp.user_id AS patient_user_id
    FROM appointments a
    INNER JOIN patient_profiles pp
      ON a.patient_id = pp.id
    INNER JOIN hospitals h
      ON a.hospital_id = h.id
    WHERE a.id = ?
  `;

  db.query(
    sql,
    [appointmentId],
    (error, results) => {
      if (error) {
        return callback(error);
      }

      if (results.length === 0) {
        return callback(
          new Error(
            "Appointment not found"
          )
        );
      }

      const appointment = results[0];

      const message =
        `Your appointment at ${appointment.hospital_name} ` +
        `scheduled for ${appointment.appointment_date} ` +
        `at ${appointment.start_time} ` +
        `has been cancelled.` +
        (reason
          ? ` Reason: ${reason}`
          : "");

      createNotification(
        {
          hospital_id:
            appointment.hospital_id,
          appointment_id:
            appointment.id,
          notification_type:
            "APPOINTMENT_CANCELLED",
          title:
            "Appointment Cancelled",
          message,
          recipient_user_id:
            appointment.patient_user_id,
        },
        callback
      );
    }
  );
};

// Create appointment rescheduled notification
const notifyAppointmentRescheduled = (
  appointmentId,
  callback
) => {
  const sql = `
    SELECT
      a.id,
      a.patient_id,
      a.hospital_id,
      h.name AS hospital_name,
      CONCAT(
        d.first_name,
        ' ',
        d.last_name
      ) AS doctor_name,
      ms.name AS service_name,
      DATE_FORMAT(
        a.appointment_date,
        '%Y-%m-%d'
      ) AS appointment_date,
      a.start_time,
      a.end_time,
      pp.user_id AS patient_user_id
    FROM appointments a
    INNER JOIN patient_profiles pp
      ON a.patient_id = pp.id
    INNER JOIN hospitals h
      ON a.hospital_id = h.id
    INNER JOIN doctors d
      ON a.doctor_id = d.id
    INNER JOIN hospital_services hs
      ON a.hospital_service_id = hs.id
    INNER JOIN medical_services ms
      ON hs.service_id = ms.id
    WHERE a.id = ?
  `;

  db.query(
    sql,
    [appointmentId],
    (error, results) => {
      if (error) {
        return callback(error);
      }

      if (results.length === 0) {
        return callback(
          new Error(
            "Appointment not found"
          )
        );
      }

      const appointment = results[0];

      const message =
        `Your appointment at ${appointment.hospital_name} ` +
        `with Dr. ${appointment.doctor_name} ` +
        `for ${appointment.service_name} ` +
        `has been rescheduled to ` +
        `${appointment.appointment_date} ` +
        `at ${appointment.start_time}.`;

      createNotification(
        {
          hospital_id:
            appointment.hospital_id,
          appointment_id:
            appointment.id,
          notification_type:
            "APPOINTMENT_RESCHEDULED",
          title:
            "Appointment Rescheduled",
          message,
          recipient_user_id:
            appointment.patient_user_id,
        },
        callback
      );
    }
  );
};

module.exports = {
  createNotification,
  notifyAppointmentConfirmed,
  notifyAppointmentCancelled,
  notifyAppointmentRescheduled,
};