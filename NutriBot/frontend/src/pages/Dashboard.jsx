import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Apple,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Droplets,
  HeartPulse,
  MessageCircle,
  Moon,
  Sparkles,
  Stethoscope,
  Target,
  Utensils,
  Waves,
} from "lucide-react";

import UserSidebar from "../components/navigation/UserSidebar";

import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const [user] = useState(() => {
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
  });

  const [appointments, setAppointments] =
    useState([]);

  const [reminders, setReminders] =
    useState([]);

  const [loadingAppointments, setLoadingAppointments] =
    useState(true);

  const [loadingReminders, setLoadingReminders] =
    useState(true);

  const hydrationCurrent = 1400;
  const hydrationGoal = 2000;

  const hydrationPercentage = Math.min(
    Math.round(
      (hydrationCurrent / hydrationGoal) * 100
    ),
    100
  );

  const firstName =
    user?.name?.split(" ")[0] || "there";

  const today = new Date();

  const formattedDate =
    today.toLocaleDateString("en-NG", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token =
          localStorage.getItem("nutribot_token");

        const response = await fetch(
          "/api/appointments/my",
          {
            headers: token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {},
          }
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch appointments"
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
          "Appointment fetch error:",
          error
        );

        setAppointments([]);
      } finally {
        setLoadingAppointments(false);
      }
    };

    fetchAppointments();
  }, []);

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const token =
          localStorage.getItem("nutribot_token");

        const response = await fetch(
          "/api/reminders/my",
          {
            headers: token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {},
          }
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch reminders"
          );
        }

        const data = await response.json();

        setReminders(
          Array.isArray(data)
            ? data
            : data.reminders || []
        );
      } catch (error) {
        console.error(
          "Reminder fetch error:",
          error
        );

        setReminders([]);
      } finally {
        setLoadingReminders(false);
      }
    };

    fetchReminders();
  }, []);

  const upcomingAppointment =
    appointments.length > 0
      ? appointments[0]
      : null;

  const todayTasks =
    reminders.length > 0
      ? reminders.slice(0, 3)
      : [
          {
            id: "water",
            title: "Drink enough water",
          },
          {
            id: "nutrition",
            title: "Eat a balanced meal",
          },
          {
            id: "walk",
            title: "Take an evening walk",
          },
        ];

  const healthShortcuts = [
    {
      title: "Food",
      description:
        "Explore foods and nutrition information.",
      icon: Utensils,
      path: "/foods",
    },
    {
      title: "Nutrition",
      description:
        "Build healthier eating habits.",
      icon: Apple,
      path: "/nutrition",
    },
    {
      title: "Hydration",
      description:
        "Track your daily water intake.",
      icon: Droplets,
      path: "/hydration",
    },
    {
      title: "Wellness",
      description:
        "Keep track of your overall wellbeing.",
      icon: HeartPulse,
      path: "/wellness",
    },
  ];

  const quickActions = [
    {
      title: "Ask Nia",
      icon: MessageCircle,
      path: "/chat",
    },
    {
      title: "Book Appointment",
      icon: CalendarDays,
      path: "/appointments",
    },
    {
      title: "Nutrition",
      icon: Apple,
      path: "/nutrition",
    },
  ];

  return (
    <div className="dashboard-page">
      <UserSidebar />

      <main className="dashboard-main">
        <div className="dashboard-container">
          {/* =====================================
              HEADER
          ====================================== */}

          <header className="dashboard-header">
            <div className="dashboard-header-content">
              <div className="dashboard-welcome-badge">
                <Sparkles size={13} />
                <span>Your health, your journey</span>
              </div>

              <h1 className="dashboard-greeting">
                Good morning,{" "}
                <span>{firstName}</span>
              </h1>

              <p className="dashboard-subtitle">
                Here's your health overview for
                today. Let's keep you feeling your
                best.
              </p>
            </div>

            <div className="dashboard-date">
              <CalendarDays size={15} />
              <span>{formattedDate}</span>
            </div>
          </header>

          {/* =====================================
              HEALTH SUMMARY
          ====================================== */}

          <section className="health-summary-grid">
            {/* HYDRATION */}

            <article className="health-card">
              <div className="health-card-header">
                <div className="health-card-title">
                  <div className="health-card-icon">
                    <Droplets size={17} />
                  </div>

                  <span>Hydration</span>
                </div>

                <Target size={17} />
              </div>

              <p className="health-card-value">
                {hydrationCurrent / 1000}
                <span
                  style={{
                    fontSize: "0.5em",
                    color:
                      "var(--nb-text-secondary)",
                    marginLeft: "4px",
                  }}
                >
                  / {hydrationGoal / 1000} L
                </span>
              </p>

              <p className="health-card-meta">
                {hydrationPercentage}% of your
                daily goal
              </p>

              <div className="health-progress">
                <div
                  className="health-progress-bar"
                  style={{
                    width: `${hydrationPercentage}%`,
                  }}
                />
              </div>
            </article>

            {/* SLEEP */}

            <article className="health-card">
              <div className="health-card-header">
                <div className="health-card-title">
                  <div className="health-card-icon">
                    <Moon size={17} />
                  </div>

                  <span>Sleep</span>
                </div>

                <CheckCircle2 size={17} />
              </div>

              <p className="health-card-value">
                7h 20m
              </p>

              <p className="health-card-meta">
                Good rest last night
              </p>

              <div className="health-progress">
                <div
                  className="health-progress-bar"
                  style={{
                    width: "82%",
                  }}
                />
              </div>
            </article>

            {/* WELLNESS */}

            <article className="health-card">
              <div className="health-card-header">
                <div className="health-card-title">
                  <div className="health-card-icon">
                    <HeartPulse size={17} />
                  </div>

                  <span>Wellness</span>
                </div>

                <Waves size={17} />
              </div>

              <p className="health-card-value">
                Good
              </p>

              <p className="health-card-meta">
                Keep maintaining your routine
              </p>

              <div className="health-progress">
                <div
                  className="health-progress-bar"
                  style={{
                    width: "78%",
                  }}
                />
              </div>
            </article>
          </section>

          {/* =====================================
              NIA + QUICK ACTIONS
          ====================================== */}

          <section className="dashboard-middle-grid">
            {/* ASK NIA */}

            <article className="ask-nia-card">
              <div className="ask-nia-content">
                <div className="ask-nia-label">
                  <Sparkles size={14} />
                  <span>Nia • NutriBot</span>
                </div>

                <h2 className="ask-nia-title">
                  How can I help you
                  <br />
                  feel better today?
                </h2>

                <p className="ask-nia-description">
                  Ask Nia about nutrition, food,
                  hydration, wellness, healthy
                  habits, or anything related to
                  your wellbeing.
                </p>

                <button
                  type="button"
                  className="ask-nia-button"
                  onClick={() =>
                    navigate("/chat")
                  }
                >
                  <MessageCircle size={16} />

                  <span>
                    Ask Nia a question
                  </span>

                  <ArrowRight size={15} />
                </button>
              </div>
            </article>

            {/* QUICK ACTIONS */}

            <article className="quick-actions-card">
              <h2 className="section-heading">
                Quick actions
              </h2>

              <div className="quick-actions">
                {quickActions.map((action) => {
                  const Icon = action.icon;

                  return (
                    <button
                      key={action.title}
                      type="button"
                      className="quick-action"
                      onClick={() =>
                        navigate(action.path)
                      }
                    >
                      <span className="quick-action-icon">
                        <Icon size={16} />
                      </span>

                      <span className="quick-action-text">
                        {action.title}
                      </span>

                      <ChevronRight
                        size={15}
                        style={{
                          marginLeft: "auto",
                        }}
                      />
                    </button>
                  );
                })}
              </div>
            </article>
          </section>

          {/* =====================================
              APPOINTMENT + TASKS
          ====================================== */}

          <section className="dashboard-lower-grid">
            {/* APPOINTMENT */}

            <article className="appointment-card">
              <h2 className="section-heading">
                Upcoming appointment
              </h2>

              {loadingAppointments ? (
                <div className="dashboard-empty">
                  Loading your appointments...
                </div>
              ) : upcomingAppointment ? (
                <div className="appointment-content">
                  <div className="appointment-icon">
                    <Stethoscope size={21} />
                  </div>

                  <div className="appointment-details">
                    <h3 className="appointment-hospital">
                      {upcomingAppointment.hospital_name ||
                        upcomingAppointment.hospital ||
                        "Hospital appointment"}
                    </h3>

                    <p className="appointment-service">
                      {upcomingAppointment.service_name ||
                        upcomingAppointment.service ||
                        upcomingAppointment.doctor_name ||
                        "Scheduled consultation"}
                    </p>

                    <p className="appointment-time">
                      {upcomingAppointment.date ||
                        upcomingAppointment.appointment_date ||
                        "Upcoming"}{" "}
                      •{" "}
                      {upcomingAppointment.time ||
                        upcomingAppointment.appointment_time ||
                        "Time to be confirmed"}
                    </p>
                  </div>

                  <ChevronRight
                    size={18}
                    style={{
                      marginLeft: "auto",
                      color:
                        "var(--nb-text-muted)",
                    }}
                  />
                </div>
              ) : (
                <div className="appointment-content">
                  <div className="appointment-icon">
                    <CalendarDays size={21} />
                  </div>

                  <div className="appointment-details">
                    <h3 className="appointment-hospital">
                      No upcoming appointment
                    </h3>

                    <p className="appointment-service">
                      Book a consultation when
                      you need one.
                    </p>

                    <button
                      type="button"
                      className="nb-gold-button"
                      style={{
                        marginTop: "12px",
                      }}
                      onClick={() =>
                        navigate(
                          "/appointments"
                        )
                      }
                    >
                      Find an appointment
                    </button>
                  </div>
                </div>
              )}
            </article>

            {/* TASKS */}

            <article className="tasks-card">
              <h2 className="section-heading">
                Today's tasks
              </h2>

              {loadingReminders ? (
                <div className="dashboard-empty">
                  Loading your tasks...
                </div>
              ) : (
                <div className="task-list">
                  {todayTasks.map(
                    (task, index) => (
                      <div
                        className="task-item"
                        key={
                          task.id ||
                          task._id ||
                          index
                        }
                      >
                        <span className="task-checkbox" />

                        <span>
                          {task.title ||
                            task.name ||
                            task.reminder ||
                            "Health reminder"}
                        </span>
                      </div>
                    )
                  )}
                </div>
              )}
            </article>
          </section>

          {/* =====================================
              HEALTH & WELLNESS
          ====================================== */}

          <section className="dashboard-health-section">
            <h2 className="section-heading">
              Health & wellness
            </h2>

            <div className="health-shortcuts-grid">
              {healthShortcuts.map(
                (shortcut) => {
                  const Icon = shortcut.icon;

                  return (
                    <button
                      type="button"
                      key={shortcut.title}
                      className="health-shortcut"
                      onClick={() =>
                        navigate(
                          shortcut.path
                        )
                      }
                    >
                      <div className="health-shortcut-icon">
                        <Icon size={19} />
                      </div>

                      <h3 className="health-shortcut-title">
                        {shortcut.title}
                      </h3>

                      <p className="health-shortcut-description">
                        {shortcut.description}
                      </p>

                      <ChevronRight
                        size={15}
                        style={{
                          position: "absolute",
                          right: "16px",
                          top: "20px",
                          color:
                            "var(--nb-text-muted)",
                        }}
                      />
                    </button>
                  );
                }
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;