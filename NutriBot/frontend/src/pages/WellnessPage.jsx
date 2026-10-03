import {
  HeartPulse,
  Activity,
  Moon,
  Brain,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import UserSidebar from "../components/navigation/UserSidebar";

import "./WellnessPage.css";

function WellnessPage() {
  const navigate = useNavigate();

  return (
    <div className="wellness-page">
      <UserSidebar />

      <main className="wellness-main">
        <header className="wellness-header">
          <div>
            <span className="wellness-label">
              HEALTH
            </span>

            <h1>Wellness</h1>

            <p>
              Build healthier habits and take care of your
              overall wellbeing.
            </p>
          </div>
        </header>

        <div className="wellness-content">
          {/* WELLNESS HERO */}
          <section className="wellness-hero">
            <div className="wellness-hero-icon">
              <HeartPulse size={27} />
            </div>

            <div>
              <h2>
                Your wellbeing matters
              </h2>

              <p>
                Wellness is more than nutrition. Sleep,
                movement, mental wellbeing, hydration, and
                daily habits all play an important role.
              </p>
            </div>
          </section>

          {/* WELLNESS AREAS */}
          <section className="wellness-section">
            <div className="wellness-section-heading">
              <span>WELLNESS AREAS</span>

              <h2>
                Focus on the things that support you
              </h2>
            </div>

            <div className="wellness-area-grid">
              <article className="wellness-area-card">
                <div className="wellness-area-icon">
                  <Activity size={21} />
                </div>

                <h3>Physical Activity</h3>

                <p>
                  Regular movement can support physical
                  health, energy, strength, and overall
                  wellbeing.
                </p>

                <button
                  type="button"
                  onClick={() => navigate("/chat")}
                >
                  Ask Nia →
                </button>
              </article>

              <article className="wellness-area-card">
                <div className="wellness-area-icon">
                  <Moon size={21} />
                </div>

                <h3>Sleep</h3>

                <p>
                  A consistent sleep routine can help
                  support recovery, concentration, mood,
                  and daily energy.
                </p>

                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                >
                  View tracker →
                </button>
              </article>

              <article className="wellness-area-card">
                <div className="wellness-area-icon">
                  <Brain size={21} />
                </div>

                <h3>Mental Wellbeing</h3>

                <p>
                  Give yourself time to rest, manage
                  stress, connect with others, and pay
                  attention to how you feel.
                </p>

                <button
                  type="button"
                  onClick={() => navigate("/chat")}
                >
                  Talk to Nia →
                </button>
              </article>
            </div>
          </section>

          {/* DAILY HABITS */}
          <section className="wellness-section">
            <div className="wellness-section-heading">
              <span>DAILY HABITS</span>

              <h2>
                Small actions can make a difference
              </h2>
            </div>

            <div className="wellness-habits">
              <div className="wellness-habit">
                <div className="habit-number">
                  01
                </div>

                <div>
                  <strong>
                    Move regularly
                  </strong>

                  <p>
                    Find opportunities to move throughout
                    your day.
                  </p>
                </div>
              </div>

              <div className="wellness-habit">
                <div className="habit-number">
                  02
                </div>

                <div>
                  <strong>
                    Prioritize sleep
                  </strong>

                  <p>
                    Maintain a consistent sleep and
                    wake-up routine where possible.
                  </p>
                </div>
              </div>

              <div className="wellness-habit">
                <div className="habit-number">
                  03
                </div>

                <div>
                  <strong>
                    Stay hydrated
                  </strong>

                  <p>
                    Keep water available and check your
                    hydration during the day.
                  </p>
                </div>
              </div>

              <div className="wellness-habit">
                <div className="habit-number">
                  04
                </div>

                <div>
                  <strong>
                    Make time to reset
                  </strong>

                  <p>
                    Take short breaks and make room for
                    activities that help you relax.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* NIA */}
          <section className="wellness-nia-card">
            <div className="wellness-nia-avatar">
              N
            </div>

            <div className="wellness-nia-content">
              <span>NEED SOME GUIDANCE?</span>

              <h3>
                Ask Nia about your wellness goals.
              </h3>

              <p>
                Tell Nia what you want to improve and get
                practical nutrition and wellness guidance.
              </p>

              <button
                type="button"
                onClick={() => navigate("/chat")}
              >
                Chat with Nia →
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default WellnessPage;