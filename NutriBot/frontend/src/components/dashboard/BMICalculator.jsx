import { useState } from "react";

function BMICalculator() {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bmi, setBmi] = useState(null);

  function calculateBMI() {
    if (!height || !weight) {
      return;
    }

    const heightInMeters = Number(height) / 100;
    const weightInKg = Number(weight);

    const result = weightInKg / (heightInMeters * heightInMeters);

    let category;

    if (result < 18.5) {
      category = "Underweight";
    } else if (result < 25) {
      category = "Normal range";
    } else if (result < 30) {
      category = "Overweight";
    } else {
      category = "Obesity range";
    }

    setBmi({
      value: result.toFixed(2),
      category: category,
    });
  }

  return (
    <div className="tracker-card">
      <h3>BMI Calculator</h3>

      <input
        type="number"
        placeholder="Height (cm)"
        value={height}
        onChange={(e) => setHeight(e.target.value)}
      />

      <input
        type="number"
        placeholder="Weight (kg)"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
      />

      <button onClick={calculateBMI}>Calculate</button>

      {bmi && (
        <div className="bmi-result">
          <span>Your BMI</span>
          <strong>{bmi.value}</strong>
          <small>{bmi.category}</small>
        </div>
      )}
    </div>
  );
}

export default BMICalculator;
