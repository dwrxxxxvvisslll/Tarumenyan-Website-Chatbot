const express = require("express")
const router = express.Router()
const supabase = require("../db")
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

  try {
    // Check if email already exists
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("*")
      .eq("username", emailLower)
      .single()

    if (existingUser) {
      return res.status(409).json({ success: false, message: "Email sudah terdaftar" })
    }

    // Hash password dengan bcrypt (salt rounds = 10)
    const hashedPassword = await bcrypt.hash(password, 10)

    // Insert new user
    const { data, error: insertError } = await supabase
      .from("users")
      .insert([
        {
          username: emailLower,
          password: hashedPassword,
          role: "user"
        }
      ])
      .select()

    if (insertError) {
      console.error("Insert error:", insertError)
      return res.status(500).json({ success: false, message: "Gagal menyimpan user" })
    }

    res.status(201).json({ success: true, message: "Pendaftaran berhasil" })
  } catch (error) {
    console.error("Registration error:", error)
    return res.status(500).json({ success: false, message: "Server error" })
  }
})

module.exports = router
