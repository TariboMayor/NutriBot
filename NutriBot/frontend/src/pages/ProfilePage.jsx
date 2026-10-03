import { useState } from "react";
import {
  User,
  Phone,
  Mail,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import UserSidebar from "../components/navigation/UserSidebar";

import "./ProfilePage.css";

function ProfilePage() {
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("nutribot_user");

  const user = storedUser
    ? JSON.parse(storedUser)
    : null;

  const [message, setMessage] = useState("");

  const displayName = user?.name || "NutriBot User";
  const email = user?.email || "No email available";
  const phone = user?.phone || "No phone number available";
  const role = user?.role || "PATIENT";

  const handleLogout = () => {
    localStorage.removeItem("nutribot_token");
    localStorage.removeItem("nutribot_user");

    navigate("/login", { replace: true });
  };

  const handleComingSoon = () => {
    setMessage(
      "Profile editing will be available soon."
    );

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  return (
    <div className="profile-page">
      <UserSidebar />

      <main className="profile-main">
        <header className="profile-header">
          <div>
            <span className="profile-label">
              ACCOUNT
            </span>

            <h1>My Profile</h1>

            <p>
              Manage your NutriBot account information.
            </p>
          </div>
        </header>

        <div className="profile-content">
          {message && (
            <div className="profile-message">
              {message}
            </div>
          )}

          {/* PROFILE SUMMARY */}
          <section className="profile-card profile-summary">
            <div className="profile-avatar">
              {displayName
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="profile-summary-info">
              <h2>{displayName}</h2>

              <p>{email}</p>

              <span className="profile-role">
                {role}
              </span>
            </div>

            <button
              type="button"
              className="profile-edit-button"
              onClick={handleComingSoon}
            >
              Edit Profile
            </button>
          </section>

          {/* PERSONAL INFORMATION */}
          <section className="profile-card">
            <div className="profile-card-header">
              <div>
                <span className="profile-section-label">
                  PERSONAL INFORMATION
                </span>

                <h2>Your account details</h2>
              </div>
            </div>

            <div className="profile-details-grid">
              <div className="profile-detail">
                <div className="profile-detail-icon">
                  <User size={18} />
                </div>

                <div>
                  <span>Name</span>
                  <strong>{displayName}</strong>
                </div>
              </div>

              <div className="profile-detail">
                <div className="profile-detail-icon">
                  <Mail size={18} />
                </div>

                <div>
                  <span>Email</span>
                  <strong>{email}</strong>
                </div>
              </div>

              <div className="profile-detail">
                <div className="profile-detail-icon">
                  <Phone size={18} />
                </div>

                <div>
                  <span>Phone</span>
                  <strong>{phone}</strong>
                </div>
              </div>

              <div className="profile-detail">
                <div className="profile-detail-icon">
                  <ShieldCheck size={18} />
                </div>

                <div>
                  <span>Account status</span>
                  <strong>
                    {user?.status || "ACTIVE"}
                  </strong>
                </div>
              </div>
            </div>
          </section>

          {/* SECURITY */}
          <section className="profile-card">
            <div className="profile-card-header">
              <div>
                <span className="profile-section-label">
                  SECURITY
                </span>

                <h2>Account security</h2>
              </div>
            </div>

            <div className="profile-security-row">
              <div className="profile-security-icon">
                <ShieldCheck size={20} />
              </div>

              <div className="profile-security-text">
                <strong>
                  Password protected
                </strong>

                <span>
                  Your account is protected with
                  password authentication.
                </span>
              </div>

              <button
                type="button"
                className="profile-secondary-button"
                onClick={handleComingSoon}
              >
                Change Password
              </button>
            </div>
          </section>

          {/* LOGOUT */}
          <section className="profile-card profile-danger-card">
            <div>
              <span className="profile-section-label">
                ACCOUNT
              </span>

              <h2>Sign out of NutriBot</h2>

              <p>
                Sign out from this device and return
                to the login page.
              </p>
            </div>

            <button
              type="button"
              className="profile-logout-button"
              onClick={handleLogout}
            >
              <LogOut size={17} />
              Logout
            </button>
          </section>
        </div>
      </main>
    </div>
  );
}

export default ProfilePage;