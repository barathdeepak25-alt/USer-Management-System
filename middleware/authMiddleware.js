const jwt = require("jsonwebtoken");

// Checks for a valid JWT in the Authorization header ("Bearer <token>").
// If valid, attaches the decoded user info to req.user and continues.
// If missing/invalid, responds with 401 Unauthorized.
const protect = (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // { id, name, email }
      return next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, invalid or expired token",
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token provided",
    });
  }
};

module.exports = { protect };
