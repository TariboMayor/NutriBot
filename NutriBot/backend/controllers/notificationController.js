const db = require("../config/db");

// Get notifications for a user
const getUserNotifications = (req, res) => {
  const userId = req.params.userId;

  const sql = `
    SELECT
      n.id,
      n.sender_user_id,
      n.hospital_id,
      n.appointment_id,
      n.notification_type,
      n.title,
      n.message,
      n.created_at,
      nr.is_read,
      nr.read_at,
      nr.in_app_sent,
      nr.email_sent,
      nr.sms_sent
    FROM notification_recipients nr
    INNER JOIN notifications n
      ON nr.notification_id = n.id
    WHERE nr.user_id = ?
    ORDER BY n.created_at DESC
  `;

  db.query(sql, [userId], (error, results) => {
    if (error) {
      console.error(
        "Get user notifications error:",
        error.message
      );

      return res.status(500).json({
        message:
          "Failed to get notifications",
      });
    }

    res.json(results);
  });
};

// Get unread notification count
const getUnreadNotificationCount = (req, res) => {
  const userId = req.params.userId;

  const sql = `
    SELECT COUNT(*) AS unread_count
    FROM notification_recipients
    WHERE user_id = ?
      AND is_read = FALSE
  `;

  db.query(sql, [userId], (error, results) => {
    if (error) {
      console.error(
        "Get unread notification count error:",
        error.message
      );

      return res.status(500).json({
        message:
          "Failed to get unread notification count",
      });
    }

    res.json({
      userId: Number(userId),
      unread_count: results[0].unread_count,
    });
  });
};

// Mark one notification as read
const markNotificationAsRead = (req, res) => {
  const notificationId = req.params.id;
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({
      message: "user_id is required",
    });
  }

  const sql = `
    UPDATE notification_recipients
    SET
      is_read = TRUE,
      read_at = CURRENT_TIMESTAMP
    WHERE notification_id = ?
      AND user_id = ?
  `;

  db.query(
    sql,
    [notificationId, user_id],
    (error, result) => {
      if (error) {
        console.error(
          "Mark notification as read error:",
          error.message
        );

        return res.status(500).json({
          message:
            "Failed to mark notification as read",
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message:
            "Notification recipient not found",
        });
      }

      res.json({
        message:
          "Notification marked as read",
      });
    }
  );
};

// Mark all notifications as read
const markAllNotificationsAsRead = (
  req,
  res
) => {
  const userId = req.params.userId;

  const sql = `
    UPDATE notification_recipients
    SET
      is_read = TRUE,
      read_at = CURRENT_TIMESTAMP
    WHERE user_id = ?
      AND is_read = FALSE
  `;

  db.query(
    sql,
    [userId],
    (error, result) => {
      if (error) {
        console.error(
          "Mark all notifications as read error:",
          error.message
        );

        return res.status(500).json({
          message:
            "Failed to mark notifications as read",
        });
      }

      res.json({
        message:
          "All notifications marked as read",
        updated_count:
          result.affectedRows,
      });
    }
  );
};

module.exports = {
  getUserNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};