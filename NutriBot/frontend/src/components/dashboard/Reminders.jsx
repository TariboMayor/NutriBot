function Reminders() {
  const reminders = [
    {
      id: 1,
      text: "100mg - 08:00",
    },
  ];

  return (
    <div className="dashboard-card">
      <div>
        <h3>Active Reminders</h3>

        {reminders.length === 0 ? (
          <p>No active reminders</p>
        ) : (
          reminders.map((reminder) => (
            <div key={reminder.id}>
              💊 {reminder.text}
            </div>
          ))
        )}
      </div>

      <button>View all</button>
    </div>
  );
}

export default Reminders;