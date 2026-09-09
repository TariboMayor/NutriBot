const { generateReply } = require("../services/chatService");

const chat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        error: "Please provide a message.",
      });
    }

    const reply = await generateReply(message);

    res.json({
      reply: reply,
    });
  } catch (error) {
    console.error("Chat error:", error.message);

    res.status(500).json({
      error: "Something went wrong while processing your message.",
    });
  }
};

module.exports = { chat };