const express = require("express");

const {
  sendMessage,
  getUserMessages,
  getMessage,
  markMessageAsRead,
  getUnreadMessageCount,
} = require("../controllers/messageController");

const router = express.Router();

router.post("/", sendMessage);

router.get(
  "/user/:userId",
  getUserMessages
);

router.get(
  "/user/:userId/unread-count",
  getUnreadMessageCount
);

router.get(
  "/:id",
  getMessage
);

router.put(
  "/:id/read",
  markMessageAsRead
);

module.exports = router;