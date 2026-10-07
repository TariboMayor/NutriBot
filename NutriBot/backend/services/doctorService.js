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
        "Doctor request failed."
    );
  }

  return data;
}


/*
 * Get all doctors belonging to a hospital.
 */
export async function getHospitalDoctors(
  hospitalId
) {
  return request(
    `/doctors/hospital/${hospitalId}`
  );
}


/*
 * Get one doctor.
 */
export async function getDoctor(
  doctorId
) {
  return request(
    `/doctors/${doctorId}`
  );
}


/*
 * Create a doctor.
 */
export async function createDoctor(
  doctorData
) {
  return request(
    "/doctors",
    {
      method: "POST",
      body: JSON.stringify(
        doctorData
      ),
    }
  );
}


/*
 * Update a doctor.
 */
export async function updateDoctor(
  doctorId,
  doctorData
) {
  return request(
    `/doctors/${doctorId}`,
    {
      method: "PUT",
      body: JSON.stringify(
        doctorData
      ),
    }
  );
}


/*
 * Deactivate a doctor.
 */
export async function deactivateDoctor(
  doctorId
) {
  return request(
    `/doctors/${doctorId}`,
    {
      method: "DELETE",
    }
  );
}
