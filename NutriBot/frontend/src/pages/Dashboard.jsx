import { useState } from "react";
import {
  LayoutDashboard,
  MessageCircle,
  CalendarDays,
  Bell,
  Apple,
  ShieldCheck,
  User,
  ChevronLeft,
} from "lucide-react";

import "./Dashboard.css";

function Dashboard() {
    const username = "tari";

    const [height, setHeight] = useState("");
    const [weight, setWeight] = useState("");
    const [bmi, setBmi] = useState(null);

    function calculateBMI() {
  if (!height || !weight) {
    return;
  }

  const heightInMeters = Number(height) / 100;
  const weightInKg = Number(weight);

  const result = weightInKg / (heightInMeters * heightInMeters);

  setBmi(result.toFixed(2));
}
  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        {/* Logo */}
        <div className="brand">
          <div className="brand-icon">N</div>

          <div>
            <h2>Nia</h2>
            <p>Your AI Health Assistant</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <a href="#" className="nav-item active">
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </a>

          <a href="#" className="nav-item">
            <MessageCircle size={20} />
            <span>Chat with Nia</span>
          </a>

          <a href="#" className="nav-item">
            <CalendarDays size={20} />
            <span>Appointments</span>
          </a>

          <a href="#" className="nav-item">
            <Bell size={20} />
            <span>Reminders</span>
          </a>

          <a href="#" className="nav-item">
            <Apple size={20} />
            <span>Nutrition</span>
          </a>

          <a href="#" className="nav-item">
            <ShieldCheck size={20} />
            <span>Hygiene Guide</span>
          </a>

          <a href="#" className="nav-item">
            <User size={20} />
            <span>Profile</span>
          </a>
        </nav>

        {/* User */}
        <div className="sidebar-bottom">
          <div className="user-profile">
            <div className="user-avatar">T</div>

            <div className="user-info">
                <strong>{username}</strong>
                <span>Health account</span>
            </div>
          </div>

          <button className="collapse-button">
            <ChevronLeft size={18} />
          </button>
        </div>
      </aside>

      {/* Main area */}
      <main className="dashboard-main">

  {/* Header */}
  <div className="dashboard-header">
    <div>
      <h1>Hello, {username} 👋</h1>
      <p>Here's your health overview for today.</p>
    </div>

    <div className="dashboard-actions">
      <button className="primary-button">
        Chat with NutriBot
      </button>

      <button className="secondary-button">
        Book Appointment
      </button>
    </div>
  </div>

  {/* Metrics */}
  <div className="metrics-grid">

    <div className="metric-card">
      <span>Upcoming Alerts</span>
      <strong>0</strong>
    </div>

    <div className="metric-card">
      <span>Active Meds</span>
      <strong>1</strong>
    </div>

    <div className="metric-card">
      <span>Reminders</span>
      <strong>0</strong>
    </div>

  </div>
  {/* Daily Health Tip */}
<div className="health-tip">
  <div className="health-tip-content">
    <span className="health-tip-label">DAILY HEALTH TIP</span>

    <p>
      Limit screen time 1 hour before bed for better sleep.
    </p>
  </div>

  <div className="health-tip-icon">
    ❤️
  </div>
</div>
<div className="trackers-grid">
  <div className="tracker-card">
    <h2>BMI Calculator</h2>
    <p>Calculate your Body Mass Index</p>

    <div className="bmi-inputs">
      <div>
        <label>Height (cm)</label>
        <input
  type="number"
  placeholder="e.g. 175"
  value={height}
  onChange={(event) => setHeight(event.target.value)}
/>
      </div>

      <div>
        <label>Weight (kg)</label>
        <input
  type="number"
  placeholder="e.g. 70"
  value={weight}
  onChange={(event) => setWeight(event.target.value)}
/>
      </div>
    </div>

    <button
         className="calculate-button"
        onClick={calculateBMI}
    >
  Calculate BMI
    </button>
    {bmi && (
    <div className="bmi-result">
         <span>Your BMI</span>
         <strong>{bmi}</strong>
    </div>
        )}
     </div>
  <div className="tracker-card">
  <h2>Water Intake</h2>
  <p>Stay hydrated throughout the day</p>

  <div className="water-display">
    <strong>0</strong>
    <span>of 2500 ml</span>
  </div>

  <div className="water-controls">
    <button>-</button>
    <span>0 ml</span>
    <button>+</button>
  </div>
</div>
<div className="tracker-card sleep-card">
  <h2>Sleep Tracker</h2>
  <p>Track your sleep and rest</p>

  <div className="sleep-content">
    <div className="sleep-icon">
      🌙
    </div>

    <h3>Log your sleep tonight</h3>

    <button className="sleep-button">
      Log Sleep
    </button>
  </div>
  
</div>
<div className="mood-card">
  <h2>Mood Tracker</h2>
  <p>How are you feeling today?</p>

  <div className="mood-options">
    <button>😢</button>
    <button>🙁</button>
    <button>😐</button>
    <button>🙂</button>
    <button>😄</button>
  </div>
</div>

</div>
<div className="bottom-grid">
  {/* Upcoming Appointments */}
  <div className="bottom-card">
    <div className="bottom-card-header">
      <h2>Upcoming Appointments</h2>
      <button>View all</button>
    </div>

    <div className="empty-state">
      <span>📅</span>
      <p>No upcoming appointments</p>
    </div>
  </div>

  {/* Active Reminders */}
  <div className="bottom-card">
    <div className="bottom-card-header">
      <h2>Active Reminders</h2>
      <button>View all</button>
    </div>

    <div className="reminder-item">
      <div className="reminder-icon">
        💊
      </div>

      <div className="reminder-info">
        <strong>Medication reminder</strong>
        <span>100mg - 08:00</span>
      </div>
    </div>
  </div>
</div>
</main>

    </div>
  );
}

export default Dashboard;
