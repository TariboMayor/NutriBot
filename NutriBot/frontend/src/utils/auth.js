export function getToken() {
  return localStorage.getItem("nutribot_token");
}

export function getUser() {
  const storedUser = localStorage.getItem("nutribot_user");

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch (error) {
    console.error("Could not read stored user:", error);
    return null;
  }
}

export function isAuthenticated() {
  return Boolean(getToken() && getUser());
}

export function logout() {
  localStorage.removeItem("nutribot_token");
  localStorage.removeItem("nutribot_user");
}

export async function authenticatedFetch(url, options = {}) {
  const token = getToken();

  const headers = {
    ...(options.headers || {}),
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return fetch(url, {
    ...options,
    headers,
  });
}