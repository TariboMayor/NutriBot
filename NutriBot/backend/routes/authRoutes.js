const express = require("express");

const {
  signup,
  login,
} = require("../controllers/authController");

const router = express.Router();

// Registration
router.post("/register", signup);

// Keep /signup available as well
router.post("/signup", signup);

// Login
router.post("/login", login);

module.exports = router;