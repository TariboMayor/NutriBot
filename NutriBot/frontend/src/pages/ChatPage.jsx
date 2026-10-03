import { useEffect, useState } from "react";

import {
  Apple,
  Droplets,
  HeartPulse,
  Sparkles,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

import UserSidebar from "../components/navigation/UserSidebar";
import ChatInput from "../components/chat/ChatInput";
import ChatMessages from "../components/chat/ChatMessages";
import ConversationList from "../components/Conversation/ConversationList";

import {
  getConversations,
  getConversation,
  createConversation,
  deleteConversation,
} from "../services/chatService";

import "./ChatPage.css";


function ChatPage() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [activeConversation, setActiveConversation] =
    useState(null);

  const [suggestedMessage, setSuggestedMessage] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [loadingConversation, setLoadingConversation] =
    useState(false);

  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState("");


  /* ========================================
     LOAD CONVERSATIONS
  ======================================== */

  useEffect(() => {
    let cancelled = false;

    async function loadConversations() {
      try {
        setLoading(true);
        setError("");

        const data = await getConversations();

        if (cancelled) {
          return;
        }

        const loaded =
          data?.conversations || [];

        setConversations(loaded);

        if (loaded.length > 0) {
          setActiveId(loaded[0].id);
        }
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error(
          "Error loading conversations:",
          err
        );

        setError(
          err.message ||
            "Could not load your conversations."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadConversations();

    return () => {
      cancelled = true;
    };
  }, []);


  /* ========================================
     LOAD ACTIVE CONVERSATION
  ======================================== */

  useEffect(() => {
    let cancelled = false;

    if (!activeId) {
      return undefined;
    }

    async function loadConversation() {
      try {
        setLoadingConversation(true);
        setError("");

        const data =
          await getConversation(activeId);

        if (cancelled) {
          return;
        }

        setActiveConversation({
          ...data.conversation,
          messages: data.messages || [],
        });
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error(
          "Error loading conversation:",
          err
        );

        setError(
          err.message ||
            "Could not load conversation."
        );
      } finally {
        if (!cancelled) {
          setLoadingConversation(false);
        }
      }
    }

    loadConversation();

    return () => {
      cancelled = true;
    };
  }, [activeId]);


  /* ========================================
     CREATE NEW CONVERSATION
  ======================================== */

  async function handleCreateConversation() {
    try {
      setError("");

      const data =
        await createConversation(
          "New Conversation"
        );

      const conversation =
        data?.conversation;

      if (!conversation) {
        throw new Error(
          "Conversation was not created."
        );
      }

      const newConversation = {
        ...conversation,
        messages: [],
      };

      setConversations((previous) => [
        newConversation,
        ...previous,
      ]);

      setActiveConversation(
        newConversation
      );

      setActiveId(newConversation.id);

      setSuggestedMessage("");
    } catch (err) {
      console.error(
        "Create conversation error:",
        err
      );

      setError(
        err.message ||
          "Could not create a new conversation."
      );
    }
  }


  /* ========================================
     DELETE CONVERSATION
  ======================================== */

  async function handleDeleteConversation(id) {
    const conversation =
      conversations.find(
        (item) => item.id === id
      );

    const confirmed = window.confirm(
      `Delete "${
        conversation?.title ||
        "this conversation"
      }"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteConversation(id);

      const remaining =
        conversations.filter(
          (item) => item.id !== id
        );

      setConversations(remaining);

      if (id === activeId) {
        if (remaining.length > 0) {
          setActiveId(remaining[0].id);
        } else {
          setActiveId(null);
          setActiveConversation(null);
        }
      }
    } catch (err) {
      console.error(
        "Delete conversation error:",
        err
      );

      setError(
        err.message ||
          "Could not delete conversation."
      );
    }
  }


  /* ========================================
     SELECT CONVERSATION
  ======================================== */

  function handleSelectConversation(id) {
    if (id === activeId) {
      return;
    }

    setActiveId(id);
    setActiveConversation(null);
    setSuggestedMessage("");
    setError("");
  }


  /* ========================================
     SUGGESTION
  ======================================== */

  function handleSuggestion(message) {
    setSuggestedMessage(message);
  }


  function clearSuggestedMessage() {
    setSuggestedMessage("");
  }


  /* ========================================
     UPDATE CONVERSATION
  ======================================== */

  function handleConversationUpdated(
    updatedConversation
  ) {
    if (!updatedConversation) {
      return;
    }

    setActiveConversation(
      (previous) => ({
        ...(previous || {}),
        ...updatedConversation,
      })
    );

    setConversations(
      (previous) =>
        previous.map(
          (conversation) =>
            conversation.id ===
            updatedConversation.id
              ? {
                  ...conversation,
                  ...updatedConversation,
                }
              : conversation
        )
    );
  }


  const hasMessages =
    Boolean(
      activeConversation?.messages?.length
    );


  /* ========================================
     RENDER
  ======================================== */

  return (
    <div className="chat-page">

      {/* ==================================
          LEFT SIDEBAR
      ================================== */}

      <aside className="chat-navigation">
        <UserSidebar />
      </aside>


      {/* ==================================
          CONVERSATION SIDEBAR
      ================================== */}

      <aside className="chat-conversations">
        <ConversationList
          conversations={conversations}
          activeId={activeId}
          onSelect={handleSelectConversation}
          onCreate={
            handleCreateConversation
          }
          onDelete={
            handleDeleteConversation
          }
        />
      </aside>


      {/* ==================================
          MAIN CHAT
      ================================== */}

      <main className="chat-main">

        {/* HEADER */}

        <header className="chat-header">

          <div className="chat-header-left">

            <div className="nia-avatar">
              N
            </div>

            <div className="chat-header-details">

              <div className="chat-title-row">

                <h2>Nia</h2>

                <span className="ai-badge">
                  AI
                </span>

              </div>

              <div className="chat-status">

                <span className="online-dot"></span>

                <span>Online</span>

                <span className="status-divider">
                  •
                </span>

                <span>
                  NutriBot Health Assistant
                </span>

              </div>

            </div>

          </div>


          <div className="header-trust">

            <ShieldCheck size={15} />

            <span>
              Private conversation
            </span>

          </div>

        </header>


        {/* ERROR */}

        {error && (
          <div className="chat-error">

            <div className="chat-error-icon">
              !
            </div>

            <span>{error}</span>

          </div>
        )}


        {/* CHAT CONTENT */}

        <div className="chat-content">

          {/* LOADING */}

          {loading && (
            <div className="chat-state">

              <div className="state-avatar">
                N
              </div>

              <div className="state-loader">
                <span></span>
                <span></span>
                <span></span>
              </div>

              <h2>
                Preparing your NutriBot
              </h2>

              <p>
                Loading your conversations...
              </p>

            </div>
          )}


          {/* LOADING CONVERSATION */}

          {!loading &&
            loadingConversation && (
              <div className="chat-state">

                <div className="state-avatar">
                  N
                </div>

                <div className="state-loader">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>

                <h2>
                  Opening conversation
                </h2>

                <p>
                  Nia is getting your
                  messages ready.
                </p>

              </div>
            )}


          {/* EXISTING MESSAGES */}

          {!loading &&
            !loadingConversation &&
            hasMessages && (
              <ChatMessages
                chatMessages={
                  activeConversation.messages
                }
                isTyping={isTyping}
              />
            )}


          {/* WELCOME */}

          {!loading &&
            !loadingConversation &&
            !hasMessages && (
              <div className="welcome-screen">

                <div className="welcome-inner">

                  <div className="welcome-brand">

                    <div className="welcome-avatar">
                      N
                    </div>

                    <div className="welcome-sparkle">
                      <Sparkles size={14} />
                    </div>

                  </div>


                  <span className="welcome-eyebrow">
                    YOUR PERSONAL HEALTH
                    ASSISTANT
                  </span>


                  <h1>
                    Hello, I'm Nia.
                  </h1>


                  <p className="welcome-description">
                    Your AI health and
                    nutrition assistant
                    for everyday wellness.
                  </p>


                  <p className="welcome-subtext">
                    Ask questions about
                    nutrition, Nigerian
                    foods, hydration,
                    healthy eating, and
                    more.
                  </p>


                  {/* SUGGESTIONS */}

                  <div className="suggestion-section">

                    <div className="suggestion-heading">

                      <span>
                        Try asking Nia
                      </span>

                      <div className="suggestion-line"></div>

                    </div>


                    <div className="suggestion-grid">

                      <button
                        type="button"
                        onClick={() =>
                          handleSuggestion(
                            "What are healthy Nigerian foods?"
                          )
                        }
                      >

                        <div className="suggestion-icon">
                          <Apple size={19} />
                        </div>

                        <div className="suggestion-content">

                          <span className="suggestion-title">
                            Nigerian nutrition
                          </span>

                          <span className="suggestion-text">
                            What are healthy
                            Nigerian foods?
                          </span>

                        </div>

                        <ChevronRight
                          size={16}
                          className="suggestion-arrow"
                        />

                      </button>


                      <button
                        type="button"
                        onClick={() =>
                          handleSuggestion(
                            "How much water should I drink daily?"
                          )
                        }
                      >

                        <div className="suggestion-icon">
                          <Droplets size={19} />
                        </div>

                        <div className="suggestion-content">

                          <span className="suggestion-title">
                            Hydration
                          </span>

                          <span className="suggestion-text">
                            How much water
                            should I drink daily?
                          </span>

                        </div>

                        <ChevronRight
                          size={16}
                          className="suggestion-arrow"
                        />

                      </button>


                      <button
                        type="button"
                        onClick={() =>
                          handleSuggestion(
                            "How can I improve my diet?"
                          )
                        }
                      >

                        <div className="suggestion-icon">
                          <HeartPulse size={19} />
                        </div>

                        <div className="suggestion-content">

                          <span className="suggestion-title">
                            Healthy living
                          </span>

                          <span className="suggestion-text">
                            How can I improve
                            my diet?
                          </span>

                        </div>

                        <ChevronRight
                          size={16}
                          className="suggestion-arrow"
                        />

                      </button>

                    </div>

                  </div>


                  <div className="welcome-note">

                    <ShieldCheck size={14} />

                    <span>
                      Nia provides general
                      health and nutrition
                      information.
                    </span>

                  </div>

                </div>

              </div>
            )}

        </div>


        {/* MESSAGE INPUT */}

        <ChatInput
          activeConversation={
            activeConversation
          }
          setConversations={
            setConversations
          }
          setActiveConversation={
            setActiveConversation
          }
          onConversationUpdated={
            handleConversationUpdated
          }
          suggestedMessage={
            suggestedMessage
          }
          onSuggestedMessageUsed={
            clearSuggestedMessage
          }
          onSendingChange={
            setIsTyping
          }
        />

      </main>

    </div>
  );
}


export default ChatPage;
