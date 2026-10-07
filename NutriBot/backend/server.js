``
const express = require("express");
const cors = require("cors");

/* =========================================================
   ROUTES
========================================================= */

const authRoutes = require("./routes/authRoutes");

const foodRoutes = require("./routes/foodRoutes");

const patientRoutes = require("./routes/patientRoutes");

const hospitalRoutes = require("./routes/hospitalRoutes");

const hospitalStaffRoutes = require("./routes/hospitalStaffRoutes");

const doctorRoutes = require("./routes/doctorRoutes");

const medicalServiceRoutes = require("./routes/medicalServiceRoutes");

const hospitalServiceRoutes = require("./routes/hospitalServiceRoutes");

const doctorServiceRoutes = require("./routes/doctorServiceRoutes");

const doctorAvailabilityRoutes = require(
  "./routes/doctorAvailabilityRoutes"
);

const appointmentRoutes = require("./routes/appointmentRoutes");

const appointmentStatusRoutes = require(
  "./routes/appointmentStatusRoutes"
);

const notificationRoutes = require(
  "./routes/notificationRoutes"
);

const reminderRoutes = require("./routes/reminderRoutes");

const personalReminderRoutes = require(
  "./routes/personalReminderRoutes"
);

const messageRoutes = require("./routes/messageRoutes");

const chatRoutes = require("./routes/chatRoutes");


/* =========================================================
   SERVICES
========================================================= */

const reminderScheduler = require(
  "./services/reminderScheduler"
);


/* =========================================================
   APP
========================================================= */

const app = express();

const PORT = 5000;


/* =========================================================
   BACKEND CRASH DIAGNOSTICS
========================================================= */

process.on("uncaughtException", (error) => {
  console.error(
    "========================================"
  );

  console.error("UNCAUGHT EXCEPTION");

  console.error(
    "========================================"
  );

  console.error(error);

  console.error(
    "========================================"
  );
});


process.on("unhandledRejection", (reason) => {
  console.error(
    "========================================"
  );

  console.error("UNHANDLED PROMISE REJECTION");

  console.error(
    "========================================"
  );

  console.error(reason);

  console.error(
    "========================================"
  );
});


/* =========================================================
   CORS
========================================================= */

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
];


app.use(
  cors({
    origin: function (origin, callback) {

      /*
       * Allow requests that do not provide
       * an Origin header.
       */
      if (!origin) {
        return callback(null, true);
      }


      /*
       * Allow known frontend origins.
       */
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }


      console.log(
        "CORS blocked origin:",
        origin
      );

      return callback(
        new Error(
          "Origin not allowed by CORS."
        )
      );
    },

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
    ],

    credentials: false,

    optionsSuccessStatus: 204,
  })
);


/* =========================================================
   BODY PARSING
========================================================= */

app.use(express.json());


/* =========================================================
   REQUEST LOGGER
========================================================= */

app.use((req, res, next) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`
  );

  next();
});


/* =========================================================
   ROUTE VALIDATION
========================================================= */

const routeDefinitions = [
  ["authRoutes", authRoutes],

  ["foodRoutes", foodRoutes],

  ["patientRoutes", patientRoutes],

  ["hospitalRoutes", hospitalRoutes],

  ["hospitalStaffRoutes", hospitalStaffRoutes],

  ["doctorRoutes", doctorRoutes],

  ["medicalServiceRoutes", medicalServiceRoutes],

  ["hospitalServiceRoutes", hospitalServiceRoutes],

  ["doctorServiceRoutes", doctorServiceRoutes],

  ["doctorAvailabilityRoutes", doctorAvailabilityRoutes],

  ["appointmentRoutes", appointmentRoutes],

  ["appointmentStatusRoutes", appointmentStatusRoutes],

  ["notificationRoutes", notificationRoutes],

  ["reminderRoutes", reminderRoutes],

  ["personalReminderRoutes", personalReminderRoutes],

  ["messageRoutes", messageRoutes],

  ["chatRoutes", chatRoutes],
];


for (const [name, route] of routeDefinitions) {
  if (typeof route !== "function") {
    throw new TypeError(
      `${name} is not exporting an Express router/function. Check that route file's module.exports.`
    );
  }
}


/* =========================================================
   API ROUTES
========================================================= */

app.use(
  "/api/auth",
  authRoutes
);


app.use(
  "/api/foods",
  foodRoutes
);


app.use(
  "/api/patients",
  patientRoutes
);


app.use(
  "/api/hospitals",
  hospitalRoutes
);


app.use(
  "/api/hospital-staff",
  hospitalStaffRoutes
);


app.use(
  "/api/doctors",
  doctorRoutes
);


app.use(
  "/api/medical-services",
  medicalServiceRoutes
);


app.use(
  "/api/hospital-services",
  hospitalServiceRoutes
);


app.use(
  "/api/doctor-services",
  doctorServiceRoutes
);


/*
=========================================================
DOCTOR AVAILABILITY

Handles:

- Weekly doctor schedules
- Doctor leave dates
- Blocked dates
- Specific availability
=========================================================
*/

app.use(
  "/api/doctor-availability",
  doctorAvailabilityRoutes
);


app.use(
  "/api/appointments",
  appointmentRoutes
);


app.use(
  "/api/appointment-status",
  appointmentStatusRoutes
);


app.use(
  "/api/notifications",
  notificationRoutes
);


app.use(
  "/api/reminders",
  reminderRoutes
);


app.use(
  "/api/personal-reminders",
  personalReminderRoutes
);


app.use(
  "/api/messages",
  messageRoutes
);


app.use(
  "/api",
  chatRoutes
);


/* =========================================================
   ROOT TEST ROUTE
========================================================= */

app.get("/", (req, res) => {
  res.json({
    message: "Nia backend is running!",
  });
});


/* =========================================================
   404 HANDLER
========================================================= */

app.use((req, res) => {
  res.status(404).json({
    message: "API endpoint not found.",
    path: req.originalUrl,
  });
});


/* =========================================================
   GLOBAL ERROR HANDLER
========================================================= */

app.use((err, req, res, next) => {
  console.error(
    "========================================"
  );

  console.error("BACKEND ERROR");

  console.error(
    "========================================"
  );

  console.error(err);

  console.error(
    "========================================"
  );


  /*
   * Handle CORS errors clearly.
   */
  if (
    err.message ===
    "Origin not allowed by CORS."
  ) {
    return res.status(403).json({
      message:
        "This frontend origin is not allowed.",
    });
  }


  /*
   * General server error.
   */
  return res.status(500).json({
    message: "Internal server error.",
  });
});


/* =========================================================
   REMINDER SCHEDULER
========================================================= */

reminderScheduler.startReminderScheduler();


/* =========================================================
   START SERVER
========================================================= */

app.listen(
  PORT,
  "127.0.0.1",
  () => {

    console.log(
      "========================================"
    );

    console.log(
      `Nia backend running on http://127.0.0.1:${PORT}`
    );

    console.log(
      "Allowed frontend origins:"
    );


    allowedOrigins.forEach((origin) => {
      console.log(`- ${origin}`);
    });


    console.log(
      "========================================"
    );
  }
);
