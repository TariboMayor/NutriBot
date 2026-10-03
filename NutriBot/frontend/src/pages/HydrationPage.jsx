import {
  Droplets,
  Plus,
  Target,
  Clock,
} from "lucide-react";
import { useState } from "react";

import UserSidebar from "../components/navigation/UserSidebar";

import "./HydrationPage.css";

function HydrationPage() {
  const DAILY_GOAL = 2000;

  const [water, setWater] = useState(0);

  const addWater = (amount) => {
    setWater((previous) =>
      Math.min(previous + amount, DAILY_GOAL)
    );
  };

  const percentage = Math.min(
    Math.round((water / DAILY_GOAL) * 100),
    100
  );

  const remaining = Math.max(
    DAILY_GOAL - water,
    0
  );

  return (
    <div className="hydration-page">
      <UserSidebar />

      <main className="hydration-main">
        <header className="hydration-header">
          <div>
            <span className="hydration-label">
              HEALTH
            </span>

            <h1>Hydration</h1>

            <p>
              Keep track of your water intake throughout
              the day.
            </p>
          </div>
        </header>

        <div className="hydration-content">
          {/* MAIN TRACKER */}
          <section className="hydration-tracker">
            <div className="hydration-tracker-top">
              <div className="hydration-big-icon">
                <Droplets size={28} />
              </div>

              <div>
                <span>DAILY WATER GOAL</span>

                <h2>
                  {water.toLocaleString()} ml
                  <small>
                    {" "}
                    / {DAILY_GOAL.toLocaleString()} ml
                  </small>
                </h2>
              </div>
            </div>

            <div className="hydration-progress">
              <div
                className="hydration-progress-bar"
                style={{
                  width: `${percentage}%`,
                }}
              ></div>
            </div>

            <div className="hydration-progress-info">
              <span>
                {percentage}% complete
              </span>

              <span>
                {remaining.toLocaleString()} ml remaining
              </span>
            </div>
          </section>

          {/* QUICK ADD */}
          <section className="hydration-section">
            <div className="hydration-section-heading">
              <span>QUICK ADD</span>

              <h2>How much did you drink?</h2>
            </div>

            <div className="water-options">
              <button
                type="button"
                onClick={() => addWater(250)}
              >
                <Plus size={16} />
                <strong>250 ml</strong>
                <span>Small glass</span>
              </button>

              <button
                type="button"
                onClick={() => addWater(500)}
              >
                <Plus size={16} />
                <strong>500 ml</strong>
                <span>Large glass</span>
              </button>

              <button
                type="button"
                onClick={() => addWater(750)}
              >
                <Plus size={16} />
                <strong>750 ml</strong>
                <span>Bottle</span>
              </button>

              <button
                type="button"
                onClick={() => addWater(1000)}
              >
                <Plus size={16} />
                <strong>1,000 ml</strong>
                <span>Large bottle</span>
              </button>
            </div>
          </section>

          {/* STATUS */}
          <section className="hydration-section">
            <div className="hydration-section-heading">
              <span>TODAY</span>

              <h2>Your hydration status</h2>
            </div>

            <div className="hydration-status-grid">
              <div className="hydration-status-card">
                <div className="hydration-status-icon">
                  <Target size={19} />
                </div>

                <div>
                  <span>Daily goal</span>
                  <strong>
                    {DAILY_GOAL.toLocaleString()} ml
                  </strong>
                </div>
              </div>

              <div className="hydration-status-card">
                <div className="hydration-status-icon">
                  <Droplets size={19} />
                </div>

                <div>
                  <span>Consumed</span>
                  <strong>
                    {water.toLocaleString()} ml
                  </strong>
                </div>
              </div>

              <div className="hydration-status-card">
                <div className="hydration-status-icon">
                  <Clock size={19} />
                </div>

                <div>
                  <span>Remaining</span>
                  <strong>
                    {remaining.toLocaleString()} ml
                  </strong>
                </div>
              </div>
            </div>
          </section>

          {/* TIP */}
          <section className="hydration-tip">
            <div className="hydration-tip-icon">
              💧
            </div>

            <div>
              <span>HYDRATION TIP</span>

              <h3>
                Keep water nearby throughout the day.
              </h3>

              <p>
                Taking smaller amounts regularly can make
                it easier to stay hydrated instead of
                waiting until you feel very thirsty.
              </p>
            </div>
          </section>

          {/* RESET */}
          <button
            type="button"
            className="hydration-reset"
            onClick={() => setWater(0)}
          >
            Reset today's tracker
          </button>
        </div>
      </main>
    </div>
  );
}

export default HydrationPage;