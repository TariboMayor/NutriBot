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
        "Hospital appointment request failed."
    );
  }

  return data;
}


// ======================================================
// GET HOSPITAL APPOINTMENTS
// ======================================================

export async function getHospitalAppointments() {
  return request("/appointments/hospital");
}