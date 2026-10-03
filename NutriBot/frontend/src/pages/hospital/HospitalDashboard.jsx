import "../Dashboard.css";

function HospitalDashboard() {
  return (
    <div className="dashboard">
      <main className="dashboard-main">
        <h1>Hospital Dashboard</h1>
        <p>Welcome to the NutriBot hospital management dashboard.</p>

        <div className="trackers-grid">
          <div className="dashboard-card">
            <h2>Appointments</h2>
            <p>Manage patient appointments.</p>
          </div>

          <div className="dashboard-card">
            <h2>Doctors</h2>
            <p>Manage doctors and their services.</p>
          </div>

          <div className="dashboard-card">
            <h2>Services</h2>
            <p>Manage hospital services.</p>
          </div>

          <div className="dashboard-card">
            <h2>Availability</h2>
            <p>Manage doctor availability.</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default HospitalDashboard;