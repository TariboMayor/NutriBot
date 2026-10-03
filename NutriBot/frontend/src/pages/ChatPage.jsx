import { useState } from "react";
import {
  Apple,
  Droplets,
  HeartPulse,
} from "lucide-react";

import UserSidebar from "../components/navigation/UserSidebar";
import ChatInput from "../components/chat/ChatInput";
import ChatMessages from "../components/chat/ChatMessages";
import ConversationList from "../components/Conversation/ConversationList";

import "./ChatPage.css";

function ChatPage() {
  const [conversations, setConversations] = useState([
    {
      id: "1",
      title: "Nutrition information",
      last_message:
        "Can you give me nutrition information?",
      messages: [
        {
          id: "1",
          role: "assistant",
          content:
            "Hello! 👋 I'm Nia, your NutriBot health assistant.",
        },
        {
          id: "2",
          role: "user",
          content:
            "Can you give me nutrition information?",
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
      last_message:
        "What healthy foods can I eat?",
      messages: [
        {
          id: "4",
          role: "assistant",
          content:
            "Let's talk about healthy Nigerian foods. 🇳🇬",
        },
        {
          id: "5",
          role: "user",
          content:
            "What healthy foods can I eat?",
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
      last_message:
        "How much water should I drink?",
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
          content:
            "How much water should I drink?",
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

  /*
   * This value is passed directly to ChatInput.
   * No useEffect is needed.
   */
  const [suggestedMessage, setSuggestedMessage] =
    useState("");

  const activeConversation = conversations.find(
    (conversation) =>
      conversation.id === activeId
  );

  /*
   * Create a new conversation.
   */
  const createConversation = () => {
    const newConversation = {
      id: Date.now().toString(),
      title: "New Conversation",
      last_message: "",
      messages: [],
    };

    setConversations((previous) => [
      newConversation,
      ...previous,
    ]);

    setActiveId(newConversation.id);

    setSuggestedMessage("");
  };

  /*
   * Delete a conversation.
   */
  const deleteConversation = (id) => {
    setConversations((previous) =>
      previous.filter(
        (conversation) =>
          conversation.id !== id
      )
    );

    if (activeId === id) {
      const remaining = conversations.filter(
        (conversation) =>
          conversation.id !== id
      );

      setActiveId(
        remaining.length > 0
          ? remaining[0].id
          : null
      );
    }

    setSuggestedMessage("");
  };

  /*
   * Select a conversation.
   */
  const handleSelectConversation = (id) => {
    setActiveId(id);
    setSuggestedMessage("");
  };

  /*
   * Select one of Nia's suggested questions.
   */
  const handleSuggestion = (message) => {
    setSuggestedMessage(message);
  };

  /*
   * Clear the suggestion after ChatInput
   * has received it.
   */
  const clearSuggestedMessage = () => {
    setSuggestedMessage("");
  };

  return (
    <div className="chat-page">

      {/* =====================================================
          FIXED NUTRIBOT NAVIGATION
      ===================================================== */}

      <UserSidebar />


      {/* =====================================================
          CONVERSATION HISTORY
      ===================================================== */}

      <ConversationList
        conversations={conversations}
        activeId={activeId}
        onSelect={handleSelectConversation}
        onCreate={createConversation}
        onDelete={deleteConversation}
      />


      {/* =====================================================
          MAIN CHAT
      ===================================================== */}

      <main className="chat-main">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="chat-header">

          <div className="chat-header-info">

            <div className="nia-avatar">
              N
            </div>

            <div>

              <h2>
                Nia
              </h2>

              <p>
                <span className="online-dot"></span>

                Online · NutriBot Health Assistant
              </p>

            </div>

          </div>

        </header>


        {/* =================================================
            CHAT CONTENT
        ================================================= */}

        <div className="chat-content">

          {!activeConversation ||
          activeConversation.messages.length === 0 ? (

            <div className="welcome-screen">

              <div className="welcome-avatar">
                N
              </div>

              <h1>
                Welcome to NutriBot 👋
              </h1>

              <p>
                I'm Nia, your health and nutrition
                assistant.
              </p>

              <p>
                Ask me about nutrition, Nigerian foods,
                healthy eating, wellness, and more.
              </p>


              {/* =================================================
                  SUGGESTIONS
              ================================================= */}

              <div className="suggestion-grid">

                <button
                  type="button"
                  onClick={() =>
                    handleSuggestion(
                      "What are healthy Nigerian foods?"
                    )
                  }
                >
                  <Apple size={20} />

                  <span>
                    What are healthy Nigerian foods?
                  </span>
                </button>


                <button
                  type="button"
                  onClick={() =>
                    handleSuggestion(
                      "How much water should I drink daily?"
                    )
                  }
                >
                  <Droplets size={20} />

                  <span>
                    How much water should I drink
                    daily?
                  </span>
                </button>


                <button
                  type="button"
                  onClick={() =>
                    handleSuggestion(
                      "How can I improve my diet?"
                    )
                  }
                >
                  <HeartPulse size={20} />

                  <span>
                    How can I improve my diet?
                  </span>
                </button>

              </div>

            </div>

          ) : (

            <ChatMessages
              chatMessages={
                activeConversation.messages
              }
            />

          )}

        </div>


        {/* =================================================
            CHAT INPUT
        ================================================= */}

        <ChatInput
          activeConversation={activeConversation}
          setConversations={setConversations}
          suggestedMessage={suggestedMessage}
          onSuggestedMessageUsed={
            clearSuggestedMessage
          }
        />

      </main>

    </div>
  );
}

export default ChatPage;