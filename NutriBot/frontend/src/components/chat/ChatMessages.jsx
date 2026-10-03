import { useRef, useEffect } from "react";

import ChatMessage from "./ChatMessage";

import "./ChatMessages.css";

function ChatMessages({
  chatMessages = [],
  isTyping = false,
}) {
  const chatMessagesRef = useRef(null);

  useEffect(() => {
    const containerElem =
      chatMessagesRef.current;

    if (containerElem) {
      containerElem.scrollTop =
        containerElem.scrollHeight;
    }
  }, [chatMessages, isTyping]);

  return (
    <div
      className="chat-messages-container"
      ref={chatMessagesRef}
    >
      {chatMessages.map((chatMessage) => (
        <ChatMessage
          message={chatMessage}
          key={chatMessage.id}
        />
      ))}

      {isTyping && (
        <div className="chat-message bot typing-message">
          <div className="message-avatar bot">
            N
          </div>

          <div className="message-wrapper bot">
            <div className="message-label">
              Nia
            </div>

            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatMessages;
