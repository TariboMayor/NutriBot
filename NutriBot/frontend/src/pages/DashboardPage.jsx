import { getUser } from "../utils/auth";
import {
  MessageCircle,
  CalendarDays,
  Droplets,
  Apple,
  HeartPulse,
  ArrowRight,
} from "lucide-react";

import UserSidebar from "../components/navigation/UserSidebar";

import "./DashboardPage.css";

const user = getUser();
const userName = user?.name || "User";

function DashboardPage() {
  return (
    <div className="dashboard-page">
      <UserSidebar activePage="dashboard" />

      <main className="dashboard-main">
        {/* HEADER */}
        <header className="dashboard-header">
          <div>
            <p className="dashboard-eyebrow">YOUR HEALTH DASHBOARD</p>
            <h1>Good evening, {userName} 👋</h1>
            <p>
              Here is a quick look at your health activities and NutriBot
              services.
            </p>
          </div>

          <div className="dashboard-profile">
            <div className="dashboard-profile-avatar">T</div>
          </div>
        </header>

        {/* QUICK ACTIONS */}
        <section className="dashboard-section">
          <div className="dashboard-section-heading">
            <div>
              <h2>Quick Actions</h2>
              <p>Access your most-used NutriBot features.</p>
            </div>
          </div>

          <div className="dashboard-quick-grid">
            <button className="dashboard-action-card">
              <div className="dashboard-action-icon">
                <MessageCircle size={21} />
              </div>

              <div>
                <h3>Chat with Nia</h3>
                <p>Ask questions about nutrition and wellness.</p>
              </div>

              <ArrowRight size={18} />
            </button>

            <button className="dashboard-action-card">
              <div className="dashboard-action-icon">
                <CalendarDays size={21} />
              </div>

              <div>
                <h3>Appointments</h3>
                <p>View or manage your health appointments.</p>
              </div>

              <ArrowRight size={18} />
            </button>
          </div>
        </section>

        {/* HEALTH OVERVIEW */}
        <section className="dashboard-section">
          <div className="dashboard-section-heading">
            <div>
              <h2>Health Overview</h2>
              <p>Your current wellness information.</p>
            </div>
          </div>

          <div className="dashboard-health-grid">
            <div className="dashboard-health-card">
              <div className="dashboard-health-icon">
                <Droplets size={20} />
              </div>

              <div>
                <span>Hydration</span>
                <strong>0 / 8 glasses</strong>
                <small>Today's water intake</small>
              </div>
            </div>

            <div className="dashboard-health-card">
              <div className="dashboard-health-icon">
                <Apple size={20} />
              </div>

              <div>
                <span>Nutrition</span>
                <strong>Getting started</strong>
                <small>Track your nutrition journey</small>
              </div>
            </div>

            <div className="dashboard-health-card">
              <div className="dashboard-health-icon">
                <HeartPulse size={20} />
              </div>

              <div>
                <span>Wellness</span>
                <strong>Ready to improve</strong>
                <small>Build healthier habits</small>
              </div>
            </div>
          </div>
        </section>

        {/* APPOINTMENT */}
        <section className="dashboard-section">
          <div className="dashboard-section-heading">
            <div>
              <h2>Upcoming Appointment</h2>
              <p>Your next scheduled healthcare appointment.</p>
            </div>
          </div>

          <div className="dashboard-empty-card">
            <CalendarDays size={28} />

            <div>
              <h3>No upcoming appointments</h3>
              <p>
                When you book an appointment, it will appear here.
              </p>
            </div>

            <button type="button">
              Find a Hospital
              <ArrowRight size={16} />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default DashboardPage;