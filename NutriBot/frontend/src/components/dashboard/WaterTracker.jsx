import { useState } from "react";

function WaterTracker() {
  const [water, setWater] = useState(0);

  const dailyGoal = 2500;

  function addWater() {
    setWater((prev) => Math.min(prev + 250, dailyGoal));
  }

  function removeWater() {
    setWater((prev) => Math.max(prev - 250, 0));
  }

  return (
    <div className="tracker-card">
      <h3>Water Intake</h3>

      <div className="water-amount">
        <strong>{water} ml</strong>
        <span>of {dailyGoal} ml</span>
      </div>

      <div className="water-controls">
        <button onClick={removeWater}>−</button>
        <button onClick={addWater}>+</button>
      </div>
    </div>
  );
}

export default WaterTracker;