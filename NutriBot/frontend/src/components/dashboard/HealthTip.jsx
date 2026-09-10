function HealthTip() {
  const tip = "Limit screen time 1 hour before bed for better sleep.";

  return (
    <div className="health-tip">
      <div>
        <span>DAILY HEALTH TIP</span>
        <p>{tip}</p>
      </div>
    </div>
  );
}

export default HealthTip;