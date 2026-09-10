import { useState } from "react";

function SleepTracker() {
  const [sleepLogged, setSleepLogged] = useState(false);

  function logSleep() {
    setSleepLogged(true);
  }

  return (
    <div className="tracker-card">
      <h3>Sleep Tracker</h3>

      {!sleepLogged ? (
        <>
          <p>🌙</p>
          <p>Log your sleep tonight</p>

          <button onClick={logSleep}>
            Log Sleep
          </button>
        </>
      ) : (
        <div className="sleep-logged">
          <p>🌙 Sleep logged!</p>
          <small>Great job keeping track of your sleep.</small>
        </div>
      )}
    </div>
  );
}

export default SleepTracker;