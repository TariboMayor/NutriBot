import { useState } from "react";
import { Plus, Search, Trash2, MessageSquare, X } from "lucide-react";
import "./ConversationList.css";

function ConversationList({
  conversations,
  activeId,
  onSelect,
  onCreate,
  onDelete,
}) {
  const [query, setQuery] = useState("");

  const filteredConversations = conversations.filter((conversation) =>
    conversation.title?.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <aside className="conversation-sidebar">
      {/* Logo */}
      <div className="conversation-brand">
        <h2>NutriBot</h2>
        <p>Your AI Health Assistant</p>
      </div>

      {/* New Chat */}
      <button className="new-chat-button" onClick={onCreate}>
        <Plus size={18} />
        <span>New Chat</span>
      </button>

      {/* Search */}
      <div className="conversation-search">
        <Search size={16} />

        <input
          type="text"
          placeholder="Search chats..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {query && (
          <button onClick={() => setQuery("")}>
            <X size={15} />
          </button>
        )}
      </div>

      {/* Conversation List */}
      <div className="conversation-list">
        {filteredConversations.length === 0 ? (
          <div className="no-conversations">
            <MessageSquare size={28} />
            <p>{query ? "No chats found" : "No conversations yet"}</p>
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`conversation-item ${
                activeId === conversation.id ? "active" : ""
              }`}
              onClick={() => onSelect(conversation.id)}
            >
              <MessageSquare size={16} />

              <div className="conversation-info">
                <p>{conversation.title}</p>

                {conversation.last_message && (
                  <span>{conversation.last_message}</span>
                )}
              </div>

              <button
                className="delete-conversation"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(conversation.id);
                }}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}

export default ConversationList;
