import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowRight,
  Apple,
  Bell,
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


  /* =========================================================
     USER
  ========================================================= */

  let user = null;

  try {
    const storedUser =
      localStorage.getItem("nutribot_user");

    if (storedUser) {
      user = JSON.parse(storedUser);
    }
  } catch (error) {
    console.error(
      "Unable to load user:",
      error
    );
  }


  /* =========================================================
     APPOINTMENTS
  ========================================================= */

  const [appointments, setAppointments] = useState([]);

  const [loadingAppointments, setLoadingAppointments] =
    useState(true);


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
          setLoadingAppointments(false);
        }
      }
    };

    loadAppointments();

    return () => {
      cancelled = true;
    };
  }, []);


  /* =========================================================
     REMINDERS
  ========================================================= */

  const [reminders, setReminders] = useState([]);

  const [loadingReminders, setLoadingReminders] =
    useState(true);


  useEffect(() => {
    let cancelled = false;

    const loadReminders = async () => {
      try {
        const token =
          localStorage.getItem("nutribot_token");

        const response = await fetch(
          "/api/reminders/my",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            "Unable to load reminders"
          );
        }

        const data = await response.json();

        if (!cancelled) {
          setReminders(
            Array.isArray(data)
              ? data
              : data.reminders || []
          );
        }
      } catch (error) {
        console.error(
          "Reminders error:",
          error
        );

        if (!cancelled) {
          setReminders([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingReminders(false);
        }
      }
    };

    loadReminders();

    return () => {
      cancelled = true;
    };
  }, []);


  /* =========================================================
     DASHBOARD INFORMATION
  ========================================================= */

  const hydrationCurrent = 1400;
  const hydrationGoal = 2000;

  const hydrationPercentage =
    Math.min(
      Math.round(
        (hydrationCurrent / hydrationGoal) * 100
      ),
      100
    );


  const displayName =
    user?.name ||
    user?.full_name ||
    "there";


  const today = new Date();

  const formattedDate =
    today.toLocaleDateString(
      "en-US",
      {
        weekday: "long",
        month: "long",
        day: "numeric",
      }
    );


  /* =========================================================
     UPCOMING APPOINTMENT
  ========================================================= */

  const upcomingAppointment =
    appointments.length > 0
      ? appointments[0]
      : null;


  /* =========================================================
     QUICK ACTIONS
  ========================================================= */

  const quickActions = [
    {
      title: "Ask Nia",
      description:
        "Get nutrition and wellness guidance",
      icon: MessageCircle,
      path: "/chat",
    },
    {
      title: "Find a Doctor",
      description:
        "Explore doctors and available services",
      icon: Stethoscope,
      path: "/appointments",
    },
    {
      title: "Track Nutrition",
      description:
        "Monitor your daily food choices",
      icon: Apple,
      path: "/nutrition",
    },
  ];


  /* =========================================================
     HEALTH SHORTCUTS
  ========================================================= */

  const healthShortcuts = [
    {
      title: "Nutrition",
      description:
        "Food and nutrition tracking",
      icon: Apple,
      path: "/nutrition",
    },
    {
      title: "Wellness",
      description:
        "Your daily wellness activities",
      icon: HeartPulse,
      path: "/wellness",
    },
    {
      title: "Hydration",
      description:
        "Keep track of your water intake",
      icon: Droplets,
      path: "/hydration",
    },
    {
      title: "Reminders",
      description:
        "Stay on top of your health tasks",
      icon: Bell,
      path: "/reminders",
    },
  ];


  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="dashboard-page">

      {/* SIDEBAR */}
      <UserSidebar />


      {/* MAIN CONTENT */}
      <main className="dashboard-main">

        <div className="dashboard-container">

          {/* HEADER */}
          <header className="dashboard-header">

            <div>

              <p className="dashboard-date">
                {formattedDate}
              </p>

              <h1>
                Good day, {displayName}
              </h1>

              <p className="dashboard-subtitle">
                Here's an overview of your health today.
              </p>

            </div>

          </header>


          {/* HEALTH SUMMARY */}
          <section className="health-summary">

            <div className="summary-card">

              <div className="summary-icon nutrition-icon">
                <Apple size={21} />
              </div>

              <div className="summary-content">

                <span className="summary-label">
                  Nutrition
                </span>

                <strong>
                  Balanced
                </strong>

                <small>
                  Keep making healthy choices
                </small>

              </div>

            </div>


            <div className="summary-card">

              <div className="summary-icon hydration-icon">
                <Droplets size={21} />
              </div>

              <div className="summary-content">

                <span className="summary-label">
                  Hydration
                </span>

                <strong>
                  {hydrationCurrent} ml
                </strong>

                <small>
                  {hydrationPercentage}% of daily goal
                </small>

              </div>

            </div>


            <div className="summary-card">

              <div className="summary-icon wellness-icon">
                <HeartPulse size={21} />
              </div>

              <div className="summary-content">

                <span className="summary-label">
                  Wellness
                </span>

                <strong>
                  On track
                </strong>

                <small>
                  Keep up your healthy routine
                </small>

              </div>

            </div>


            <div className="summary-card">

              <div className="summary-icon sleep-icon">
                <Moon size={21} />
              </div>

              <div className="summary-content">

                <span className="summary-label">
                  Sleep
                </span>

                <strong>
                  Good
                </strong>

                <small>
                  Maintain a regular sleep schedule
                </small>

              </div>

            </div>

          </section>


          {/* MAIN GRID */}
          <section className="dashboard-grid">

            {/* LEFT COLUMN */}
            <div className="dashboard-column">


              {/* ASK NIA */}
              <div className="nia-card">

                <div className="nia-card-icon">
                  <Sparkles size={23} />
                </div>

                <div className="nia-card-content">

                  <span>
                    YOUR HEALTH ASSISTANT
                  </span>

                  <h2>
                    Need help with your health?
                  </h2>

                  <p>
                    Ask Nia about nutrition,
                    wellness, hydration,
                    or your health goals.
                  </p>

                  <button
                    type="button"
                    onClick={() => navigate("/chat")}
                  >
                    Ask Nia
                    <ArrowRight size={17} />
                  </button>

                </div>

              </div>


              {/* QUICK ACTIONS */}
              <div className="dashboard-section">

                <div className="section-heading">

                  <div>

                    <h2>
                      Quick Actions
                    </h2>

                    <p>
                      Common things you can do
                    </p>

                  </div>

                </div>


                <div className="quick-actions">

                  {quickActions.map((action) => {

                    const Icon = action.icon;

                    return (
                      <button
                        key={action.title}
                        type="button"
                        className="quick-action-card"
                        onClick={() =>
                          navigate(action.path)
                        }
                      >

                        <div className="quick-action-icon">
                          <Icon size={21} />
                        </div>

                        <div>

                          <h3>
                            {action.title}
                          </h3>

                          <p>
                            {action.description}
                          </p>

                        </div>

                        <ChevronRight
                          size={18}
                          className="quick-action-arrow"
                        />

                      </button>
                    );

                  })}

                </div>

              </div>


              {/* HEALTH SHORTCUTS */}
              <div className="dashboard-section">

                <div className="section-heading">

                  <div>

                    <h2>
                      Health
                    </h2>

                    <p>
                      Manage your daily health
                    </p>

                  </div>

                </div>


                <div className="health-shortcuts">

                  {healthShortcuts.map(
                    (shortcut) => {

                      const Icon = shortcut.icon;

                      return (
                        <button
                          key={shortcut.title}
                          type="button"
                          className="health-shortcut"
                          onClick={() =>
                            navigate(
                              shortcut.path
                            )
                          }
                        >

                          <div className="shortcut-icon">
                            <Icon size={20} />
                          </div>

                          <div>

                            <h3>
                              {shortcut.title}
                            </h3>

                            <p>
                              {shortcut.description}
                            </p>

                          </div>

                          <ChevronRight size={17} />

                        </button>
                      );

                    }
                  )}

                </div>

              </div>

            </div>


            {/* RIGHT COLUMN */}
            <div className="dashboard-column">


              {/* HYDRATION */}
              <div className="dashboard-card">

                <div className="card-header">

                  <div>

                    <span className="card-eyebrow">
                      HYDRATION
                    </span>

                    <h2>
                      Water intake
                    </h2>

                  </div>

                  <div className="card-icon">
                    <Waves size={20} />
                  </div>

                </div>


                <div className="hydration-value">

                  <strong>
                    {hydrationCurrent}
                  </strong>

                  <span>
                    / {hydrationGoal} ml
                  </span>

                </div>


                <div className="hydration-progress">

                  <div
                    className="hydration-progress-bar"
                    style={{
                      width: `${hydrationPercentage}%`,
                    }}
                  />

                </div>


                <div className="hydration-footer">

                  <span>
                    {hydrationPercentage}% complete
                  </span>

                  <span>
                    {hydrationGoal -
                      hydrationCurrent} ml left
                  </span>

                </div>

              </div>


              {/* APPOINTMENT */}
              <div className="dashboard-card">

                <div className="card-header">

                  <div>

                    <span className="card-eyebrow">
                      APPOINTMENT
                    </span>

                    <h2>
                      Upcoming
                    </h2>

                  </div>

                  <div className="card-icon">
                    <CalendarDays size={20} />
                  </div>

                </div>


                {loadingAppointments ? (

                  <div className="empty-dashboard-state">
                    Loading appointment...
                  </div>

                ) : upcomingAppointment ? (

                  <div className="appointment-content">

                    <div className="appointment-status">
                      <CheckCircle2 size={17} />
                      Upcoming appointment
                    </div>

                    <h3>
                      {upcomingAppointment.doctor_name ||
                        upcomingAppointment.doctor ||
                        "Doctor appointment"}
                    </h3>

                    <p>
                      {upcomingAppointment.date ||
                        upcomingAppointment.appointment_date ||
                        "Date not available"}
                    </p>

                    <button
                      type="button"
                      className="card-link"
                      onClick={() =>
                        navigate("/appointments")
                      }
                    >
                      View appointments
                      <ArrowRight size={16} />
                    </button>

                  </div>

                ) : (

                  <div className="empty-dashboard-state">

                    <CalendarDays size={30} />

                    <p>
                      You have no upcoming appointments.
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        navigate("/appointments")
                      }
                    >
                      Find a doctor
                    </button>

                  </div>

                )}

              </div>


              {/* TODAY'S TASKS */}
              <div className="dashboard-card">

                <div className="card-header">

                  <div>

                    <span className="card-eyebrow">
                      TODAY
                    </span>

                    <h2>
                      Your tasks
                    </h2>

                  </div>

                  <div className="card-icon">
                    <Target size={20} />
                  </div>

                </div>


                {loadingReminders ? (

                  <div className="empty-dashboard-state">
                    Loading tasks...
                  </div>

                ) : reminders.length > 0 ? (

                  <div className="task-list">

                    {reminders
                      .slice(0, 4)
                      .map(
                        (reminder, index) => (

                          <div
                            className="task-item"
                            key={
                              reminder.id ||
                              index
                            }
                          >

                            <div className="task-icon">
                              <CheckCircle2 size={17} />
                            </div>

                            <div>

                              <strong>
                                {reminder.title ||
                                  reminder.name ||
                                  "Health reminder"}
                              </strong>

                              <span>
                                {reminder.time ||
                                  "Today"}
                              </span>

                            </div>

                          </div>

                        )
                      )}

                  </div>

                ) : (

                  <div className="empty-dashboard-state">

                    <Utensils size={28} />

                    <p>
                      No reminders for today.
                    </p>

                  </div>

                )}

              </div>

            </div>

          </section>

        </div>

      </main>

    </div>
  );
}


export default Dashboard;