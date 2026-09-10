import { useState } from "react";
import ChatInput from "../components/chat/ChatInput";
import ChatMessages from "../components/chat/ChatMessages";
import "../App.css";

function ChatPage() {
  const [chatMessages, setChatMessages] = useState([
    {
      id: "1",
      role: "assistant",
      content: "Hello! 👋 I'm Nia, a NutriBot. How can I help you today?",
    },
    {
      id: "2",
      role: "user",
      content: "Can you give me nutrition information?",
    },
  ]);

  return (
    <div className="app-container">
      <ChatMessages chatMessages={chatMessages} />

      <ChatInput
        chatMessages={chatMessages}
        setChatMessages={setChatMessages}
      />
    </div>
  );
}

export default ChatPage;