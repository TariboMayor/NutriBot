const express = require("express");
const cors = require("cors");
const chatRoutes = require("./routes/chatRoutes");
const authRoutes = require("./routes/authRoutes");
const foodRoutes = require("./routes/foodRoutes");
const patientRoutes = require("./routes/patientRoutes");

const app = express();

const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", chatRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/foods", foodRoutes);
app.use("/api/patients", patientRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "Nia backend is running!",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Nia backend running on http://localhost:${PORT}`);
});