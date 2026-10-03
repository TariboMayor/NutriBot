import { useCallback, useEffect, useState } from "react";
import {
  Bell,
  CheckCircle2,
  Clock3,
  Droplets,
  HeartPulse,
  Pill,
  Plus,
  X,
} from "lucide-react";

import UserSidebar from "../components/navigation/UserSidebar";
import "./RemindersPage.css";

function getToken() {
  return localStorage.getItem("nutribot_token");
}

function RemindersPage() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    reminder_type: "CUSTOM",
    scheduled_for: "",
    frequency: "ONCE",
  });

  const getReminderIcon = (type) => {
    switch (type) {
      case "HYDRATION":
        return <Droplets size={20} />;

      case "MEDICATION":
        return <Pill size={20} />;

      case "WELLNESS":
        return <HeartPulse size={20} />;

      default:
        return <Bell size={20} />;
    }
  };

  const formatReminderType = (type) => {
    switch (type) {
      case "HYDRATION":
        return "Hydration";

      case "MEDICATION":
        return "Medication";

      case "WELLNESS":
        return "Wellness";

      default:
        return "Custom";
    }
  };

  const formatFrequency = (frequency) => {
    switch (frequency) {
      case "DAILY":
        return "Daily";

      case "WEEKLY":
        return "Weekly";

      default:
        return "Once";
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) {
      return "No date";
    }

    const date = new Date(dateTime);

    if (Number.isNaN(date.getTime())) {
      return dateTime;
    }

    return date.toLocaleString("en-NG", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  /*
   * Used when creating, completing, or cancelling
   * a reminder after the page has already loaded.
   */
  const loadReminders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        setError("Please log in again to view your reminders.");
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/personal-reminders/my",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load reminders."
        );
      }

      setReminders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Load reminders error:", err);

      setError(
        err.message || "Unable to load your reminders."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  /*
   * Initial page load.
   *
   * Important:
   * We do NOT call loadReminders() here because that
   * function calls setLoading(true) synchronously.
   *
   * The fetch happens first, then React state is updated
   * after the asynchronous operation completes.
   */
  useEffect(() => {
    let cancelled = false;

    const loadInitialReminders = async () => {
      try {
        const token = getToken();

        if (!token) {
          if (!cancelled) {
            setError(
              "Please log in again to view your reminders."
            );
            setLoading(false);
          }

          return;
        }

        const response = await fetch(
          "http://localhost:5000/api/personal-reminders/my",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load reminders."
          );
        }

        if (!cancelled) {
          setReminders(
            Array.isArray(data) ? data : []
          );
          setLoading(false);
        }
      } catch (err) {
        console.error(
          "Initial reminders load error:",
          err
        );

        if (!cancelled) {
          setError(
            err.message ||
              "Unable to load your reminders."
          );
          setLoading(false);
        }
      }
    };

    loadInitialReminders();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      reminder_type: "CUSTOM",
      scheduled_for: "",
      frequency: "ONCE",
    });
  };

  const handleCreateReminder = async (event) => {
    event.preventDefault();

    if (!formData.title.trim()) {
      setError("Please enter a reminder title.");
      return;
    }

    if (!formData.scheduled_for) {
      setError("Please select a reminder date and time.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const token = getToken();

      if (!token) {
        setError("Please log in again.");
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/personal-reminders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: formData.title.trim(),
            description:
              formData.description.trim(),
            reminder_type:
              formData.reminder_type,
            scheduled_for:
              formData.scheduled_for,
            frequency: formData.frequency,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to create reminder."
        );
      }

      resetForm();
      setShowForm(false);

      await loadReminders();
    } catch (err) {
      console.error(
        "Create reminder error:",
        err
      );

      setError(
        err.message ||
          "Unable to create reminder."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCompleteReminder = async (
    reminderId
  ) => {
    try {
      setError("");

      const token = getToken();

      if (!token) {
        setError("Please log in again.");
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/personal-reminders/${reminderId}/complete`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to complete reminder."
        );
      }

      await loadReminders();
    } catch (err) {
      console.error(
        "Complete reminder error:",
        err
      );

      setError(
        err.message ||
          "Unable to complete reminder."
      );
    }
  };

  const handleCancelReminder = async (
    reminderId
  ) => {
    try {
      setError("");

      const token = getToken();

      if (!token) {
        setError("Please log in again.");
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/personal-reminders/${reminderId}/cancel`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to cancel reminder."
        );
      }

      await loadReminders();
    } catch (err) {
      console.error(
        "Cancel reminder error:",
        err
      );

      setError(
        err.message ||
          "Unable to cancel reminder."
      );
    }
  };

  return (
    <div className="user-page">
      <UserSidebar />

      <main className="user-page-content reminders-page">
        <div className="reminders-header">
          <div>
            <div className="reminders-eyebrow">
              PERSONAL HEALTH
            </div>

            <h1>Reminders</h1>

            <p>
              Stay on top of your health routines,
              medications, hydration and wellness
              goals.
            </p>
          </div>

          <button
            type="button"
            className="reminders-add-button"
            onClick={() => {
              setError("");
              setShowForm(
                (current) => !current
              );
            }}
          >
            {showForm ? (
              <X size={18} />
            ) : (
              <Plus size={18} />
            )}

            {showForm
              ? "Close"
              : "Add Reminder"}
          </button>
        </div>

        {error && (
          <div className="reminders-error">
            <Bell size={18} />
            <span>{error}</span>
          </div>
        )}

        {showForm && (
          <section className="reminder-form-card">
            <div className="reminder-form-header">
              <div>
                <span className="reminder-form-icon">
                  <Plus size={18} />
                </span>

                <div>
                  <h2>Create Reminder</h2>

                  <p>
                    Add something you want
                    NutriBot to remind you about.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleCreateReminder}>
              <div className="reminder-form-grid">
                <div className="form-field">
                  <label htmlFor="title">
                    Reminder title
                  </label>

                  <input
                    id="title"
                    name="title"
                    type="text"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Drink water"
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="reminder_type">
                    Reminder type
                  </label>

                  <select
                    id="reminder_type"
                    name="reminder_type"
                    value={
                      formData.reminder_type
                    }
                    onChange={handleInputChange}
                  >
                    <option value="HYDRATION">
                      Hydration
                    </option>

                    <option value="MEDICATION">
                      Medication
                    </option>

                    <option value="WELLNESS">
                      Wellness
                    </option>

                    <option value="CUSTOM">
                      Custom
                    </option>
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="scheduled_for">
                    Date &amp; time
                  </label>

                  <input
                    id="scheduled_for"
                    name="scheduled_for"
                    type="datetime-local"
                    value={
                      formData.scheduled_for
                    }
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="frequency">
                    Frequency
                  </label>

                  <select
                    id="frequency"
                    name="frequency"
                    value={formData.frequency}
                    onChange={handleInputChange}
                  >
                    <option value="ONCE">
                      Once
                    </option>

                    <option value="DAILY">
                      Daily
                    </option>

                    <option value="WEEKLY">
                      Weekly
                    </option>
                  </select>
                </div>

                <div className="form-field form-field-full">
                  <label htmlFor="description">
                    Description
                  </label>

                  <textarea
                    id="description"
                    name="description"
                    value={
                      formData.description
                    }
                    onChange={handleInputChange}
                    placeholder="Add some additional details..."
                    rows="4"
                  />
                </div>
              </div>

              <div className="reminder-form-actions">
                <button
                  type="button"
                  className="reminder-secondary-button"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="reminder-primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : "Create Reminder"}
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="reminders-section">
          <div className="reminders-section-header">
            <div>
              <h2>Your reminders</h2>

              <p>
                Keep track of your personal health
                reminders.
              </p>
            </div>

            <div className="reminders-count">
              {reminders.length}
            </div>
          </div>

          {loading ? (
            <div className="reminders-empty-state">
              <Clock3 size={30} />

              <h3>
                Loading reminders...
              </h3>

              <p>
                Please wait while we load your
                reminders.
              </p>
            </div>
          ) : reminders.length === 0 ? (
            <div className="reminders-empty-state">
              <Bell size={34} />

              <h3>No reminders yet</h3>

              <p>
                Create your first personal reminder
                to stay consistent with your health
                routine.
              </p>

              <button
                type="button"
                className="reminders-empty-button"
                onClick={() => {
                  setError("");
                  setShowForm(true);
                }}
              >
                <Plus size={17} />
                Add Your First Reminder
              </button>
            </div>
          ) : (
            <div className="reminders-list">
              {reminders.map((reminder) => {
                const isCompleted =
                  reminder.status ===
                  "COMPLETED";

                return (
                  <article
                    key={reminder.id}
                    className={`reminder-card ${
                      isCompleted
                        ? "completed"
                        : ""
                    }`}
                  >
                    <div className="reminder-card-icon">
                      {getReminderIcon(
                        reminder.reminder_type
                      )}
                    </div>

                    <div className="reminder-card-content">
                      <div className="reminder-card-top">
                        <div>
                          <h3>
                            {reminder.title}
                          </h3>

                          <div className="reminder-type">
                            {formatReminderType(
                              reminder.reminder_type
                            )}
                          </div>
                        </div>

                        <span
                          className={`reminder-status ${
                            isCompleted
                              ? "completed"
                              : "pending"
                          }`}
                        >
                          {isCompleted
                            ? "Completed"
                            : "Pending"}
                        </span>
                      </div>

                      {reminder.description && (
                        <p className="reminder-description">
                          {
                            reminder.description
                          }
                        </p>
                      )}

                      <div className="reminder-meta">
                        <span>
                          <Clock3 size={15} />

                          {formatDateTime(
                            reminder.scheduled_for
                          )}
                        </span>

                        <span>
                          <Bell size={15} />

                          {formatFrequency(
                            reminder.frequency
                          )}
                        </span>
                      </div>

                      {!isCompleted && (
                        <div className="reminder-actions">
                          <button
                            type="button"
                            className="reminder-complete-button"
                            onClick={() =>
                              handleCompleteReminder(
                                reminder.id
                              )
                            }
                          >
                            <CheckCircle2
                              size={16}
                            />

                            Complete
                          </button>

                          <button
                            type="button"
                            className="reminder-cancel-button"
                            onClick={() =>
                              handleCancelReminder(
                                reminder.id
                              )
                            }
                          >
                            <X size={16} />

                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="reminders-info-card">
          <div className="reminders-info-icon">
            <HeartPulse size={22} />
          </div>

          <div>
            <h3>
              Build healthier routines
            </h3>

            <p>
              Use reminders for hydration,
              medication, wellness activities and
              other important health routines.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default RemindersPage;
