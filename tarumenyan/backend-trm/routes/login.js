const express = require("express")
const router = express.Router()
const db = require("../db")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
require("dotenv").config()

router.post("/", async (req, res) => {
  const { email, password } = req.body

  // Validasi input
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email dan password harus diisi" })
  }

  const emailLower = email.toLowerCase()
  const query = "SELECT * FROM users WHERE email = ?"

  db.query(query, [emailLower], async (err, results) => {
    if (err) {
      console.error("Database error:", err)
      return res.status(500).json({ success: false, message: "Database error" })
    }

    if (results.length === 0) {
      return res.status(401).json({ success: false, message: "Email atau password salah" })
    }

    const user = results[0]

    try {
      // Verify password dengan bcrypt
      const isPasswordValid = await bcrypt.compare(password, user.password)

      if (!isPasswordValid) {
        return res.status(401).json({ success: false, message: "Email atau password salah" })
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role || "user"
        },
        process.env.JWT_SECRET || "default_secret_key",
        { expiresIn: "24h" }
      )

      const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || "user",
      }

      res.json({
        success: true,
        user: userData,
        token: token
      })
    } catch (error) {
      console.error("Login error:", error)
      return res.status(500).json({ success: false, message: "Server error" })
    }
  })
})

module.exports = router
