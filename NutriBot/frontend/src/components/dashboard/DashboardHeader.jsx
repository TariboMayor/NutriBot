function DashboardHeader() {
  return (
    <div className="dashboard-header">
      <div>
        <h1>Hello, tariboezekiel259 👋</h1>
        <p>Here's your health overview for today.</p>
      </div>

      <div className="header-actions">
        <button>Chat with NutriBot</button>
        <button>Book Appointment</button>
      </div>
    </div>
  );
}

export default DashboardHeader;