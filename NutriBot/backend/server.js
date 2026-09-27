const express = require("express");
const cors = require("cors");
const chatRoutes = require("./routes/chatRoutes");
const authRoutes = require("./routes/authRoutes");
const foodRoutes = require("./routes/foodRoutes");
const patientRoutes = require("./routes/patientRoutes");
const hospitalRoutes = require("./routes/hospitalRoutes");
const hospitalStaffRoutes = require("./routes/hospitalStaffRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const medicalServiceRoutes = require("./routes/medicalServiceRoutes");
const hospitalServiceRoutes = require("./routes/hospitalServiceRoutes");
const doctorServiceRoutes = require("./routes/doctorServiceRoutes");
const doctorAvailabilityRoutes = require("./routes/doctorAvailabilityRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");

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
app.use("/api/hospitals", hospitalRoutes);
app.use("/api/hospital-staff", hospitalStaffRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/medical-services", medicalServiceRoutes);
app.use("/api/hospital-services", hospitalServiceRoutes);
app.use("/api/doctor-services", doctorServiceRoutes);
app.use("/api/doctor-availability", doctorAvailabilityRoutes);
app.use("/api/appointments", appointmentRoutes);

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