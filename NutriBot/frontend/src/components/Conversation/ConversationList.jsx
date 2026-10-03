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
  conversations,
  activeId,
  onSelect,
  onCreate,
  onDelete,
}) {
  const [query, setQuery] = useState("");

  const searchText = query.trim().toLowerCase();

  const filteredConversations = conversations.filter(
    (conversation) => {
      const title =
        conversation.title?.toLowerCase() || "";

      const lastMessage =
        conversation.last_message?.toLowerCase() || "";

      return (
        !searchText ||
        title.includes(searchText) ||
        lastMessage.includes(searchText)
      );
    }
  );

  function clearSearch() {
    setQuery("");
  }

  return (
    <aside className="conversation-sidebar">
      {/* Brand */}
      <div className="conversation-brand">
        <div className="conversation-brand-mark">
          N
        </div>

        <div>
          <h2>Nia (NutriBot)</h2>
          <p>Your AI Health Assistant</p>
        </div>
      </div>

      {/* New Chat */}
      <button
        type="button"
        className="new-chat-button"
        onClick={onCreate}
      >
        <Plus size={18} strokeWidth={2.2} />
        <span>New Chat</span>
      </button>

      {/* Search */}
      <div className="conversation-search">
        <Search size={16} strokeWidth={2} />

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

      {/* Conversation heading */}
      <div className="conversation-list-header">
        <span>RECENT CHATS</span>

        {conversations.length > 0 && (
          <span>{conversations.length}</span>
        )}
      </div>

      {/* Conversation List */}
      <div className="conversation-list">
        {filteredConversations.length === 0 ? (
          <div className="no-conversations">
            <div className="no-conversations-icon">
              <MessageSquare size={24} />
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
            (conversation) => (
              <div
                key={conversation.id}
                className={`conversation-item ${
                  activeId === conversation.id
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  onSelect(conversation.id)
                }
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" ||
                    event.key === " "
                  ) {
                    event.preventDefault();
                    onSelect(conversation.id);
                  }
                }}
              >
                <div className="conversation-icon">
                  <MessageSquare
                    size={16}
                    strokeWidth={1.8}
                  />
                </div>

                <div className="conversation-info">
                  <p>
                    {conversation.title ||
                      "New Conversation"}
                  </p>

                  {conversation.last_message && (
                    <span>
                      {conversation.last_message}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  className="delete-conversation"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDelete(conversation.id);
                  }}
                  aria-label={`Delete ${
                    conversation.title ||
                    "conversation"
                  }`}
                >
                  <Trash2
                    size={15}
                    strokeWidth={1.8}
                  />
                </button>
              </div>
            )
          )
        )}
      </div>
    </aside>
  );
}

export default ConversationList;