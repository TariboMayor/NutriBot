import "./ChatMessage.css";

function ChatMessage({ message }) {
  if (!message) {
    return null;
  }

  const role =
    message.role?.toUpperCase();

  const isUser =
    role === "USER";

  return (
    <div
      className={`chat-message ${
        isUser ? "user" : "bot"
      }`}
    >

      {/* =================================================
          AVATAR
          ================================================= */}

      <div
        className={`message-avatar ${
          isUser ? "user" : "bot"
        }`}
      >
        {isUser ? "You" : "N"}
      </div>

      {/* =================================================
          MESSAGE
          ================================================= */}

      <div
        className={`message-wrapper ${
          isUser ? "user" : "bot"
        }`}
      >

        <div className="message-label">
          {isUser ? "You" : "Nia"}
        </div>

        <div
          className={`message-content ${
            isUser ? "user" : "bot"
          }`}
        >
          {message.content}
        </div>

      </div>

    </div>
  );
}

export default ChatMessage;