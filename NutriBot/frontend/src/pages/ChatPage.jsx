import { useState } from "react";
import ChatInput from "../components/chat/ChatInput";
import ChatMessages from "../components/chat/ChatMessages";
import ConversationList from "../components/Conversation/ConversationList";
import "./ChatPage.css";

function ChatPage() {
  //const [chatMessages, setChatMessages] = useState([]);

  const [conversations, setConversations] = useState([
    {
      id: "1",
      title: "Nutrition information",
      last_message: "Can you give me nutrition information?",
      messages: [
        {
          id: "1",
          role: "assistant",
          content: "Hello! 👋 I'm Nia, your NutriBot health assistant.",
        },
        {
          id: "2",
          role: "user",
          content: "Can you give me nutrition information?",
        },
        {
          id: "3",
          role: "assistant",
          content:
            "Of course! I can help you with nutrition, healthy eating, and Nigerian foods.",
        },
      ],
    },

    {
      id: "2",
      title: "Healthy Nigerian foods",
      last_message: "What healthy foods can I eat?",
      messages: [
        {
          id: "4",
          role: "assistant",
          content: "Let's talk about healthy Nigerian foods. 🇳🇬",
        },
        {
          id: "5",
          role: "user",
          content: "What healthy foods can I eat?",
        },
        {
          id: "6",
          role: "assistant",
          content:
            "You can include foods such as beans, vegetables, fruits, whole grains, and other balanced Nigerian meals.",
        },
      ],
    },

    {
      id: "3",
      title: "Water intake",
      last_message: "How much water should I drink?",
      messages: [
        {
          id: "7",
          role: "assistant",
          content:
            "Staying hydrated is an important part of healthy living. 💧",
        },
        {
          id: "8",
          role: "user",
          content: "How much water should I drink?",
        },
        {
          id: "9",
          role: "assistant",
          content:
            "Water needs vary from person to person. Your activity level, weather, and other factors can affect how much you need.",
        },
      ],
    },
  ]);

  const [activeId, setActiveId] = useState("1");

  const activeConversation = conversations.find(
    (conversation) => conversation.id === activeId,
  );
  const createConversation = () => {
    const newConversation = {
      id: Date.now().toString(),
      title: "New Conversation",
      last_message: "",
      messages: [],
    };

    setConversations((prev) => [newConversation, ...prev]);

    setActiveId(newConversation.id);
  };

  const deleteConversation = (id) => {
    setConversations((prev) =>
      prev.filter((conversation) => conversation.id !== id),
    );

    if (activeId === id) {
      setActiveId(null);
      // setChatMessages([]);
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
            <div className="nia-avatar">N</div>

            <div>
              <h2>Nia</h2>
              <p>● Online · NutriBot Health Assistant</p>
            </div>
          </div>
        </header>

        <div className="chat-content">
          {activeConversation?.messages?.length === 0 ? (
            <div className="welcome-screen">
              <div className="welcome-avatar">N</div>

              <h1>Welcome to NutriBot 👋</h1>

              <p>I'm Nia, your health and nutrition assistant.</p>

              <p>
                Ask me about nutrition, Nigerian foods, healthy eating,
                wellness, and more.
              </p>
            </div>
          ) : (
            <ChatMessages chatMessages={activeConversation?.messages || []} />
          )}
        </div>
        <ChatInput
          activeConversation={activeConversation}
          setConversations={setConversations}
        />
      </main>
    </div>
  );
}

export default ChatPage;
