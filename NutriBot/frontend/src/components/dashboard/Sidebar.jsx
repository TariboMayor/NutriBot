import { NavLink } from "react-router-dom";
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

function Sidebar() {
  const menuItems = [
    {
      id: 1,
      name: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      id: 2,
      name: "Chat with NutriBot",
      icon: MessageCircle,
    },
    {
      id: 3,
      name: "Appointments",
      icon: CalendarDays,
    },
    {
      id: 4,
      name: "Reminders",
      icon: Bell,
    },
    {
      id: 5,
      name: "Nutrition",
      icon: Apple,
    },
    {
      id: 6,
      name: "Hygiene Guide",
      icon: ShieldCheck,
    },
    {
      id: 7,
      name: "Profile",
      icon: User,
    },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h2>NutriBot</h2>
        <p>Your AI Health Assistant</p>
      </div>

      <nav className="sidebar-nav">
  {menuItems.map((item) => {
    const Icon = item.icon;

    return (
      <NavLink
        key={item.id}
        to={
          item.name === "Dashboard"
            ? "/dashboard"
            : item.name === "Chat with NutriBot"
            ? "/chat"
            : "#"
        }
        className={({ isActive }) => (isActive ? "active" : "")}
      >
        <Icon size={18} />
        <span>{item.name}</span>
      </NavLink>
    );
  })}
</nav>

      <div className="sidebar-bottom">
        <div className="user-profile">
          <User size={18} />

          <div>
            <strong>tariboezekiel259</strong>
            <small>User</small>
          </div>
        </div>

        <button className="collapse-button">
          <ChevronLeft size={18} />
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;