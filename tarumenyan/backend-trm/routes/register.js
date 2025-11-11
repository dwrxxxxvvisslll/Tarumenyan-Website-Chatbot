const express = require("express")
const router = express.Router()
const db = require("../db")

router.post("/", (req, res) => {
  const { name, email, password } = req.body
  const emailLower = email.toLowerCase(); // Mengubah email ke huruf kecil untuk konsistensi

  const checkQuery = "SELECT * FROM users WHERE email = ?"
  db.query(checkQuery, [emailLower], (err, results) => { // Mengecek email yang sudah terdaftar dengan emailLower
    if (err) return res.json({ success: false, message: "Database error" })

    if (results.length > 0) {
      return res.json({ success: false, message: "Email sudah terdaftar" })
    }

    const insertQuery = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)"
    db.query(insertQuery, [name, emailLower, password], (err2) => { // Simpan email dalam format lowercase
      if (err2) return res.json({ success: false, message: "Gagal menyimpan user" })

      res.json({ success: true, message: "Pendaftaran berhasil" })
    })
  })
})

module.exports = router
