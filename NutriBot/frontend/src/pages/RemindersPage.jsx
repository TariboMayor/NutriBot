import { useEffect, useState } from "react";

import {
  Bell,
  CheckCircle2,
  Clock3,
  RefreshCw,
  CalendarDays,
  Pill,
  Droplets,
  Apple,
  HeartPulse,
} from "lucide-react";

import UserSidebar from "../components/navigation/UserSidebar";

import "./RemindersPage.css";

function RemindersPage() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);


  /*
   * INITIAL LOAD
   */
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
          setLoading(false);
        }
      }
    };

    loadReminders();

    return () => {
      cancelled = true;
    };
  }, []);


  /*
   * REFRESH
   */
  const handleRefresh = async () => {
    try {
      setRefreshing(true);

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
          "Unable to refresh reminders"
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
        "Reminder refresh error:",
        error
      );
    } finally {
      setRefreshing(false);
    }
  };


  const getReminderTitle = (reminder) => {
    return (
      reminder.title ||
      reminder.name ||
      reminder.reminder_title ||
      "Health Reminder"
    );
  };


  const getReminderDescription = (
    reminder
  ) => {
    return (
      reminder.description ||
      reminder.message ||
      reminder.notes ||
      "Remember to take care of your health today."
    );
  };


  const getReminderTime = (reminder) => {
    return (
      reminder.time ||
      reminder.reminder_time ||
      reminder.reminderTime ||
      "Time not set"
    );
  };


  const getReminderDate = (reminder) => {
    return (
      reminder.date ||
      reminder.reminder_date ||
      reminder.reminderDate
    );
  };


  const getReminderType = (reminder) => {
    return (
      reminder.type ||
      reminder.category ||
      "health"
    ).toLowerCase();
  };


  const getIcon = (reminder) => {
    const type = getReminderType(
      reminder
    );

    if (
      type.includes("water") ||
      type.includes("hydration")
    ) {
      return Droplets;
    }

    if (
      type.includes("food") ||
      type.includes("nutrition") ||
      type.includes("meal")
    ) {
      return Apple;
    }

    if (
      type.includes("medicine") ||
      type.includes("medication") ||
      type.includes("pill")
    ) {
      return Pill;
    }

    if (
      type.includes("wellness") ||
      type.includes("exercise")
    ) {
      return HeartPulse;
    }

    if (
      type.includes("appointment") ||
      type.includes("doctor")
    ) {
      return CalendarDays;
    }

    return Bell;
  };


  const formatDate = (value) => {
    if (!value) return null;

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


  return (
    <div className="reminders-page">

      <UserSidebar />

      <main className="reminders-main">

        <section className="reminders-header">

          <div>

            <div className="reminders-eyebrow">
              <Bell size={16} />
              Health Management
            </div>

            <h1>
              My Reminders
            </h1>

            <p>
              Keep track of important health tasks,
              appointments, nutrition and wellness
              activities.
            </p>

          </div>


          <button
            type="button"
            className="reminders-refresh"
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


        <section className="reminders-summary">

          <div className="reminders-summary-icon">
            <Bell size={22} />
          </div>

          <div>
            <strong>
              {reminders.length}
            </strong>

            <span>
              Active reminders
            </span>
          </div>

        </section>


        <section className="reminders-section">

          <div className="reminders-section-header">

            <div>
              <h2>
                Your Reminders
              </h2>

              <p>
                Stay consistent with your
                health goals.
              </p>
            </div>

          </div>


          {loading ? (
            <div className="reminders-state">

              <div className="reminders-loader" />

              <p>
                Loading your reminders...
              </p>

            </div>
          ) : reminders.length === 0 ? (
            <div className="reminders-empty">

              <div className="reminders-empty-icon">
                <CheckCircle2 size={30} />
              </div>

              <h3>
                No reminders yet
              </h3>

              <p>
                Your health reminders will appear
                here when they are available.
              </p>

            </div>
          ) : (
            <div className="reminders-list">

              {reminders.map(
                (reminder, index) => {

                  const Icon =
                    getIcon(reminder);

                  const formattedDate =
                    formatDate(
                      getReminderDate(
                        reminder
                      )
                    );

                  return (
                    <article
                      className="reminder-card"
                      key={
                        reminder.id ||
                        reminder.reminder_id ||
                        index
                      }
                    >

                      <div className="reminder-icon">
                        <Icon size={21} />
                      </div>


                      <div className="reminder-content">

                        <div className="reminder-title-row">

                          <h3>
                            {getReminderTitle(
                              reminder
                            )}
                          </h3>

                          <span className="reminder-badge">
                            {getReminderType(
                              reminder
                            )}
                          </span>

                        </div>

                        <p>
                          {getReminderDescription(
                            reminder
                          )}
                        </p>


                        <div className="reminder-meta">

                          {formattedDate && (
                            <span>
                              <CalendarDays
                                size={15}
                              />

                              {formattedDate}
                            </span>
                          )}

                          <span>
                            <Clock3 size={15} />

                            {getReminderTime(
                              reminder
                            )}
                          </span>

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

export default RemindersPage;