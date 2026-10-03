import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  MessageCircle,
  CalendarDays,
  Bell,
  Apple,
  HeartPulse,
  Droplets,
  User,
  LogOut,
} from "lucide-react";

import useTheme from "../../context/useTheme";
import "./UserSidebar.css";

function UserSidebar() {
  const navigate = useNavigate();

  const {
    theme,
    toggleTheme,
  } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem("nutribot_token");
    localStorage.removeItem("nutribot_user");

    navigate("/login", { replace: true });
  };

  const mainNavigation = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Chat",
      path: "/chat",
      icon: MessageCircle,
    },
    {
      label: "Appointments",
      path: "/appointments",
      icon: CalendarDays,
    },
    {
      label: "Reminders",
      path: "/reminders",
      icon: Bell,
    },
  ];

  const healthNavigation = [
    {
      label: "Nutrition",
      path: "/nutrition",
      icon: Apple,
    },
    {
      label: "Wellness",
      path: "/wellness",
      icon: HeartPulse,
    },
    {
      label: "Hydration",
      path: "/hydration",
      icon: Droplets,
    },
  ];

  return (
    <aside className="user-sidebar">
      {/* BRAND */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          N
        </div>

        <div className="sidebar-brand-text">
          <h2>NutriBot</h2>
          <span>Health Companion</span>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="sidebar-navigation">
        {/* MAIN */}
        <div className="sidebar-section">
          <div className="sidebar-section-title">
            MAIN
          </div>

          {mainNavigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `sidebar-link ${
                    isActive ? "active" : ""
                  }`
                }
              >
                <Icon
                  size={19}
                  strokeWidth={1.8}
                />

                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* HEALTH */}
        <div className="sidebar-section">
          <div className="sidebar-section-title">
            HEALTH
          </div>

          {healthNavigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `sidebar-link ${
                    isActive ? "active" : ""
                  }`
                }
              >
                <Icon
                  size={19}
                  strokeWidth={1.8}
                />

                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* BOTTOM */}
      <div className="sidebar-bottom">
        {/* PROFILE */}
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `sidebar-link ${
              isActive ? "active" : ""
            }`
          }
        >
          <User
            size={19}
            strokeWidth={1.8}
          />

          <span>Profile</span>
        </NavLink>

        {/* THEME TOGGLE */}
        <button
          type="button"
          className="sidebar-theme-toggle"
          onClick={toggleTheme}
          aria-label="Toggle light and dark mode"
        >
          <span className="theme-toggle-icon">
            {theme === "dark" ? "☀️" : "🌙"}
          </span>

          <span className="theme-toggle-label">
            {theme === "dark"
              ? "Light mode"
              : "Dark mode"}
          </span>

          <span className="theme-toggle-switch">
            <span
              className={`theme-toggle-knob ${
                theme === "light"
                  ? "light"
                  : ""
              }`}
            />
          </span>
        </button>

        {/* LOGOUT */}
        <button
          type="button"
          className="sidebar-logout"
          onClick={handleLogout}
        >
          <LogOut
            size={19}
            strokeWidth={1.8}
          />

          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default UserSidebar;