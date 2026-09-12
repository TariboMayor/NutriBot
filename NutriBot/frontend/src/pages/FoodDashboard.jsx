import "./FoodDashboard.css";

function FoodDashboard() {
  const foods = [
    {
      id: 1,
      name: "Jollof Rice",
      category: "Rice",
      image:
        "https://msosi.jumlajumla.com/_next/image?q=75&url=https%3A%2F%2Fmsosijumla.s3.eu-north-1.amazonaws.com%2Fpublic%2Fimages%2Fproducts%2F122-17550790969562.webp&w=3840",
      calories: "350 kcal",
      protein: "8 g",
      carbs: "55 g",
      fat: "10 g",
    },
    {
      id: 2,
      name: "Beans",
      category: "Legumes",
      image:
        "https://www.nairaland.com/attachments/14552144_savingpng267768x1024_jpeg805314a970eaf40d2b028a63768810fc",
      calories: "330 kcal",
      protein: "21 g",
      carbs: "60 g",
      fat: "1 g",
    },
    {
      id: 3,
      name: "Yam",
      category: "Tubers",
      image: "https://abikeskitchen.co.uk/img/menu/yam.png",
      calories: "270 kcal",
      protein: "2 g",
      carbs: "63 g",
      fat: "0 g",
    },
    {
      id: 4,
      name: "Plantain",
      category: "Fruits",
      image:
        "https://cdn.shopify.com/s/files/1/0067/1576/8885/files/Fried_Plantains_480x480.jpg?v=1735918927",
      calories: "220 kcal",
      protein: "2 g",
      carbs: "57 g",
      fat: "0 g",
    },
    {
      id: 5,
      name: "Moi Moi",
      category: "Legumes",
      image:
        "https://cdn.shopify.com/s/files/1/0012/5337/6060/articles/moi_moi_1024x.jpg?v=1611605450",
      calories: "190 kcal",
      protein: "10 g",
      carbs: "20 g",
      fat: "8 g",
    },
    {
      id: 6,
      name: "Eba",
      category: "Swallow",
      image:
        "https://snapcalorie-webflow-website.s3.us-east-2.amazonaws.com/media/food_pics_v2/medium/eba.jpg",
      calories: "360 kcal",
      protein: "2 g",
      carbs: "85 g",
      fat: "1 g",
    },
  ];

  return (
    <div className="food-dashboard">
      <div className="food-header">
        <h1>Nigerian Foods 🇳🇬</h1>

        <p>
          Explore nutritional information about popular Nigerian foods.
        </p>
      </div>

      <div className="food-search">
        <input
          type="text"
          placeholder="Search Nigerian foods..."
        />
      </div>

      <div className="food-grid">
        {foods.map((food) => (
          <div className="food-card" key={food.id}>

            <img
              src={food.image}
              alt={food.name}
              className="food-image"
            />

            <div className="food-card-top">
              <span className="food-category">
                {food.category}
              </span>
            </div>

            <h2>{food.name}</h2>

            <div className="nutrition-info">
              <div>
                <span>Calories</span>
                <strong>{food.calories}</strong>
              </div>

              <div>
                <span>Protein</span>
                <strong>{food.protein}</strong>
              </div>

              <div>
                <span>Carbs</span>
                <strong>{food.carbs}</strong>
              </div>

              <div>
                <span>Fat</span>
                <strong>{food.fat}</strong>
              </div>
            </div>

            <button>View Details</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FoodDashboard;