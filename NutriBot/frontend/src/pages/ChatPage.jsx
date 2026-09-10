import { useState } from "react";
import ChatInput from "../components/chat/ChatInput";
import ChatMessages from "../components/chat/ChatMessages";
import ConversationList from "../components/Conversation/ConversationList";
import "./ChatPage.css";

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

      {/* Left sidebar */}
      <ConversationList
        conversations={conversations}
        activeId={activeId}
        onSelect={setActiveId}
        onCreate={createConversation}
        onDelete={deleteConversation}
      />

      {/* Main chatbot */}
      <main className="chat-main">

        <header className="chat-header">
          <div>
            <h2>NutriBot</h2>
            <p>● Online</p>
          </div>
        </header>

        <div className="chat-content">
          <ChatMessages chatMessages={chatMessages} />
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