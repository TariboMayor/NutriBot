const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    const parts = authHeader.split(" ");

    if (
      parts.length !== 2 ||
      parts[0] !== "Bearer" ||
      !parts[1]
    ) {
      return res.status(401).json({
        message: "Invalid authentication format.",
      });
    }

    const token = parts[1];

    if (!JWT_SECRET) {
      console.error("JWT_SECRET is not configured.");

      return res.status(500).json({
        message: "Authentication configuration error.",
      });
    }

    jwt.verify(token, JWT_SECRET, (error, decoded) => {
      if (error) {
        return res.status(401).json({
          message: "Invalid or expired token.",
        });
      }

      req.user = decoded;

      next();
    });
  } catch (error) {
    console.error("Authentication middleware error:", error);

    return res.status(500).json({
      message: "Authentication error.",
    });
  }
};

module.exports = {
  authenticateToken,
};