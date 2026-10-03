const {
  generateReply,
} = require("../services/chatService");

const {
  createConversation,
  getUserConversations,
  getConversationById,
  deleteConversation,
  updateConversationTitle,
  touchConversation,
} = require("../services/chatConversationService");

const {
  createMessage,
  getConversationMessages,
  getRecentMessages,
} = require("../services/chatMessageService");

function createConversationTitle(message) {
  const cleanedMessage = message
    .replace(/\s+/g, " ")
    .trim();

  if (!cleanedMessage) {
    return "New Conversation";
  }

  const withoutQuestionMark =
    cleanedMessage.replace(/[?!.]+$/, "");

  const words =
    withoutQuestionMark.split(" ");

  if (words.length <= 6) {
    return withoutQuestionMark;
  }

  return `${words
    .slice(0, 6)
    .join(" ")}...`;
}

const getConversations = async (
  req,
  res
) => {
  try {
    const userId = req.user.id;

    const conversations =
      await getUserConversations(userId);

    return res.json({
      conversations,
    });
  } catch (error) {
    console.error(
      "Get conversations error:",
      error
    );

    return res.status(500).json({
      message:
        "Could not load your conversations.",
    });
  }
};

const createNewConversation = async (
  req,
  res
) => {
  try {
    const userId = req.user.id;

    const title =
      req.body?.title?.trim() ||
      "New Conversation";

    const conversation =
      await createConversation(
        userId,
        title
      );

    return res.status(201).json({
      conversation,
    });
  } catch (error) {
    console.error(
      "Create conversation error:",
      error
    );

    return res.status(500).json({
      message:
        "Could not create conversation.",
    });
  }
};

const getConversation = async (
  req,
  res
) => {
  try {
    const userId = req.user.id;
    const conversationId =
      Number(req.params.id);

    if (!Number.isInteger(conversationId)) {
      return res.status(400).json({
        message:
          "Invalid conversation ID.",
      });
    }

    const conversation =
      await getConversationById(
        conversationId,
        userId
      );

    if (!conversation) {
      return res.status(404).json({
        message:
          "Conversation not found.",
      });
    }

    const messages =
      await getConversationMessages(
        conversationId
      );

    return res.json({
      conversation,
      messages,
    });
  } catch (error) {
    console.error(
      "Get conversation error:",
      error
    );

    return res.status(500).json({
      message:
        "Could not load conversation.",
    });
  }
};

const removeConversation = async (
  req,
  res
) => {
  try {
    const userId = req.user.id;
    const conversationId =
      Number(req.params.id);

    if (!Number.isInteger(conversationId)) {
      return res.status(400).json({
        message:
          "Invalid conversation ID.",
      });
    }

    const deleted =
      await deleteConversation(
        conversationId,
        userId
      );

    if (!deleted) {
      return res.status(404).json({
        message:
          "Conversation not found.",
      });
    }

    return res.json({
      message:
        "Conversation deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete conversation error:",
      error
    );

    return res.status(500).json({
      message:
        "Could not delete conversation.",
    });
  }
};

const chat = async (req, res) => {
  try {
    const userId = req.user.id;

    const message =
      req.body?.message?.trim();

    let conversationId =
      req.body?.conversationId
        ? Number(req.body.conversationId)
        : null;

    if (!message) {
      return res.status(400).json({
        message:
          "Please provide a message.",
      });
    }

    if (!conversationId) {
      const conversation =
        await createConversation(
          userId,
          createConversationTitle(message)
        );

      conversationId =
        conversation.id;
    }

    if (
      !Number.isInteger(conversationId)
    ) {
      return res.status(400).json({
        message:
          "Invalid conversation ID.",
      });
    }

    const conversation =
      await getConversationById(
        conversationId,
        userId
      );

    if (!conversation) {
      return res.status(404).json({
        message:
          "Conversation not found.",
      });
    }

    const history =
      await getRecentMessages(
        conversationId,
        12
      );

    const userMessage =
      await createMessage(
        conversationId,
        "USER",
        message
      );

    const reply =
      await generateReply(
        message,
        history
      );

    const assistantMessage =
      await createMessage(
        conversationId,
        "ASSISTANT",
        reply
      );

    if (
      history.length === 0 &&
      conversation.title ===
        "New Conversation"
    ) {
      await updateConversationTitle(
        conversationId,
        userId,
        createConversationTitle(message)
      );
    }

    await touchConversation(
      conversationId,
      userId
    );

    const updatedConversation =
      await getConversationById(
        conversationId,
        userId
      );

    return res.json({
      conversation:
        updatedConversation,
      userMessage,
      assistantMessage,
    });
  } catch (error) {
    console.error(
      "Chat error:",
      error
    );

    return res.status(500).json({
      message:
        "Something went wrong while processing your message.",
    });
  }
};

module.exports = {
  chat,
  getConversations,
  createNewConversation,
  getConversation,
  removeConversation,
};