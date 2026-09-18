import { useEffect, useState } from "react";
import "./FoodDashboard.css";

function FoodDashboard() {
  const [foods, setFoods] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedFood, setSelectedFood] = useState(null);

  useEffect(() => {
    async function fetchFoods() {
      try {
        const response = await fetch("http://localhost:5000/api/foods");

        const data = await response.json();

        setFoods(data);
      } catch (error) {
        console.error("Error fetching foods:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchFoods();
  }, []);

  const filteredFoods = foods.filter((food) =>
    food.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="food-dashboard">
      <div className="food-header">
        <h1>Nigerian Foods 🇳🇬</h1>

        <p>
          Explore nutritional information about foods from different Nigerian
          communities.
        </p>
      </div>

      <div className="food-search">
        <input
          type="text"
          placeholder="Search Nigerian foods..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {loading ? (
        <p>Loading foods...</p>
      ) : (
        <div className="food-grid">
          {filteredFoods.map((food) => (
            <div className="food-card" key={food.id}>
              <div className="food-card-top">
                <span className="food-category">
                  {food.category}
                </span>
              </div>

              <h2>{food.name}</h2>

              <p>{food.region_or_group}</p>

              <div className="nutrition-info">
                <div>
                  <span>Calories</span>
                  <strong>{food.calories} kcal</strong>
                </div>

                <div>
                  <span>Protein</span>
                  <strong>{food.protein} g</strong>
                </div>

                <div>
                  <span>Carbs</span>
                  <strong>{food.carbs} g</strong>
                </div>

                <div>
                  <span>Fat</span>
                  <strong>{food.fat} g</strong>
                </div>
              </div>

              <button onClick={() => setSelectedFood(food)}>
                View Details
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedFood && (
        <div
          className="food-modal-overlay"
          onClick={() => setSelectedFood(null)}
        >
          <div
            className="food-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="food-modal-close"
              onClick={() => setSelectedFood(null)}
            >
              ×
            </button>

            <span className="food-category">
              {selectedFood.category}
            </span>

            <h2>{selectedFood.name}</h2>

            <p className="food-modal-region">
              {selectedFood.region_or_group}
            </p>

            <div className="food-modal-section">
              <h3>Serving Size</h3>
              <p>{selectedFood.serving_size}</p>
            </div>

            <div className="food-modal-nutrition">
              <div>
                <span>Calories</span>
                <strong>{selectedFood.calories} kcal</strong>
              </div>

              <div>
                <span>Protein</span>
                <strong>{selectedFood.protein} g</strong>
              </div>

              <div>
                <span>Carbohydrates</span>
                <strong>{selectedFood.carbs} g</strong>
              </div>

              <div>
                <span>Fat</span>
                <strong>{selectedFood.fat} g</strong>
              </div>

              <div>
                <span>Fibre</span>
                <strong>{selectedFood.fibre} g</strong>
              </div>
            </div>

            <div className="food-modal-section">
              <h3>Vitamins</h3>
              <p>{selectedFood.vitamins || "No information available."}</p>
            </div>

            <div className="food-modal-section">
              <h3>Minerals</h3>
              <p>{selectedFood.minerals || "No information available."}</p>
            </div>

            <div className="food-modal-section">
              <h3>About this food</h3>
              <p>
                {selectedFood.description || "No description available."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FoodDashboard;
