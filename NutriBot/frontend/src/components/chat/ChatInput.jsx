import { useState } from "react";
import "./ChatInput.css";

function ChatInput({ chatMessages, setChatMessages }) {
  const [inputText, setInputText] = useState("");

  function saveInputText(event) {
    setInputText(event.target.value);
  }

 async function sendMessage() {
  if (!inputText.trim()) {
    return;
  }

  const newMessage = {
    id: crypto.randomUUID(),
    role: "user",
    content: inputText,
  };

  setChatMessages([...chatMessages, newMessage]);

  try {
    const response = await fetch("http://localhost:5000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: inputText,
      }),
    });

    const data = await response.json();

    const botMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: data.reply,
    };

    setChatMessages([...chatMessages, newMessage, botMessage]);
  } catch (error) {
    console.error("Error sending message:", error);
  }

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