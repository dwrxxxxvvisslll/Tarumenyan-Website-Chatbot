"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import "./Login.css";

function Register() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const [error, setError] = useState("")

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      return setError("Password dan konfirmasi tidak cocok.")
    }

    try {
  const res = await axios.post("http://localhost:3001/api/register", formData)
  console.log(res.data)

  if (res.data.success) {
    navigate("/login") // redirect ke login page setelah berhasil daftar
  } else {
    // Tampilkan pesan error yang diterima dari backend
    setError(res.data.message)
  }
} catch (err) {
  console.error(err)
  // Menangani error lain selain response dari backend
  setError(err.response?.data?.message || "Gagal mendaftar.")
}

  }

  
  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-form-container">
          <h1 className="register-title">Daftar</h1>
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="name">Nama</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label htmlFor="email">Username</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Konfirmasi Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="submit-btn">
              Daftar
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Register
