const bcrypt = require("bcryptjs");
const db = require("../config/db");

const signup = async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;

    // Check that all fields were provided
    if (!name || !phone || !email || !password) {
      return res.status(400).json({
        message: "Please fill in all fields.",
      });
    }

    // Check if email already exists
    db.query(
      "SELECT id FROM users WHERE email = ?",
      [email],
      async (error, results) => {
        if (error) {
          console.error(error);
          return res.status(500).json({
            message: "Database error.",
          });
        }

        if (results.length > 0) {
          return res.status(400).json({
            message: "Email already exists.",
          });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save user
        db.query(
          "INSERT INTO users (name, phone, email, password) VALUES (?, ?, ?, ?)",
          [name, phone, email, hashedPassword],
          (error) => {
            if (error) {
              console.error(error);
              return res.status(500).json({
                message: "Could not create account.",
              });
            }

            res.status(201).json({
              message: "Account created successfully!",
            });
          }
        );
      }
    );
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error.",
    });
  }
};

module.exports = {
  signup,
};