const express = require("express")
const router = express.Router()
const db = require("../db")
const bcrypt = require("bcrypt")

router.post("/", async (req, res) => {
  const { name, email, password } = req.body
  const emailLower = email.toLowerCase()

  // Validasi input
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "Semua field harus diisi" })
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, message: "Password minimal 6 karakter" })
  }

  const checkQuery = "SELECT * FROM users WHERE email = ?"
  db.query(checkQuery, [emailLower], async (err, results) => {
    if (err) {
      console.error("Database error:", err)
      return res.status(500).json({ success: false, message: "Database error" })
    }

    if (results.length > 0) {
      return res.status(409).json({ success: false, message: "Email sudah terdaftar" })
    }

    try {
      // Hash password dengan bcrypt (salt rounds = 10)
      const hashedPassword = await bcrypt.hash(password, 10)

      const insertQuery = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)"
      db.query(insertQuery, [name, emailLower, hashedPassword], (err2) => {
        if (err2) {
          console.error("Insert error:", err2)
          return res.status(500).json({ success: false, message: "Gagal menyimpan user" })
        }

        res.status(201).json({ success: true, message: "Pendaftaran berhasil" })
      })
    } catch (hashError) {
      console.error("Hashing error:", hashError)
      return res.status(500).json({ success: false, message: "Server error" })
    }
  })
})

module.exports = router
