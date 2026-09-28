const express = require("express");

const {
  getUserNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} = require("../controllers/notificationController");

const router = express.Router();

router.get(
  "/user/:userId",
  getUserNotifications
);

router.get(
  "/user/:userId/unread-count",
  getUnreadNotificationCount
);

router.put(
  "/:id/read",
  markNotificationAsRead
);

router.put(
  "/user/:userId/read-all",
  markAllNotificationsAsRead
);

module.exports = router;