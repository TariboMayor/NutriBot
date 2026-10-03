const API_BASE_URL = "http://localhost:5000/api";

function getToken() {
  return localStorage.getItem("nutribot_token");
}

function getUser() {
  const storedUser =
    localStorage.getItem("nutribot_user");

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch {
    return null;
  }
}

function getUserId() {
  const user = getUser();

  return (
    user?.id ||
    user?.userId ||
    user?.user_id ||
    null
  );
}

async function getNotifications() {
  const token = getToken();
  const userId = getUserId();

  if (!token || !userId) {
    throw new Error(
      "User authentication information is missing"
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/notifications/user/${userId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to load notifications"
    );
  }

  return response.json();
}

async function getUnreadNotificationCount() {
  const token = getToken();
  const userId = getUserId();

  if (!token || !userId) {
    throw new Error(
      "User authentication information is missing"
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/notifications/user/${userId}/unread-count`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to load unread notification count"
    );
  }

  return response.json();
}

async function markNotificationAsRead(
  notificationId
) {
  const token = getToken();
  const userId = getUserId();

  if (!token || !userId) {
    throw new Error(
      "User authentication information is missing"
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/notifications/${notificationId}/read`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        user_id: userId,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to mark notification as read"
    );
  }

  return response.json();
}

async function markAllNotificationsAsRead() {
  const token = getToken();
  const userId = getUserId();

  if (!token || !userId) {
    throw new Error(
      "User authentication information is missing"
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/notifications/user/${userId}/read-all`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to mark all notifications as read"
    );
  }

  return response.json();
}

export {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};