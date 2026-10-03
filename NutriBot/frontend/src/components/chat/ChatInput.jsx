import { useState } from "react";
import "./ChatInput.css";

function createConversationTitle(message) {
  const cleanedMessage = message
    .replace(/\s+/g, " ")
    .trim();

  if (!cleanedMessage) {
    return "New Conversation";
  }

  const withoutQuestionMark =
    cleanedMessage.replace(/[?!.]+$/, "");

  const words = withoutQuestionMark.split(" ");

  if (words.length <= 6) {
    return withoutQuestionMark;
  }

  return `${words.slice(0, 6).join(" ")}...`;
}

function ChatInput({
  activeConversation,
  setConversations,
  suggestedMessage = "",
  onSuggestedMessageUsed,
}) {
  const [inputText, setInputText] = useState("");

  /*
   * When a Nia suggestion is selected, display it
   * without using useEffect.
   */
  const displayedText =
    suggestedMessage || inputText;

  function saveInputText(event) {
    const value = event.target.value;

    /*
     * Once the user starts typing, clear the
     * selected suggestion.
     */
    if (suggestedMessage) {
      if (onSuggestedMessageUsed) {
        onSuggestedMessageUsed();
      }
    }

    setInputText(value);
  }

  async function sendMessage() {
    const messageText = displayedText.trim();

    if (!messageText || !activeConversation) {
      return;
    }

    /*
     * Check whether this is the first message
     * in this conversation.
     */
    const isFirstMessage =
      activeConversation.messages.length === 0;

    /*
     * Create a title only for a brand-new
     * conversation.
     */
    const conversationTitle = isFirstMessage
      ? createConversationTitle(messageText)
      : activeConversation.title;

    const newMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: messageText,
    };

    /*
     * Add the user's message immediately.
     */
    setConversations((previous) =>
      previous.map((conversation) =>
        conversation.id === activeConversation.id
          ? {
              ...conversation,
              title: conversationTitle,
              messages: [
                ...conversation.messages,
                newMessage,
              ],
              last_message: messageText,
            }
          : conversation
      )
    );

    /*
     * Clear the input immediately.
     */
    setInputText("");

    if (onSuggestedMessageUsed) {
      onSuggestedMessageUsed();
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: messageText,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Chat request failed: ${response.status}`
        );
      }

      const data = await response.json();

      const botMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          data.reply ||
          "I'm sorry, I couldn't generate a response right now.",
      };

      /*
       * Add Nia's response.
       */
      setConversations((previous) =>
        previous.map((conversation) =>
          conversation.id === activeConversation.id
            ? {
                ...conversation,
                messages: [
                  ...conversation.messages,
                  botMessage,
                ],
              }
            : conversation
        )
      );
    } catch (error) {
      console.error(
        "Error sending message:",
        error
      );

      const errorMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          "I'm sorry, I couldn't connect to NutriBot right now. Please try again.",
      };

      setConversations((previous) =>
        previous.map((conversation) =>
          conversation.id === activeConversation.id
            ? {
                ...conversation,
                messages: [
                  ...conversation.messages,
                  errorMessage,
                ],
              }
            : conversation
        )
      );
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="chat-input-container">
      <input
        type="text"
        placeholder="Ask Nia anything..."
        onChange={saveInputText}
        onKeyDown={handleKeyDown}
        value={displayedText}
        className="chat-input"
      />

      <button
        type="button"
        onClick={sendMessage}
        className="send-button"
        disabled={
          !displayedText.trim() ||
          !activeConversation
        }
      >
        Send
      </button>
    </div>
  );
}

export default ChatInput;