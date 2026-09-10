function Appointments() {
  const appointments = [];

  return (
    <div className="dashboard-card">
      <div>
        <h3>Upcoming Appointments</h3>

        {appointments.length === 0 ? (
          <p>No upcoming appointments</p>
        ) : (
          appointments.map((appointment) => (
            <div key={appointment.id}>
              <strong>{appointment.title}</strong>
              <p>{appointment.date}</p>
            </div>
          ))
        )}
      </div>

      <button>View all</button>
    </div>
  );
}

export default Appointments;