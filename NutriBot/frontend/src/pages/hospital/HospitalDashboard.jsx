import { useEffect, useMemo, useState } from "react";

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Hospital,
  Loader2,
  Users,
  XCircle,
  Stethoscope,
  RefreshCw,
} from "lucide-react";

import {
  getHospitalAppointments,
} from "../../services/hospitalAppointmentService";

import "./HospitalDashboard.css";


function HospitalDashboard() {
  const [hospital, setHospital] =
    useState(null);

  const [appointments, setAppointments] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  // ======================================================
  // LOAD HOSPITAL APPOINTMENTS
  // ======================================================

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await getHospitalAppointments();

      setHospital(
        data?.hospital || null
      );

      setAppointments(
        Array.isArray(data?.appointments)
          ? data.appointments
          : []
      );
    } catch (requestError) {
      console.error(
        "Hospital dashboard error:",
        requestError
      );

      setError(
        requestError.message ||
          "Unable to load hospital information."
      );
    } finally {
      setLoading(false);
    }
  };


  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      loadAppointments();
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, []);


  // ======================================================
  // APPOINTMENT STATISTICS
  // ======================================================

  const statistics = useMemo(() => {
    const today =
      new Date()
        .toISOString()
        .split("T")[0];

    return {
      total: appointments.length,

      pending:
        appointments.filter(
          (appointment) =>
            appointment.status ===
            "PENDING"
        ).length,

      confirmed:
        appointments.filter(
          (appointment) =>
            appointment.status ===
            "CONFIRMED"
        ).length,

      completed:
        appointments.filter(
          (appointment) =>
            appointment.status ===
            "COMPLETED"
        ).length,

      cancelled:
        appointments.filter(
          (appointment) =>
            appointment.status ===
              "CANCELLED" ||
            appointment.status ===
              "NO_SHOW"
        ).length,

      today:
        appointments.filter(
          (appointment) =>
            appointment.appointment_date ===
            today
        ).length,
    };
  }, [appointments]);


  // ======================================================
  // DATE FORMAT
  // ======================================================

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "—";
    }

    const date =
      new Date(`${dateValue}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      return dateValue;
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


  // ======================================================
  // TIME FORMAT
  // ======================================================

  const formatTime = (timeValue) => {
    if (!timeValue) {
      return "—";
    }

    const value =
      String(timeValue)
        .substring(0, 5);

    const [hours, minutes] =
      value.split(":");

    const date =
      new Date();

    date.setHours(
      Number(hours),
      Number(minutes),
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


  // ======================================================
  // STATUS CLASS
  // ======================================================

  const getStatusClass = (status) => {
    switch (status) {
      case "CONFIRMED":
        return "confirmed";

      case "COMPLETED":
        return "completed";

      case "CANCELLED":
        return "cancelled";

      case "NO_SHOW":
        return "cancelled";

      case "RESCHEDULED":
        return "rescheduled";

      case "PENDING":
      default:
        return "pending";
    }
  };


  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="hospital-dashboard-page">

        <main className="hospital-dashboard-main">

          <div className="hospital-dashboard-loading">

            <Loader2
              size={30}
              className="hospital-dashboard-spinner"
            />

            <h2>
              Loading hospital dashboard...
            </h2>

            <p>
              Getting your hospital information
              and appointments.
            </p>

          </div>

        </main>

      </div>
    );
  }


  // ======================================================
  // ERROR
  // ======================================================

  if (error) {
    return (
      <div className="hospital-dashboard-page">

        <main className="hospital-dashboard-main">

          <div className="hospital-dashboard-error">

            <XCircle size={32} />

            <h2>
              Unable to load dashboard
            </h2>

            <p>
              {error}
            </p>

            <button
              type="button"
              onClick={loadAppointments}
              className="hospital-dashboard-retry"
            >
              <RefreshCw size={16} />
              Try Again
            </button>

          </div>

        </main>

      </div>
    );
  }


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
              Hospital Management
            </div>

            <h1>
              {hospital?.name ||
                "Hospital Dashboard"}
            </h1>

            <p>
              Manage your hospital appointments
              and monitor patient activity.
            </p>

          </div>

          <button
            type="button"
            className="hospital-dashboard-refresh"
            onClick={loadAppointments}
          >
            <RefreshCw size={16} />
            Refresh
          </button>

        </header>


        {/* =================================================
            HOSPITAL INFORMATION
        ================================================= */}

        {hospital && (
          <section className="hospital-dashboard-hospital-card">

            <div className="hospital-dashboard-hospital-icon">
              <Hospital size={25} />
            </div>

            <div className="hospital-dashboard-hospital-info">

              <h2>
                {hospital.name}
              </h2>

              <p>
                {[
                  hospital.address,
                  hospital.city,
                  hospital.state,
                ]
                  .filter(Boolean)
                  .join(", ") ||
                  "Hospital location not available"}
              </p>

              <div className="hospital-dashboard-hospital-meta">

                {hospital.phone && (
                  <span>
                    {hospital.phone}
                  </span>
                )}

                {hospital.email && (
                  <span>
                    {hospital.email}
                  </span>
                )}

                {hospital.staff_role && (
                  <span>
                    Role:{" "}
                    {hospital.staff_role}
                  </span>
                )}

              </div>

            </div>

          </section>
        )}


        {/* =================================================
            STATISTICS
        ================================================= */}

        <section className="hospital-dashboard-stats">

          <div className="hospital-stat-card">

            <div className="hospital-stat-icon total">
              <CalendarDays size={21} />
            </div>

            <div>
              <span>
                Total Appointments
              </span>

              <strong>
                {statistics.total}
              </strong>
            </div>

          </div>


          <div className="hospital-stat-card">

            <div className="hospital-stat-icon today">
              <Clock3 size={21} />
            </div>

            <div>
              <span>
                Today
              </span>

              <strong>
                {statistics.today}
              </strong>
            </div>

          </div>


          <div className="hospital-stat-card">

            <div className="hospital-stat-icon pending">
              <Clock3 size={21} />
            </div>

            <div>
              <span>
                Pending
              </span>

              <strong>
                {statistics.pending}
              </strong>
            </div>

          </div>


          <div className="hospital-stat-card">

            <div className="hospital-stat-icon confirmed">
              <CheckCircle2 size={21} />
            </div>

            <div>
              <span>
                Confirmed
              </span>

              <strong>
                {statistics.confirmed}
              </strong>
            </div>

          </div>


          <div className="hospital-stat-card">

            <div className="hospital-stat-icon completed">
              <CheckCircle2 size={21} />
            </div>

            <div>
              <span>
                Completed
              </span>

              <strong>
                {statistics.completed}
              </strong>
            </div>

          </div>


          <div className="hospital-stat-card">

            <div className="hospital-stat-icon patients">
              <Users size={21} />
            </div>

            <div>
              <span>
                Patients
              </span>

              <strong>
                {
                  new Set(
                    appointments.map(
                      (appointment) =>
                        appointment.patient_id
                    )
                  ).size
                }
              </strong>
            </div>

          </div>

        </section>


        {/* =================================================
            APPOINTMENTS
        ================================================= */}

        <section className="hospital-dashboard-section">

          <div className="hospital-dashboard-section-header">

            <div>

              <h2>
                Appointments
              </h2>

              <p>
                Patient appointments for your
                hospital.
              </p>

            </div>

            <span className="hospital-dashboard-count">
              {appointments.length}{" "}
              {appointments.length === 1
                ? "appointment"
                : "appointments"}
            </span>

          </div>


          {appointments.length === 0 ? (
            <div className="hospital-dashboard-empty">

              <div className="hospital-dashboard-empty-icon">
                <CalendarDays size={27} />
              </div>

              <h3>
                No appointments yet
              </h3>

              <p>
                Patient appointments will
                appear here when they are booked.
              </p>

            </div>
          ) : (
            <div className="hospital-appointments-table-wrapper">

              <table className="hospital-appointments-table">

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
                  </tr>

                </thead>


                <tbody>

                  {appointments.map(
                    (appointment) => (
                      <tr
                        key={appointment.id}
                      >

                        <td>

                          <div className="hospital-patient">

                            <div className="hospital-patient-avatar">
                              {(
                                appointment.patient_name ||
                                "P"
                              )
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>

                              <strong>
                                {appointment.patient_name ||
                                  "Patient"}
                              </strong>

                              <span>
                                {appointment.patient_phone ||
                                  appointment.patient_email ||
                                  "Contact unavailable"}
                              </span>

                            </div>

                          </div>

                        </td>


                        <td>

                          <div className="hospital-doctor">

                            <Stethoscope
                              size={16}
                            />

                            <div>

                              <strong>
                                {appointment.doctor_name ||
                                  "Doctor"}
                              </strong>

                              <span>
                                {appointment.doctor_specialty ||
                                  "Medical Doctor"}
                              </span>

                            </div>

                          </div>

                        </td>


                        <td>

                          <div className="hospital-service">

                            <strong>
                              {appointment.service_name ||
                                "Medical Service"}
                            </strong>

                            {appointment.service_category && (
                              <span>
                                {appointment.service_category}
                              </span>
                            )}

                          </div>

                        </td>


                        <td>
                          {formatDate(
                            appointment.appointment_date
                          )}
                        </td>


                        <td>
                          {formatTime(
                            appointment.start_time
                          )}
                        </td>


                        <td>

                          <span
                            className={`hospital-appointment-status ${getStatusClass(
                              appointment.status
                            )}`}
                          >
                            {String(
                              appointment.status ||
                                "PENDING"
                            ).replaceAll(
                              "_",
                              " "
                            )}
                          </span>

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

    </div>
  );
}


export default HospitalDashboard;
