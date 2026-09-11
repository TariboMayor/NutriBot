import { useState } from "react";
import ChatInput from "../components/chat/ChatInput";
import ChatMessages from "../components/chat/ChatMessages";
import ConversationList from "../components/Conversation/ConversationList";
import "./ChatPage.css";

function ChatPage() {
  const [chatMessages, setChatMessages] = useState([]);

  const [conversations, setConversations] = useState([
    {
      id: "1",
      title: "Nutrition information",
      last_message: "Can you give me nutrition information?",
    },
    {
      id: "2",
      title: "Healthy Nigerian foods",
      last_message: "What healthy foods can I eat?",
    },
    {
      id: "3",
      title: "Water intake",
      last_message: "How much water should I drink?",
    },
  ]);

  const [activeId, setActiveId] = useState("1");

  const createConversation = () => {
    const newConversation = {
      id: Date.now().toString(),
      title: "New Conversation",
      last_message: "",
    };

    setConversations((prev) => [newConversation, ...prev]);
    setActiveId(newConversation.id);
    setChatMessages([]);
  };

  const deleteConversation = (id) => {
    setConversations((prev) =>
      prev.filter((conversation) => conversation.id !== id)
    );

    if (activeId === id) {
      setActiveId(null);
      setChatMessages([]);
    }
  };

 return (
  <div className="chat-page">

    <ConversationList
      conversations={conversations}
      activeId={activeId}
      onSelect={setActiveId}
      onCreate={createConversation}
      onDelete={deleteConversation}
    />

    <main className="chat-main">

      <header className="chat-header">
        <div className="chat-header-info">
          <div className="nia-avatar">
            N
          </div>

          <div>
            <h2>Nia</h2>
            <p>● Online · NutriBot Health Assistant</p>
          </div>
        </div>
      </header>

      <div className="chat-content">
        {chatMessages.length === 0 ? (
          <div className="welcome-screen">
            <div className="welcome-avatar">N</div>

            <h1>Welcome to NutriBot 👋</h1>

            <p>
              I'm Nia, your health and nutrition assistant.
            </p>

            <p>
              Ask me about nutrition, Nigerian foods, healthy eating,
              wellness, and more.
            </p>
          </div>
        ) : (
          <ChatMessages chatMessages={chatMessages} />
        )}
      </div>

      <ChatInput
        chatMessages={chatMessages}
        setChatMessages={setChatMessages}
      />

    </main>
  </div>
);
}

export default ChatPage;