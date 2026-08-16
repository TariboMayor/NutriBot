import "./ChatMessage.css";

function ChatMessage({ message }) {
  const isUser = message.role === "user";

  return (
    <div className={`chat-message ${isUser ? "user" : "bot"}`}>
      <div className={`message-avatar ${isUser ? "user" : "bot"}`}>
        {isUser ? "You" : "Nia"}
      </div>

      <div className={`message-content ${isUser ? "user" : "bot"}`}>
        {message.content}
      </div>
    </div>
  );
}

export default ChatMessage;