const { generateReply } = require("../services/chatService");

const chat = (req, res) => {
  const { message } = req.body;

  const reply = generateReply(message);

  res.json({
    reply: reply,
  });
};

module.exports = { chat };