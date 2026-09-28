const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const JWT_SECRET = process.env.JWT_SECRET;

const signup = async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;

    if (!name || !phone || !email || !password) {
      return res.status(400).json({
        message: "Please fill in all fields.",
      });
    }

    db.query(
      "SELECT id FROM users_tbl WHERE email = ?",
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

        const hashedPassword = await bcrypt.hash(password, 10);

        db.query(
          "INSERT INTO users_tbl (name, phone, email, password) VALUES (?, ?, ?, ?)",
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

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please enter your email and password.",
      });
    }

    if (!JWT_SECRET) {
      console.error("JWT_SECRET is not configured.");

      return res.status(500).json({
        message: "Authentication configuration error.",
      });
    }

    db.query(
      "SELECT * FROM users_tbl WHERE email = ?",
      [email],
      async (error, results) => {
        if (error) {
          console.error(error);

          return res.status(500).json({
            message: "Database error.",
          });
        }

        if (results.length === 0) {
          return res.status(401).json({
            message: "Invalid email or password.",
          });
        }

        const user = results[0];

        const passwordMatch = await bcrypt.compare(
          password,
          user.password
        );

        if (!passwordMatch) {
          return res.status(401).json({
            message: "Invalid email or password.",
          });
        }

        if (user.status !== "ACTIVE") {
          return res.status(403).json({
            message: "Your account is not active.",
          });
        }

        const token = jwt.sign(
          {
            id: user.id,
            role: user.role,
          },
          JWT_SECRET,
          {
            expiresIn: "7d",
          }
        );

        res.json({
          message: "Login successful!",
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        });
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
  login,
};