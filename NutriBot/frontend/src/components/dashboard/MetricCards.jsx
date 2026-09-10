function MetricCards() {
  const metrics = [
    {
      id: 1,
      title: "Upcoming Alerts",
      value: 0,
    },
    {
      id: 2,
      title: "Active Meds",
      value: 1,
    },
    {
      id: 3,
      title: "Reminders",
      value: 0,
    },
  ];

  return (
    <div className="metrics-grid">
      {metrics.map((metric) => (
        <div className="metric-card" key={metric.id}>
          <span>{metric.title}</span>
          <strong>{metric.value}</strong>
        </div>
      ))}
    </div>
  );
}

export default MetricCards;