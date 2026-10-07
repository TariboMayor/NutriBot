const API_URL = "/api";


/* =========================================================
   GET AUTHENTICATION TOKEN
========================================================= */

function getToken() {
  return localStorage.getItem(
    "nutribot_token"
  );
}


/* =========================================================
   GENERIC API REQUEST
========================================================= */

async function request(
  endpoint,
  options = {}
) {
  const token =
    getToken();


  const controller =
    new AbortController();


  /*
   * Stop waiting after 15 seconds.
   */
  const timeoutId =
    setTimeout(() => {
      controller.abort();
    }, 15000);


  try {
    console.log(
      "NUTRIBOT API REQUEST:",
      options.method || "GET",
      `${API_URL}${endpoint}`
    );


    const response =
      await fetch(
        `${API_URL}${endpoint}`,
        {
          ...options,

          signal:
            controller.signal,

          headers: {
            Accept:
              "application/json",

            "Content-Type":
              "application/json",

            ...(token
              ? {
                  Authorization:
                    `Bearer ${token}`,
                }
              : {}),

            ...(options.headers || {}),
          },
        }
      );


    const data =
      await response
        .json()
        .catch(
          () => ({})
        );


    console.log(
      "NUTRIBOT API RESPONSE:",
      response.status,
      data
    );


    /*
     * Backend returned an HTTP error.
     */
    if (!response.ok) {
      throw new Error(
        data.message ||
          data.error ||
          `Request failed with status ${response.status}.`
      );
    }


    return data;

  } catch (error) {

    console.error(
      "NUTRIBOT API REQUEST FAILED:",
      error
    );


    /*
     * Request timed out.
     */
    if (
      error?.name ===
      "AbortError"
    ) {
      throw new Error(
        "The NutriBot server did not respond within 15 seconds.",
        {
          cause: error,
        }
      );
    }


    /*
     * Browser could not connect to the server.
     */
    if (
      error instanceof TypeError &&
      error.message ===
        "Failed to fetch"
    ) {
      throw new Error(
        "Unable to connect to the NutriBot server. Please make sure the backend is running.",
        {
          cause: error,
        }
      );
    }


    /*
     * Preserve the original backend/HTTP error.
     */
    throw error;

  } finally {

    clearTimeout(
      timeoutId
    );

  }
}


/* =========================================================
   GET HOSPITAL APPOINTMENTS
========================================================= */

export async function getHospitalAppointments() {
  return request(
    "/appointments/hospital"
  );
}


/* =========================================================
   REPLY TO APPOINTMENT
========================================================= */

export async function replyToAppointment(
  appointmentId,
  payload
) {
  if (!appointmentId) {
    throw new Error(
      "Appointment ID is required."
    );
  }


  if (
    !payload ||
    !payload.message ||
    !payload.message.trim()
  ) {
    throw new Error(
      "Reply message is required."
    );
  }


  return request(
    `/appointments/${appointmentId}/reply`,
    {
      method: "POST",

      body: JSON.stringify({
        subject:
          payload.subject?.trim() ||
          null,

        message:
          payload.message.trim(),
      }),
    }
  );
}
