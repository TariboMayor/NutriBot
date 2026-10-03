import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  CalendarDays,
  Clock3,
  MapPin,
  Stethoscope,
  RefreshCw,
  ArrowRight,
  CalendarCheck,
} from "lucide-react";

import UserSidebar from "../components/navigation/UserSidebar";

import "./AppointmentsPage.css";

function AppointmentsPage() {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /*
   * INITIAL LOAD
   */
  useEffect(() => {
    let cancelled = false;

    const loadAppointments = async () => {
      try {
        const token =
          localStorage.getItem("nutribot_token");

        const response = await fetch(
          "/api/appointments/my",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            "Unable to load appointments"
          );
        }

        const data = await response.json();

        if (!cancelled) {
          setAppointments(
            Array.isArray(data)
              ? data
              : data.appointments || []
          );
        }
      } catch (error) {
        console.error(
          "Appointments error:",
          error
        );

        if (!cancelled) {
          setAppointments([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadAppointments();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * REFRESH BUTTON
   */
  const handleRefresh = async () => {
    try {
      setRefreshing(true);

      const token =
        localStorage.getItem("nutribot_token");

      const response = await fetch(
        "/api/appointments/my",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Unable to refresh appointments"
        );
      }

      const data = await response.json();

      setAppointments(
        Array.isArray(data)
          ? data
          : data.appointments || []
      );
    } catch (error) {
      console.error(
        "Appointment refresh error:",
        error
      );
    } finally {
      setRefreshing(false);
    }
  };

  /*
   * FORMAT DATE
   */
  const formatDate = (value) => {
    if (!value) {
      return "Date not available";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString(
      "en-NG",
      {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  /*
   * HOSPITAL NAME
   */
  const getHospitalName = (appointment) => {
    return (
      appointment.hospital_name ||
      appointment.hospital ||
      appointment.hospitalName ||
      "Hospital / Clinic"
    );
  };

  /*
   * DOCTOR NAME
   */
  const getDoctorName = (appointment) => {
    return (
      appointment.doctor_name ||
      appointment.doctor ||
      appointment.doctorName ||
      "Doctor"
    );
  };

  /*
   * SERVICE NAME
   */
  const getServiceName = (appointment) => {
    return (
      appointment.service_name ||
      appointment.service ||
      appointment.serviceName ||
      "Medical consultation"
    );
  };

  /*
   * APPOINTMENT DATE
   */
  const getDate = (appointment) => {
    return (
      appointment.appointment_date ||
      appointment.date ||
      appointment.appointmentDate
    );
  };

  /*
   * APPOINTMENT TIME
   */
  const getTime = (appointment) => {
    return (
      appointment.appointment_time ||
      appointment.time ||
      appointment.appointmentTime ||
      "Time not available"
    );
  };

  /*
   * STATUS
   */
  const getStatus = (appointment) => {
    return appointment.status || "pending";
  };

  return (
    <div className="appointments-page">

      {/* SIDEBAR */}
      <UserSidebar />

      {/* MAIN CONTENT */}
      <main className="appointments-main">

        {/* HEADER */}
        <section className="appointments-header">

          <div>

            <div className="appointments-eyebrow">
              <CalendarCheck size={16} />
              Healthcare
            </div>

            <h1>
              My Appointments
            </h1>

            <p>
              Manage your upcoming and previous
              healthcare appointments.
            </p>

          </div>

          <button
            type="button"
            className="appointments-refresh"
            onClick={handleRefresh}
            disabled={loading || refreshing}
          >
            <RefreshCw
              size={17}
              className={
                refreshing
                  ? "refresh-spinning"
                  : ""
              }
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>

        </section>


        {/* FIND HOSPITAL */}
        <section className="appointments-action-card">

          <div className="appointments-action-icon">
            <CalendarDays size={24} />
          </div>

          <div className="appointments-action-content">

            <h2>
              Find a Hospital
            </h2>

            <p>
              Find a hospital or clinic near you
              and continue with your appointment
              booking.
            </p>

          </div>

          <button
            type="button"
            className="appointments-action-button"
            onClick={() =>
              navigate("/hospitals")
            }
          >
            Find a Hospital

            <ArrowRight size={17} />
          </button>

        </section>


        {/* APPOINTMENTS */}
        <section className="appointments-section">

          <div className="appointments-section-header">

            <div>

              <h2>
                Your Appointments
              </h2>

              <p>
                {appointments.length === 0
                  ? "You do not have any appointments yet."
                  : `${appointments.length} appointment${
                      appointments.length === 1
                        ? ""
                        : "s"
                    }`}
              </p>

            </div>

          </div>


          {/* LOADING */}
          {loading ? (

            <div className="appointments-state">

              <div className="appointments-loader" />

              <p>
                Loading your appointments...
              </p>

            </div>

          ) : appointments.length === 0 ? (

            /* EMPTY */
            <div className="appointments-empty">

              <div className="appointments-empty-icon">
                <CalendarDays size={30} />
              </div>

              <h3>
                No appointments yet
              </h3>

              <p>
                Your booked healthcare appointments
                will appear here.
              </p>

            </div>

          ) : (

            /* APPOINTMENT LIST */
            <div className="appointments-list">

              {appointments.map(
                (appointment, index) => {

                  const status =
                    getStatus(appointment);

                  const appointmentDate =
                    getDate(appointment);

                  return (
                    <article
                      className="appointment-card"
                      key={
                        appointment.id ||
                        appointment.appointment_id ||
                        index
                      }
                    >

                      {/* DATE */}
                      <div className="appointment-date-box">

                        <CalendarDays size={20} />

                        <strong>
                          {appointmentDate
                            ? new Date(
                                appointmentDate
                              ).getDate()
                            : "--"}
                        </strong>

                        <span>
                          {appointmentDate
                            ? new Date(
                                appointmentDate
                              ).toLocaleDateString(
                                "en-NG",
                                {
                                  month: "short",
                                }
                              )
                            : ""}
                        </span>

                      </div>


                      {/* DETAILS */}
                      <div className="appointment-details">

                        <div className="appointment-title-row">

                          <h3>
                            {getServiceName(
                              appointment
                            )}
                          </h3>

                          <span
                            className={`appointment-status ${status.toLowerCase()}`}
                          >
                            {status}
                          </span>

                        </div>


                        <div className="appointment-info">

                          <div>
                            <Stethoscope size={16} />

                            <span>
                              {getDoctorName(
                                appointment
                              )}
                            </span>
                          </div>


                          <div>
                            <MapPin size={16} />

                            <span>
                              {getHospitalName(
                                appointment
                              )}
                            </span>
                          </div>


                          <div>
                            <Clock3 size={16} />

                            <span>
                              {getTime(
                                appointment
                              )}
                            </span>
                          </div>

                        </div>


                        <div className="appointment-date-text">
                          {formatDate(
                            appointmentDate
                          )}
                        </div>

                      </div>

                    </article>
                  );
                }
              )}

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default AppointmentsPage;