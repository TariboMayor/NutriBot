const API_URL = "http://localhost:5000/api/hospital-services";

function getToken() {
  return localStorage.getItem("nutribot_token");
}

async function request(endpoint, options = {}) {
  const token = getToken();

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message || "The hospital services request failed."
    );
  }

  return data;
}

export async function getMyHospitalServices() {
  return request("/hospital/current");
}

export async function getMedicalServiceCatalogue() {
  return request("/catalogue");
}

export async function addHospitalService(service) {
  return request("/", {
    method: "POST",
    body: JSON.stringify(service),
  });
}

export async function updateHospitalService(id, updates) {
  return request(`/${id}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

export async function deactivateHospitalService(id) {
  return request(`/${id}`, {
    method: "DELETE",
  });
}