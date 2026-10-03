const API_URL = "http://localhost:5000/api";

function getToken() {
  return localStorage.getItem("nutribot_token");
}

async function request(endpoint, options = {}) {
  const token = getToken();

  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,
      headers: {
        "Content-Type": "application/json",

        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),

        ...(options.headers || {}),
      },
    }
  );

  const data =
    await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message ||
        data.error ||
        "Chat request failed."
    );
  }

  return data;
}

export async function getConversations() {
  return request("/chat/conversations");
}

export async function createConversation(
  title = "New Conversation"
) {
  return request("/chat/conversations", {
    method: "POST",
    body: JSON.stringify({
      title,
    }),
  });
}

export async function getConversation(
  conversationId
) {
  return request(
    `/chat/conversations/${conversationId}`
  );
}

export async function deleteConversation(
  conversationId
) {
  return request(
    `/chat/conversations/${conversationId}`,
    {
      method: "DELETE",
    }
  );
}

export async function sendChatMessage(
  conversationId,
  message
) {
  return request("/chat", {
    method: "POST",
    body: JSON.stringify({
      conversationId,
      message,
    }),
  });
}