import {
  Apple,
  Utensils,
  BookOpen,
  MessageCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import UserSidebar from "../components/navigation/UserSidebar";

import "./NutritionPage.css";

function NutritionPage() {
  const navigate = useNavigate();

  return (
    <div className="nutrition-page">
      <UserSidebar />

      <main className="nutrition-main">
        <header className="nutrition-header">
          <div>
            <span className="nutrition-label">
              HEALTH
            </span>

            <h1>Nutrition</h1>

            <p>
              Make healthier food choices and build better
              eating habits.
            </p>
          </div>
        </header>

        <div className="nutrition-content">
          {/* INTRO */}
          <section className="nutrition-hero">
            <div className="nutrition-hero-icon">
              <Apple size={27} />
            </div>

            <div>
              <h2>Eat well, feel better</h2>

              <p>
                Explore nutrition guidance and learn how
                to make balanced food choices that fit your
                lifestyle.
              </p>
            </div>
          </section>

          {/* QUICK ACTIONS */}
          <section className="nutrition-section">
            <div className="nutrition-section-heading">
              <span>QUICK ACTIONS</span>
              <h2>What would you like to explore?</h2>
            </div>

            <div className="nutrition-actions">
              <button
                type="button"
                className="nutrition-action-card"
                onClick={() => navigate("/foods")}
              >
                <div className="nutrition-action-icon">
                  <Utensils size={20} />
                </div>

                <div>
                  <strong>Explore Foods</strong>

                  <p>
                    Browse foods and learn about their
                    nutritional value.
                  </p>
                </div>

                <span>→</span>
              </button>

              <button
                type="button"
                className="nutrition-action-card"
                onClick={() => navigate("/chat")}
              >
                <div className="nutrition-action-icon">
                  <MessageCircle size={20} />
                </div>

                <div>
                  <strong>Ask Nia</strong>

                  <p>
                    Ask questions about nutrition and
                    healthy eating.
                  </p>
                </div>

                <span>→</span>
              </button>

              <button
                type="button"
                className="nutrition-action-card"
                onClick={() => {
                  window.scrollTo({
                    top: document.body.scrollHeight,
                    behavior: "smooth",
                  });
                }}
              >
                <div className="nutrition-action-icon">
                  <BookOpen size={20} />
                </div>

                <div>
                  <strong>Nutrition Guide</strong>

                  <p>
                    Learn simple principles for balanced
                    nutrition.
                  </p>
                </div>

                <span>↓</span>
              </button>
            </div>
          </section>

          {/* NUTRITION PRINCIPLES */}
          <section className="nutrition-section">
            <div className="nutrition-section-heading">
              <span>FOUNDATIONS</span>
              <h2>Simple nutrition principles</h2>
            </div>

            <div className="nutrition-principles">
              <article className="nutrition-principle-card">
                <div className="principle-number">
                  01
                </div>

                <div>
                  <h3>Eat a variety of foods</h3>

                  <p>
                    Include different food groups in your
                    meals so your diet provides a broader
                    range of nutrients.
                  </p>
                </div>
              </article>

              <article className="nutrition-principle-card">
                <div className="principle-number">
                  02
                </div>

                <div>
                  <h3>Include vegetables and fruits</h3>

                  <p>
                    Add vegetables and fruits regularly to
                    meals and snacks as part of a balanced
                    diet.
                  </p>
                </div>
              </article>

              <article className="nutrition-principle-card">
                <div className="principle-number">
                  03
                </div>

                <div>
                  <h3>Choose balanced meals</h3>

                  <p>
                    Combine appropriate portions of
                    carbohydrates, protein, vegetables,
                    fruits, and healthy fats.
                  </p>
                </div>
              </article>

              <article className="nutrition-principle-card">
                <div className="principle-number">
                  04
                </div>

                <div>
                  <h3>Stay hydrated</h3>

                  <p>
                    Drinking enough fluids throughout the
                    day supports normal body functions and
                    overall wellbeing.
                  </p>
                </div>
              </article>
            </div>
          </section>

          {/* NIGERIAN FOOD */}
          <section className="nutrition-section nutrition-guide-section">
            <div className="nutrition-section-heading">
              <span>NIGERIAN NUTRITION</span>
              <h2>Build healthier Nigerian meals</h2>
            </div>

            <div className="nutrition-guide-card">
              <div className="nutrition-guide-icon">
                🇳🇬
              </div>

              <div>
                <h3>
                  Your familiar foods can fit into a
                  balanced diet.
                </h3>

                <p>
                  NutriBot can help you understand foods
                  commonly eaten in Nigeria and explore
                  healthier ways to build balanced meals.
                </p>

                <button
                  type="button"
                  onClick={() => navigate("/chat")}
                >
                  Ask Nia about my meals →
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default NutritionPage;