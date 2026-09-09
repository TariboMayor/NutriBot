const { generateReply } = require("../services/chatService");

const chat = async (req, res) => {
  const { message } = req.body;

  const reply = await generateReply(message);

  res.json({
    reply: reply,
  });
};

module.exports = { chat };