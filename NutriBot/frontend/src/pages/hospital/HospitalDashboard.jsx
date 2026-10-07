import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Hospital,
  Loader2,
  RefreshCw,
  Send,
  Stethoscope,
  Users,
  X,
  XCircle,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import {
  getHospitalAppointments,
  replyToAppointment,
} from "../../services/hospitalAppointmentService";

import "./HospitalDashboard.css";


function HospitalDashboard() {
  const navigate = useNavigate();


  /* =========================================================
     STATE
  ========================================================= */

  const [hospital, setHospital] =
    useState(null);

  const [appointments, setAppointments] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");


  /*
   * Reply modal state
   */

  const [replyingAppointment, setReplyingAppointment] =
    useState(null);

  const [replySubject, setReplySubject] =
    useState("");

  const [replyMessage, setReplyMessage] =
    useState("");

  const [replyLoading, setReplyLoading] =
    useState(false);

  const [replyError, setReplyError] =
    useState("");

  const [replySuccess, setReplySuccess] =
    useState("");


  /* =========================================================
     LOAD APPOINTMENTS
  ========================================================= */

  const loadAppointments = useCallback(
    async (showRefresh = false) => {
      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const data =
          await getHospitalAppointments();

        setHospital(
          data.hospital || null
        );

        setAppointments(
          Array.isArray(data.appointments)
            ? data.appointments
            : []
        );
      } catch (fetchError) {
        console.error(
          "Hospital appointments error:",
          fetchError
        );

        setError(
          fetchError.message ||
            "Unable to load hospital appointments."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );


  useEffect(() => {
    const timer = setTimeout(() => {
      loadAppointments();
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [loadAppointments]);


  /* =========================================================
     APPOINTMENT HELPERS
  ========================================================= */

  const getPatientName = (
    appointment
  ) => {
    return (
      appointment?.patient_name ||
      appointment?.patientName ||
      "Patient"
    );
  };


  const getDoctorName = (
    appointment
  ) => {
    return (
      appointment?.doctor_name ||
      appointment?.doctorName ||
      "Doctor"
    );
  };


  const getDoctorSpecialty = (
    appointment
  ) => {
    return (
      appointment?.doctor_specialty ||
      appointment?.specialty ||
      "Medical Doctor"
    );
  };


  const getServiceName = (
    appointment
  ) => {
    return (
      appointment?.service_name ||
      appointment?.serviceName ||
      appointment?.medical_service_name ||
      "Medical Service"
    );
  };


  const getAppointmentDate = (
    appointment
  ) => {
    if (!appointment?.appointment_date) {
      return "—";
    }

    const date =
      new Date(
        `${appointment.appointment_date}T00:00:00`
      );

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return appointment.appointment_date;
    }

    return date.toLocaleDateString(
      "en-NG",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };


  const getAppointmentTime = (
    appointment
  ) => {
    const time =
      appointment?.start_time ||
      appointment?.startTime ||
      appointment?.time;

    if (!time) {
      return "—";
    }

    const value =
      String(time);

    const match =
      value.match(
        /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/
      );

    if (!match) {
      return value;
    }

    const hours =
      Number(match[1]);

    const minutes =
      Number(match[2]);

    const date =
      new Date();

    date.setHours(
      hours,
      minutes,
      0,
      0
    );

    return date.toLocaleTimeString(
      "en-NG",
      {
        hour: "numeric",
        minute: "2-digit",
      }
    );
  };


  const getStatusClass = (
    status
  ) => {
    const normalizedStatus =
      String(
        status || ""
      ).toUpperCase();

    switch (
      normalizedStatus
    ) {
      case "CONFIRMED":
        return "confirmed";

      case "COMPLETED":
        return "completed";

      case "CANCELLED":
        return "cancelled";

      case "RESCHEDULED":
        return "rescheduled";

      case "PENDING":
      default:
        return "pending";
    }
  };


  const getStatusLabel = (
    status
  ) => {
    if (!status) {
      return "PENDING";
    }

    return String(
      status
    ).replace(
      /_/g,
      " "
    );
  };


  /* =========================================================
     STATISTICS
  ========================================================= */

  const stats = useMemo(() => {
    const total =
      appointments.length;


    const pending =
      appointments.filter(
        (appointment) =>
          String(
            appointment.status || ""
          ).toUpperCase() ===
          "PENDING"
      ).length;


    const confirmed =
      appointments.filter(
        (appointment) =>
          String(
            appointment.status || ""
          ).toUpperCase() ===
          "CONFIRMED"
      ).length;


    const completed =
      appointments.filter(
        (appointment) =>
          String(
            appointment.status || ""
          ).toUpperCase() ===
          "COMPLETED"
      ).length;


    const cancelled =
      appointments.filter(
        (appointment) =>
          String(
            appointment.status || ""
          ).toUpperCase() ===
          "CANCELLED"
      ).length;


    /*
     * Local date comparison.
     *
     * Do NOT use toISOString() here because
     * appointment_date is a database DATE.
     */

    const today =
      new Date();

    const todayString =
      `${today.getFullYear()}-` +
      `${String(
        today.getMonth() + 1
      ).padStart(2, "0")}-` +
      `${String(
        today.getDate()
      ).padStart(2, "0")}`;


    const todayCount =
      appointments.filter(
        (appointment) =>
          String(
            appointment.appointment_date || ""
          ).slice(0, 10) ===
          todayString
      ).length;


    const patients =
      new Set(
        appointments
          .map(
            (appointment) =>
              appointment.patient_user_id ||
              appointment.patient_id
          )
          .filter(Boolean)
      ).size;


    return {
      total,
      pending,
      confirmed,
      completed,
      cancelled,
      today: todayCount,
      patients,
    };
  }, [appointments]);


  /* =========================================================
     REPLY MODAL
  ========================================================= */

  const openReplyModal = (
    appointment
  ) => {
    setReplyingAppointment(
      appointment
    );

    setReplySubject(
      `Appointment Message - ${getServiceName(
        appointment
      )}`
    );

    setReplyMessage("");

    setReplyError("");

    setReplySuccess("");
  };


  const closeReplyModal = () => {
    if (replyLoading) {
      return;
    }

    setReplyingAppointment(
      null
    );

    setReplySubject("");

    setReplyMessage("");

    setReplyError("");

    setReplySuccess("");
  };


  /* =========================================================
     SEND REPLY
  ========================================================= */

  const handleSendReply =
    async () => {
      if (
        !replyingAppointment ||
        replyLoading
      ) {
        return;
      }


      const message =
        replyMessage.trim();


      if (!message) {
        setReplyError(
          "Please enter a message before sending."
        );

        return;
      }


      if (
        message.length > 5000
      ) {
        setReplyError(
          "Your message cannot exceed 5000 characters."
        );

        return;
      }


      try {
        /*
         * Start loading.
         */

        setReplyLoading(true);
        setReplyError("");
        setReplySuccess("");


        /*
         * SEND THE REPLY
         */

        const result =
          await replyToAppointment(
            replyingAppointment.id,
            {
              subject:
                replySubject.trim() ||
                null,

              message,
            }
          );


        /*
         * ==========================================
         * IMPORTANT:
         *
         * The request has completed.
         *
         * STOP THE BUTTON SPINNER IMMEDIATELY.
         * ==========================================
         */

        setReplyLoading(false);


        /*
         * SHOW SUCCESS IMMEDIATELY.
         */

        setReplySuccess(
          result?.message ||
            "Reply sent successfully."
        );


        /*
         * Clear any old error.
         */

        setReplyError("");


        /*
         * Refresh the dashboard in the background.
         *
         * DO NOT await this.
         *
         * The modal success message must NOT
         * depend on the dashboard refresh.
         */

        loadAppointments(true).catch(
          (refreshError) => {
            console.error(
              "Background dashboard refresh error:",
              refreshError
            );
          }
        );


        /*
         * Close the modal after the
         * success message has been visible.
         */

        setTimeout(() => {
          setReplyingAppointment(
            null
          );

          setReplySubject("");

          setReplyMessage("");

          setReplyError("");

          setReplySuccess("");
        }, 1800);


      } catch (sendError) {
        console.error(
          "Send appointment reply error:",
          sendError
        );


        /*
         * ALWAYS stop the spinner
         * when the request fails.
         */

        setReplyLoading(false);


        setReplySuccess("");


        setReplyError(
          sendError?.message ||
            "Unable to send reply."
        );
      }
    };


  /* =========================================================
     NAVIGATION
  ========================================================= */

  const handleManageServices = () => {
    navigate(
      "/hospital/services"
    );
  };


  const handleManageDoctors = () => {
    navigate(
      "/hospital/doctors"
    );
  };


  /* =========================================================
     LOADING STATE
  ========================================================= */

  if (loading) {
    return (
      <div className="hospital-dashboard-page">

        <main className="hospital-dashboard-main">

          <div className="hospital-dashboard-loading">

            <Loader2
              size={30}
              className="hospital-dashboard-spinner"
            />

            <p>
              Loading hospital dashboard...
            </p>

          </div>

        </main>

      </div>
    );
  }


  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="hospital-dashboard-page">

      <main className="hospital-dashboard-main">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="hospital-dashboard-header">

          <div>

            <div className="hospital-dashboard-eyebrow">

              <Hospital size={16} />

              Hospital Dashboard

            </div>

            <h1>
              Welcome back
            </h1>

            <p>
              Manage your hospital,
              appointments, doctors,
              and patient communication.
            </p>

          </div>


          <div className="hospital-dashboard-header-actions">

            <button
              type="button"
              className="hospital-dashboard-secondary-button"
              onClick={
                handleManageDoctors
              }
            >

              <Stethoscope size={17} />

              Manage Doctors

            </button>


            <button
              type="button"
              className="hospital-dashboard-secondary-button"
              onClick={
                handleManageServices
              }
            >

              <Hospital size={17} />

              Manage Services

            </button>


            <button
              type="button"
              className="hospital-dashboard-refresh-button"
              onClick={() =>
                loadAppointments(true)
              }
              disabled={refreshing}
            >

              <RefreshCw
                size={17}
                className={
                  refreshing
                    ? "hospital-dashboard-refreshing"
                    : ""
                }
              />

              Refresh

            </button>

          </div>

        </header>


        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="hospital-dashboard-error">

            <XCircle size={19} />

            <span>
              {error}
            </span>

          </div>
        )}


        {/* =================================================
            HOSPITAL CARD
        ================================================= */}

        {hospital && (
          <section className="hospital-dashboard-hospital-card">

            <div className="hospital-dashboard-hospital-icon">

              <Hospital size={27} />

            </div>


            <div className="hospital-dashboard-hospital-content">

              <span>
                Hospital
              </span>

              <h2>
                {hospital.name ||
                  "Hospital"}
              </h2>

              {hospital.address && (
                <p>
                  {hospital.address}
                </p>
              )}

            </div>

          </section>
        )}


        {/* =================================================
            STATISTICS
        ================================================= */}

        <section className="hospital-dashboard-stats">

          <div className="hospital-dashboard-stat-card">

            <div className="hospital-dashboard-stat-icon">

              <CalendarDays size={21} />

            </div>

            <div>

              <span>
                Total Appointments
              </span>

              <strong>
                {stats.total}
              </strong>

            </div>

          </div>


          <div className="hospital-dashboard-stat-card">

            <div className="hospital-dashboard-stat-icon pending">

              <Clock3 size={21} />

            </div>

            <div>

              <span>
                Pending
              </span>

              <strong>
                {stats.pending}
              </strong>

            </div>

          </div>


          <div className="hospital-dashboard-stat-card">

            <div className="hospital-dashboard-stat-icon confirmed">

              <CheckCircle2 size={21} />

            </div>

            <div>

              <span>
                Confirmed
              </span>

              <strong>
                {stats.confirmed}
              </strong>

            </div>

          </div>


          <div className="hospital-dashboard-stat-card">

            <div className="hospital-dashboard-stat-icon completed">

              <CheckCircle2 size={21} />

            </div>

            <div>

              <span>
                Completed
              </span>

              <strong>
                {stats.completed}
              </strong>

            </div>

          </div>


          <div className="hospital-dashboard-stat-card">

            <div className="hospital-dashboard-stat-icon cancelled">

              <XCircle size={21} />

            </div>

            <div>

              <span>
                Cancelled
              </span>

              <strong>
                {stats.cancelled}
              </strong>

            </div>

          </div>


          <div className="hospital-dashboard-stat-card">

            <div className="hospital-dashboard-stat-icon">

              <Users size={21} />

            </div>

            <div>

              <span>
                Patients
              </span>

              <strong>
                {stats.patients}
              </strong>

            </div>

          </div>

        </section>


        {/* =================================================
            TODAY
        ================================================= */}

        <section className="hospital-dashboard-today-card">

          <div className="hospital-dashboard-today-icon">

            <CalendarDays size={23} />

          </div>

          <div>

            <span>
              Today's Appointments
            </span>

            <strong>
              {stats.today}
            </strong>

          </div>

        </section>


        {/* =================================================
            APPOINTMENTS
        ================================================= */}

        <section className="hospital-dashboard-appointments">

          <div className="hospital-dashboard-section-header">

            <div>

              <h2>
                Appointments
              </h2>

              <p>
                View and respond to your
                patients' appointments.
              </p>

            </div>

            <span className="hospital-dashboard-appointment-count">

              {appointments.length}{" "}

              {appointments.length === 1
                ? "appointment"
                : "appointments"}

            </span>

          </div>


          {appointments.length === 0 ? (

            <div className="hospital-dashboard-empty">

              <div className="hospital-dashboard-empty-icon">

                <CalendarDays size={28} />

              </div>

              <h3>
                No appointments yet
              </h3>

              <p>
                Patient appointments will
                appear here when they are
                booked.
              </p>

            </div>

          ) : (

            <div className="hospital-dashboard-table-wrapper">

              <table className="hospital-dashboard-table">

                <thead>

                  <tr>

                    <th>
                      Patient
                    </th>

                    <th>
                      Doctor
                    </th>

                    <th>
                      Service
                    </th>

                    <th>
                      Date
                    </th>

                    <th>
                      Time
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Reply
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {appointments.map(
                    (appointment) => (

                      <tr
                        key={
                          appointment.id
                        }
                      >

                        {/* PATIENT */}

                        <td>

                          <div className="hospital-dashboard-patient">

                            <div className="hospital-dashboard-avatar">

                              {getPatientName(
                                appointment
                              )
                                .charAt(0)
                                .toUpperCase()}

                            </div>

                            <div>

                              <strong>
                                {getPatientName(
                                  appointment
                                )}
                              </strong>

                              {appointment.patient_email && (
                                <span>
                                  {
                                    appointment.patient_email
                                  }
                                </span>
                              )}

                            </div>

                          </div>

                        </td>


                        {/* DOCTOR */}

                        <td>

                          <div className="hospital-dashboard-doctor">

                            <strong>
                              {getDoctorName(
                                appointment
                              )}
                            </strong>

                            <span>
                              {getDoctorSpecialty(
                                appointment
                              )}
                            </span>

                          </div>

                        </td>


                        {/* SERVICE */}

                        <td>

                          <span className="hospital-dashboard-service">

                            {getServiceName(
                              appointment
                            )}

                          </span>

                        </td>


                        {/* DATE */}

                        <td>

                          {getAppointmentDate(
                            appointment
                          )}

                        </td>


                        {/* TIME */}

                        <td>

                          <div className="hospital-dashboard-time">

                            <Clock3
                              size={15}
                            />

                            {getAppointmentTime(
                              appointment
                            )}

                          </div>

                        </td>


                        {/* STATUS */}

                        <td>

                          <span
                            className={`hospital-dashboard-status ${getStatusClass(
                              appointment.status
                            )}`}
                          >

                            {getStatusLabel(
                              appointment.status
                            )}

                          </span>

                        </td>


                        {/* REPLY */}

                        <td>

                          <button
                            type="button"
                            className="hospital-dashboard-reply-button"
                            onClick={() =>
                              openReplyModal(
                                appointment
                              )
                            }
                          >

                            <Send
                              size={15}
                            />

                            Reply

                          </button>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </section>

      </main>


      {/* =====================================================
          REPLY MODAL
      ===================================================== */}

      {replyingAppointment && (

        <div
          className="hospital-dashboard-modal-overlay"
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget &&
              !replyLoading
            ) {
              closeReplyModal();
            }

          }}
        >

          <div
            className="hospital-dashboard-reply-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reply-modal-title"
          >

            {/* MODAL HEADER */}

            <div className="hospital-dashboard-modal-header">

              <div>

                <div className="hospital-dashboard-modal-eyebrow">

                  <Send size={15} />

                  Patient Communication

                </div>

                <h2 id="reply-modal-title">

                  Reply to Patient

                </h2>

              </div>


              <button
                type="button"
                className="hospital-dashboard-modal-close"
                onClick={
                  closeReplyModal
                }
                disabled={
                  replyLoading
                }
                aria-label="Close reply"
              >

                <X size={19} />

              </button>

            </div>


            {/* APPOINTMENT INFO */}

            <div className="hospital-dashboard-reply-info">

              <div>

                <span>
                  Patient
                </span>

                <strong>

                  {getPatientName(
                    replyingAppointment
                  )}

                </strong>

              </div>


              <div>

                <span>
                  Doctor
                </span>

                <strong>

                  {getDoctorName(
                    replyingAppointment
                  )}

                </strong>

              </div>


              <div>

                <span>
                  Service
                </span>

                <strong>

                  {getServiceName(
                    replyingAppointment
                  )}

                </strong>

              </div>


              <div>

                <span>
                  Appointment
                </span>

                <strong>

                  {getAppointmentDate(
                    replyingAppointment
                  )}

                  {" · "}

                  {getAppointmentTime(
                    replyingAppointment
                  )}

                </strong>

              </div>


              <div>

                <span>
                  Status
                </span>

                <strong>

                  {getStatusLabel(
                    replyingAppointment.status
                  )}

                </strong>

              </div>

            </div>


            {/* FORM */}

            <div className="hospital-dashboard-reply-form">

              <div className="hospital-dashboard-form-group">

                <label htmlFor="reply-subject">

                  Subject

                </label>

                <input
                  id="reply-subject"
                  type="text"
                  value={
                    replySubject
                  }
                  onChange={(event) =>
                    setReplySubject(
                      event.target.value
                    )
                  }
                  placeholder="Enter message subject"
                  maxLength={255}
                  disabled={
                    replyLoading ||
                    Boolean(replySuccess)
                  }
                />

              </div>


              <div className="hospital-dashboard-form-group">

                <label htmlFor="reply-message">

                  Message

                </label>

                <textarea
                  id="reply-message"
                  value={
                    replyMessage
                  }
                  onChange={(event) =>
                    setReplyMessage(
                      event.target.value
                    )
                  }
                  placeholder="Write your message to the patient..."
                  rows={7}
                  maxLength={5000}
                  disabled={
                    replyLoading ||
                    Boolean(replySuccess)
                  }
                />

                <div className="hospital-dashboard-character-count">

                  {replyMessage.length}

                  {" / 5000"}

                </div>

              </div>


              {/* ERROR */}

              {replyError && (

                <div className="hospital-dashboard-reply-error">

                  <XCircle size={17} />

                  <span>
                    {replyError}
                  </span>

                </div>

              )}


              {/* SUCCESS */}

              {replySuccess && (

                <div
                  className="hospital-dashboard-reply-success"
                  role="status"
                >

                  <CheckCircle2
                    size={17}
                  />

                  <span>
                    {replySuccess}
                  </span>

                </div>

              )}


              {/* ACTIONS */}

              <div className="hospital-dashboard-modal-actions">

                <button
                  type="button"
                  className="hospital-dashboard-modal-cancel"
                  onClick={
                    closeReplyModal
                  }
                  disabled={
                    replyLoading
                  }
                >

                  {replySuccess
                    ? "Close"
                    : "Cancel"}

                </button>


                {!replySuccess && (

                  <button
                    type="button"
                    className="hospital-dashboard-modal-send"
                    onClick={
                      handleSendReply
                    }
                    disabled={
                      replyLoading ||
                      !replyMessage.trim()
                    }
                  >

                    {replyLoading ? (

                      <>

                        <Loader2
                          size={17}
                          className="hospital-dashboard-spinner"
                        />

                        Sending...

                      </>

                    ) : (

                      <>

                        <Send
                          size={17}
                        />

                        Send Reply

                      </>

                    )}

                  </button>

                )}

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}


export default HospitalDashboard;
