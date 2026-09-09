const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "nutrition_db",
});

db.connect((error) => {
  if (error) {
    console.error("Database connection failed:", error.message);
    return;
  }

  console.log("Connected to MySQL database!");
});

module.exports = db;