import { useState } from "react";

import {
  Plus,
  Search,
  Trash2,
  MessageSquare,
  X,
} from "lucide-react";

import "./ConversationList.css";

function ConversationList({
  conversations = [],
  activeId,
  onSelect,
  onCreate,
  onDelete,
}) {
  const [query, setQuery] = useState("");

  const searchText =
    query.trim().toLowerCase();

  const filteredConversations =
    conversations.filter((conversation) => {
      const title =
        conversation.title?.toLowerCase() || "";

      const lastMessage =
        conversation.last_message?.toLowerCase() ||
        "";

      return (
        !searchText ||
        title.includes(searchText) ||
        lastMessage.includes(searchText)
      );
    });

  function clearSearch() {
    setQuery("");
  }

  function handleConversationKeyDown(
    event,
    conversationId
  ) {
    if (
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();

      if (onSelect) {
        onSelect(conversationId);
      }
    }
  }

  return (
    <aside className="conversation-sidebar">

      {/* =========================================
          BRAND
      ========================================= */}

      <div className="conversation-brand">
        <div className="conversation-brand-mark">
          N
        </div>

        <div className="conversation-brand-text">
          <h2>Nia (NutriBot)</h2>

          <p>
            Your AI Health Assistant
          </p>
        </div>
      </div>


      {/* =========================================
          NEW CHAT
      ========================================= */}

      <button
        type="button"
        className="new-chat-button"
        onClick={onCreate}
      >
        <Plus
          size={18}
          strokeWidth={2.2}
        />

        <span>
          New Chat
        </span>
      </button>


      {/* =========================================
          SEARCH
      ========================================= */}

      <div className="conversation-search">
        <Search
          size={16}
          strokeWidth={2}
        />

        <input
          type="text"
          placeholder="Search chats..."
          value={query}
          onChange={(event) =>
            setQuery(event.target.value)
          }
          aria-label="Search conversations"
        />

        {query && (
          <button
            type="button"
            className="clear-search-button"
            onClick={clearSearch}
            aria-label="Clear search"
          >
            <X size={15} />
          </button>
        )}
      </div>


      {/* =========================================
          CONVERSATION HEADING
      ========================================= */}

      <div className="conversation-list-header">
        <span>
          RECENT CHATS
        </span>

        {conversations.length > 0 && (
          <span>
            {conversations.length}
          </span>
        )}
      </div>


      {/* =========================================
          CONVERSATION LIST
      ========================================= */}

      <div className="conversation-list">

        {filteredConversations.length === 0 ? (

          <div className="no-conversations">

            <div className="no-conversations-icon">
              <MessageSquare
                size={24}
              />
            </div>

            <p>
              {searchText
                ? "No chats found"
                : "No conversations yet"}
            </p>

            <span>
              {searchText
                ? "Try a different search."
                : "Start a new conversation with Nia."}
            </span>

          </div>

        ) : (

          filteredConversations.map(
            (conversation) => {

              const isActive =
                activeId ===
                conversation.id;

              const title =
                conversation.title ||
                "New Conversation";

              return (
                <div
                  key={conversation.id}
                  className={`conversation-item ${
                    isActive
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    onSelect(
                      conversation.id
                    )
                  }
                  onKeyDown={(event) =>
                    handleConversationKeyDown(
                      event,
                      conversation.id
                    )
                  }
                  role="button"
                  tabIndex={0}
                  aria-current={
                    isActive
                      ? "true"
                      : undefined
                  }
                >

                  {/* Conversation icon */}

                  <div className="conversation-icon">
                    <MessageSquare
                      size={16}
                      strokeWidth={1.8}
                    />
                  </div>


                  {/* Conversation information */}

                  <div className="conversation-info">

                    <p title={title}>
                      {title}
                    </p>

                    {conversation.last_message && (
                      <span
                        title={
                          conversation.last_message
                        }
                      >
                        {
                          conversation.last_message
                        }
                      </span>
                    )}

                  </div>


                  {/* Delete */}

                  <button
                    type="button"
                    className="delete-conversation"
                    onClick={(event) => {
                      event.stopPropagation();

                      if (onDelete) {
                        onDelete(
                          conversation.id
                        );
                      }
                    }}
                    aria-label={`Delete ${title}`}
                  >
                    <Trash2
                      size={15}
                      strokeWidth={1.8}
                    />
                  </button>

                </div>
              );
            }
          )
        )}

      </div>

    </aside>
  );
}

export default ConversationList;
