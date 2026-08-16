import { useState } from "react";
import "./ChatInput.css";

function ChatInput({ chatMessages, setChatMessages }) {
  const [inputText, setInputText] = useState("");

  function saveInputText(event) {
    setInputText(event.target.value);
  }

  function sendMessage() {
    if (!inputText.trim()) {
      return;
    }

    const newMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: inputText,
    };

    setChatMessages([...chatMessages, newMessage]);

    setInputText("");
  }

  return (
    <div className="chat-input-container">
      <input
        type="text"
        placeholder="Send a message to NutriBot..."
        onChange={saveInputText}
        value={inputText}
        className="chat-input"
      />

      <button onClick={sendMessage} className="send-button">
        Send
      </button>
    </div>
  );
}

export default ChatInput;