
require("dotenv").config();

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
const appointmentStatusRoutes = require("./routes/appointmentStatusRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const reminderRoutes = require("./routes/reminderRoutes");
const personalReminderRoutes = require("./routes/personalReminderRoutes");
const messageRoutes = require("./routes/messageRoutes");

const reminderScheduler = require("./services/reminderScheduler");

const app = express();

const PORT = 5000;

/* ========================================
   MIDDLEWARE
======================================== */

app.use(cors());

app.use(express.json());

/* ========================================
   AUTH ROUTES
   MUST COME BEFORE GENERAL /api ROUTES
======================================== */

app.use("/api/auth", authRoutes);

/* ========================================
   API ROUTES
======================================== */

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

app.use("/api/appointment-status", appointmentStatusRoutes);

app.use("/api/notifications", notificationRoutes);

app.use("/api/reminders", reminderRoutes);

app.use("/api/personal-reminders", personalReminderRoutes);

app.use("/api/messages", messageRoutes);

/* ========================================
   CHAT ROUTES
   These routes use authenticateToken
======================================== */

app.use("/api", chatRoutes);

/* ========================================
   REMINDER SCHEDULER
======================================== */

reminderScheduler.startReminderScheduler();

/* ========================================
   ROOT ROUTE
======================================== */

app.get("/", (req, res) => {
  res.json({
    message: "Nia backend is running!",
  });
});

/* ========================================
   START SERVER
======================================== */

app.listen(PORT, () => {
  console.log(
    `Nia backend running on http://localhost:${PORT}`
  );
});
