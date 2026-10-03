import { useState } from "react";
import { Send } from "lucide-react";

import {
  sendChatMessage,
  createConversation,
} from "../../services/chatService";

import "./ChatInput.css";

function ChatInput({
  activeConversation,
  setConversations,
  setActiveConversation,
  onConversationUpdated,
  suggestedMessage = "",
  onSuggestedMessageUsed,
  onSendingChange,
}) {
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);

  const displayedText =
    suggestedMessage || inputText;

  function handleChange(event) {
    const value = event.target.value;

    if (suggestedMessage) {
      if (onSuggestedMessageUsed) {
        onSuggestedMessageUsed();
      }
    }

    setInputText(value);
  }

  async function sendMessage() {
    const messageText =
      displayedText.trim();

    if (!messageText || sending) {
      return;
    }

    try {
      setSending(true);

      if (onSendingChange) {
        onSendingChange(true);
      }

      let conversation =
        activeConversation;

      /*
       * If there is no active conversation,
       * create one automatically.
       */
      if (!conversation) {
        const conversationData =
          await createConversation(
            "New Conversation"
          );

        conversation =
          conversationData.conversation;

        if (!conversation) {
          throw new Error(
            "Could not create a conversation."
          );
        }

        const newConversation = {
          ...conversation,
          messages: [],
        };

        setConversations(
          (previous) => [
            newConversation,
            ...previous,
          ]
        );

        setActiveConversation(
          newConversation
        );
      }

      /*
       * Show the user's message immediately
       * while Nia is responding.
       */
      const temporaryUserMessage = {
        id: `temp-user-${Date.now()}`,
        role: "USER",
        content: messageText,
      };

      setActiveConversation(
        (previous) => ({
          ...(previous || conversation),

          messages: [
            ...(previous?.messages || []),
            temporaryUserMessage,
          ],
        })
      );

      setInputText("");

      if (onSuggestedMessageUsed) {
        onSuggestedMessageUsed();
      }

      /*
       * Send the message to the backend.
       */
      const data =
        await sendChatMessage(
          conversation.id,
          messageText
        );

      /*
       * Replace the temporary user message
       * with the real database messages.
       */
      setActiveConversation(
        (previous) => ({
          ...(previous || conversation),
          ...(data.conversation || {}),

          messages: [
            ...(previous?.messages || []).filter(
              (message) =>
                !String(message.id).startsWith(
                  "temp-user-"
                )
            ),

            ...(data.userMessage
              ? [data.userMessage]
              : []),

            ...(data.assistantMessage
              ? [data.assistantMessage]
              : []),
          ],
        })
      );

      /*
       * Update the conversation list.
       */
      if (data.conversation) {
        setConversations(
          (previous) =>
            previous.map(
              (item) =>
                item.id ===
                data.conversation.id
                  ? {
                      ...item,
                      ...data.conversation,
                      last_message:
                        messageText,
                    }
                  : item
            )
        );

        if (onConversationUpdated) {
          onConversationUpdated(
            data.conversation
          );
        }
      }
    } catch (error) {
      console.error(
        "Error sending message:",
        error
      );

      const errorMessage = {
        id: `error-${Date.now()}`,
        role: "ASSISTANT",
        content:
          "I'm sorry, I couldn't connect to NutriBot right now. Please try again.",
      };

      setActiveConversation(
        (previous) => ({
          ...(previous || {}),

          messages: [
            ...(previous?.messages || []).filter(
              (message) =>
                !String(message.id).startsWith(
                  "temp-user-"
                )
            ),
            errorMessage,
          ],
        })
      );
    } finally {
      setSending(false);

      if (onSendingChange) {
        onSendingChange(false);
      }
    }
  }

  function handleKeyDown(event) {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      sendMessage();
    }
  }

  const canSend =
    Boolean(displayedText.trim()) &&
    !sending;

  return (
    <div className="chat-input-area">
      <div className="chat-composer">

        <textarea
          className="chat-input"
          value={displayedText}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask Nia anything..."
          rows={1}
          disabled={sending}
          aria-label="Message Nia"
        />

        <button
          type="button"
          className="send-button"
          onClick={sendMessage}
          disabled={!canSend}
          aria-label={
            sending
              ? "Sending message"
              : "Send message"
          }
        >
          {sending ? (
            <span className="send-spinner"></span>
          ) : (
            <Send
              size={18}
              strokeWidth={2.2}
            />
          )}
        </button>

      </div>

      <p className="chat-input-hint">
        Nia can provide general nutrition
        and wellness information. · Enter to
        send · Shift + Enter for a new line
      </p>
    </div>
  );
}

export default ChatInput;