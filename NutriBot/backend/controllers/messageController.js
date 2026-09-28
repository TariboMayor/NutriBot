const db = require("../config/db");

// Send a message
const sendMessage = (req, res) => {
  const {
    sender_user_id,
    recipient_user_id,
    hospital_id,
    appointment_id,
    subject,
    message,
  } = req.body;

  if (
    !sender_user_id ||
    !recipient_user_id ||
    !message
  ) {
    return res.status(400).json({
      message:
        "sender_user_id, recipient_user_id and message are required",
    });
  }

  const createMessage = () => {
    const messageSql = `
      INSERT INTO messages (
        sender_user_id,
        hospital_id,
        appointment_id,
        subject,
        message
      )
      VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
      messageSql,
      [
        sender_user_id,
        hospital_id || null,
        appointment_id || null,
        subject || null,
        message,
      ],
      (messageError, messageResult) => {
        if (messageError) {
          console.error(
            "Send message error:",
            messageError.message
          );

          return res.status(500).json({
            message: "Failed to send message",
          });
        }

        const messageId = messageResult.insertId;

        const recipientSql = `
          INSERT INTO message_recipients (
            message_id,
            recipient_user_id,
            is_read
          )
          VALUES (?, ?, FALSE)
        `;

        db.query(
          recipientSql,
          [
            messageId,
            recipient_user_id,
          ],
          (recipientError) => {
            if (recipientError) {
              console.error(
                "Create message recipient error:",
                recipientError.message
              );

              return res.status(500).json({
                message:
                  "Message created but recipient could not be added",
              });
            }

            res.status(201).json({
              message:
                "Message sent successfully",
              messageId,
            });
          }
        );
      }
    );
  };

  // If an appointment is supplied,
  // verify that both users are connected
  // to that appointment.
  if (appointment_id) {
    const appointmentSql = `
      SELECT
        a.id,
        a.patient_id,
        pp.user_id AS patient_user_id,
        a.hospital_id,
        hs_user.user_id AS hospital_user_id
      FROM appointments a
      INNER JOIN patient_profiles pp
        ON a.patient_id = pp.id
      LEFT JOIN hospital_staff hs_user
        ON a.hospital_id = hs_user.hospital_id
        AND hs_user.status = 'ACTIVE'
      WHERE a.id = ?
    `;

    db.query(
      appointmentSql,
      [appointment_id],
      (appointmentError, appointmentResults) => {
        if (appointmentError) {
          console.error(
            "Check appointment messaging error:",
            appointmentError.message
          );

          return res.status(500).json({
            message:
              "Failed to verify appointment",
          });
        }

        if (appointmentResults.length === 0) {
          return res.status(404).json({
            message: "Appointment not found",
          });
        }

        const appointment =
          appointmentResults[0];

        const senderIsPatient =
          Number(sender_user_id) ===
          Number(
            appointment.patient_user_id
          );

        const recipientIsPatient =
          Number(recipient_user_id) ===
          Number(
            appointment.patient_user_id
          );

        const senderIsHospitalStaff =
          appointmentResults.some(
            (row) =>
              Number(sender_user_id) ===
              Number(row.hospital_user_id)
          );

        const recipientIsHospitalStaff =
          appointmentResults.some(
            (row) =>
              Number(recipient_user_id) ===
              Number(row.hospital_user_id)
          );

        const validConversation =
          (senderIsPatient &&
            recipientIsHospitalStaff) ||
          (senderIsHospitalStaff &&
            recipientIsPatient);

        if (!validConversation) {
          return res.status(403).json({
            message:
              "You are not allowed to send a message for this appointment",
          });
        }

        createMessage();
      }
    );

    return;
  }

  // Without an appointment, allow the message
  // to be created for a hospital conversation.
  if (hospital_id) {
  const hospitalConversationSql = `
    SELECT
      u.id,
      CASE
        WHEN hs.user_id IS NOT NULL THEN 'HOSPITAL_STAFF'
        WHEN pp.user_id IS NOT NULL THEN 'PATIENT'
        ELSE 'OTHER'
      END AS user_type
    FROM users_tbl u
    LEFT JOIN hospital_staff hs
      ON hs.user_id = u.id
      AND hs.hospital_id = ?
      AND hs.status = 'ACTIVE'
    LEFT JOIN patient_profiles pp
      ON pp.user_id = u.id
    WHERE u.id IN (?, ?)
  `;

  db.query(
    hospitalConversationSql,
    [
      hospital_id,
      sender_user_id,
      recipient_user_id,
    ],
    (conversationError, conversationResults) => {
      if (conversationError) {
        console.error(
          "Check hospital conversation error:",
          conversationError.message
        );

        return res.status(500).json({
          message:
            "Failed to verify hospital conversation",
        });
      }

      const sender = conversationResults.find(
        (user) =>
          Number(user.id) ===
          Number(sender_user_id)
      );

      const recipient = conversationResults.find(
        (user) =>
          Number(user.id) ===
          Number(recipient_user_id)
      );

      if (!sender || !recipient) {
        return res.status(403).json({
          message:
            "Users could not be verified for this hospital conversation",
        });
      }

      const validConversation =
        (sender.user_type === "PATIENT" &&
          recipient.user_type === "HOSPITAL_STAFF") ||
        (sender.user_type === "HOSPITAL_STAFF" &&
          recipient.user_type === "PATIENT");

      if (!validConversation) {
        return res.status(403).json({
          message:
            "Messages are only allowed between a patient and active hospital staff",
        });
      }

      createMessage();
    }
  );

  return;
}
  createMessage();
};

// Get messages for a user
const getUserMessages = (req, res) => {
  const userId = req.params.userId;

  const sql = `
    SELECT
      m.id,
      m.sender_user_id,
      sender.name AS sender_name,
      m.hospital_id,
      h.name AS hospital_name,
      m.appointment_id,
      m.subject,
      m.message,
      m.created_at,
      mr.is_read,
      mr.read_at
    FROM message_recipients mr
    INNER JOIN messages m
      ON mr.message_id = m.id
    INNER JOIN users_tbl sender
      ON m.sender_user_id = sender.id
    LEFT JOIN hospitals h
      ON m.hospital_id = h.id
    WHERE mr.recipient_user_id = ?
    ORDER BY m.created_at DESC
  `;

  db.query(
    sql,
    [userId],
    (error, results) => {
      if (error) {
        console.error(
          "Get user messages error:",
          error.message
        );

        return res.status(500).json({
          message:
            "Failed to get user messages",
        });
      }

      res.json(results);
    }
  );
};

// Get one message
const getMessage = (req, res) => {
  const messageId = req.params.id;
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({
      message: "userId is required",
    });
  }

  const sql = `
    SELECT
      m.id,
      m.sender_user_id,
      sender.name AS sender_name,
      m.hospital_id,
      h.name AS hospital_name,
      m.appointment_id,
      m.subject,
      m.message,
      m.created_at,
      mr.recipient_user_id,
      mr.is_read,
      mr.read_at
    FROM messages m
    LEFT JOIN users_tbl sender
      ON m.sender_user_id = sender.id
    LEFT JOIN hospitals h
      ON m.hospital_id = h.id
    LEFT JOIN message_recipients mr
      ON m.id = mr.message_id
      AND mr.recipient_user_id = ?
    WHERE m.id = ?
      AND (
        m.sender_user_id = ?
        OR mr.recipient_user_id = ?
      )
  `;

  db.query(
    sql,
    [
      userId,
      messageId,
      userId,
      userId,
    ],
    (error, results) => {
      if (error) {
        console.error(
          "Get message error:",
          error.message
        );

        return res.status(500).json({
          message: "Failed to get message",
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          message: "Message not found",
        });
      }

      res.json(results[0]);
    }
  );
};

// Mark message as read
const markMessageAsRead = (req, res) => {
  const messageId = req.params.id;
  const userId = req.body.user_id;

  if (!userId) {
    return res.status(400).json({
      message: "user_id is required",
    });
  }

  const sql = `
    UPDATE message_recipients
    SET
      is_read = TRUE,
      read_at = CURRENT_TIMESTAMP
    WHERE message_id = ?
      AND recipient_user_id = ?
  `;

  db.query(
    sql,
    [
      messageId,
      userId,
    ],
    (error, result) => {
      if (error) {
        console.error(
          "Mark message as read error:",
          error.message
        );

        return res.status(500).json({
          message:
            "Failed to mark message as read",
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message:
            "Message recipient not found",
        });
      }

      res.json({
        message:
          "Message marked as read",
      });
    }
  );
};

// Get unread message count
const getUnreadMessageCount = (
  req,
  res
) => {
  const userId = req.params.userId;

  const sql = `
    SELECT COUNT(*) AS unread_count
    FROM message_recipients
    WHERE recipient_user_id = ?
      AND is_read = FALSE
  `;

  db.query(
    sql,
    [userId],
    (error, results) => {
      if (error) {
        console.error(
          "Get unread message count error:",
          error.message
        );

        return res.status(500).json({
          message:
            "Failed to get unread message count",
        });
      }

      res.json({
        userId: Number(userId),
        unread_count:
          results[0].unread_count,
      });
    }
  );
};

module.exports = {
  sendMessage,
  getUserMessages,
  getMessage,
  markMessageAsRead,
  getUnreadMessageCount,
};