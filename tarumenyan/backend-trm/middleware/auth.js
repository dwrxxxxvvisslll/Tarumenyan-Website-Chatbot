const jwt = require("jsonwebtoken")
require("dotenv").config()

// Middleware untuk verifikasi JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1] // Format: "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ error: "Access token required" })
  }

  jwt.verify(token, process.env.JWT_SECRET || "default_secret_key", (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" })
    }

    req.user = user
    next()
  })
}

// Middleware untuk verifikasi role admin
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" })
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" })
  }

  next()
}

module.exports = {
  authenticateToken,
  requireAdmin
}
