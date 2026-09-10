import { useState } from "react";

function MoodTracker() {
  const [mood, setMood] = useState(null);

  const moods = ["😢", "😕", "😐", "🙂", "😄"];

  return (
    <div className="tracker-card">
      <h3>Mood Tracker</h3>

      <p>How are you feeling today?</p>

      <div className="mood-options">
        {moods.map((item, index) => (
          <button
            key={index}
            onClick={() => setMood(item)}
            className={mood === item ? "selected-mood" : ""}
          >
            {item}
          </button>
        ))}
      </div>

      {mood && (
        <p>
          Your mood: <strong>{mood}</strong>
        </p>
      )}
    </div>
  );
}

export default MoodTracker;