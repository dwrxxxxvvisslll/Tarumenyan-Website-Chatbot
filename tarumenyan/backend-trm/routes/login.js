const express = require("express")
const router = express.Router()
const db = require("../db")

router.post("/", (req, res) => {
  const { email, password } = req.body

  const query = "SELECT * FROM users WHERE email = ? AND password = ?"
  db.query(query, [email, password], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Database error" })
    }

    if (results.length === 0) {
      return res.status(401).json({ success: false, message: "Email atau password salah" })
    }

    const user = results[0]

    // Optional: bikin struktur user yg dikirim lebih ringkas
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role || "user", // fallback ke 'user' kalau belum ada field role
    }

    res.json({ success: true, user: userData })
  })
})

module.exports = router
