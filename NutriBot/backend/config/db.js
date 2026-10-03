const mysql = require("mysql2");

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "nutrition_db",

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

db.getConnection((error, connection) => {
  if (error) {
    console.error(
      "Database connection failed:",
      error.message
    );
    return;
  }

  console.log("Connected to MySQL database!");

  connection.release();
});

module.exports = db;