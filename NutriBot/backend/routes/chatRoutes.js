const express = require("express");

const {
  chat,
  getConversations,
  createNewConversation,
  getConversation,
  removeConversation,
} = require("../controllers/chatController");

const {
  authenticateToken,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticateToken);

router.get(
  "/chat/conversations",
  getConversations
);

router.post(
  "/chat/conversations",
  createNewConversation
);

router.get(
  "/chat/conversations/:id",
  getConversation
);

router.delete(
  "/chat/conversations/:id",
  removeConversation
);

router.post(
  "/chat",
  chat
);

module.exports = router;