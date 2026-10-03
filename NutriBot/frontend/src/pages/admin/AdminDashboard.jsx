import "../Dashboard.css";

function AdminDashboard() {
  return (
    <div className="dashboard">
      <main className="dashboard-main">
        <h1>Admin Dashboard</h1>
        <p>Welcome to the NutriBot administration dashboard.</p>

        <div className="trackers-grid">
          <div className="dashboard-card">
            <h2>Hospitals</h2>
            <p>Manage hospitals on the platform.</p>
          </div>

          <div className="dashboard-card">
            <h2>Invitations</h2>
            <p>Manage hospital invitations.</p>
          </div>

          <div className="dashboard-card">
            <h2>Verifications</h2>
            <p>Review hospital verification requests.</p>
          </div>

          <div className="dashboard-card">
            <h2>Users</h2>
            <p>Manage NutriBot users.</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;