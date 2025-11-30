const express = require("express")
const router = express.Router()
const supabase = require("../db")
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

  try {
    // Find user by email (username field)
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", emailLower)
      .single()

    if (error || !user) {
      return res.status(401).json({ success: false, message: "Email atau password salah" })
    }

    // Verify password dengan bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Email atau password salah" })
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role || "user"
      },
      process.env.JWT_SECRET || "default_secret_key",
      { expiresIn: "24h" }
    )

    const userData = {
      id: user.id,
      username: user.username,
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

module.exports = router
