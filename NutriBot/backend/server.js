const express = require("express");
const cors = require("cors");
const chatRoutes = require("./routes/chatRoutes");
const db = require("./config/db");
const { getNutritionByTopic } = require("./services/nutritionService");


const app = express();

const PORT = 5000;

getNutritionByTopic("protein")
  .then((results) => {
    console.log("Protein data:", results);
  })
  .catch((error) => {
    console.error("Nutrition query failed:", error.message);
  });

db.query(
  "SELECT * FROM nutrition_knowledge_tbl",
  (error, results) => {
    if (error) {
      console.error("Query failed:", error.message);
      return;
    }

    console.log("Nutrition data:", results);
  }
);

// Middleware
app.use(cors());
app.use(express.json());