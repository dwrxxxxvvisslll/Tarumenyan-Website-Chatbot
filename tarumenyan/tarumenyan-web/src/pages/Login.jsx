"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import "./Login.css"

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const { login, currentUser } = useAuth()
  const navigate = useNavigate()

  // Redirect jika sudah login
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === "admin") {
        navigate("/admin")
      } else {
        navigate("/")
      }
    }
  }, [currentUser, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError("")

    const result = login(formData.email, formData.password)
    if (!result.success) {
      setError(result.message)
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-image">
          <img src="/Logo Green.png" alt="Tarumenyan Logo" />
        </div>
        <div className="login-form-container">
          <div className="login-header">
            <h1>Login</h1>
            <p>Masuk ke akun Anda</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Username</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="submit-btn">
              Masuk
            </button>

            <div className="memo">
              <p>Note :</p>
              <p>
               Login hanya untuk <strong> Administrator Website</strong>
              </p>
              <p>
               Pelanggan tidak perlu login untuk menggunakan jasa kami
              </p>
            </div>
          </form>

  
          <div className="login-footer">
            <p>
              Belum punya akun?{" "}
              <Link to="/Register" className="toggle-btn">
                Daftar
              </Link>
            </p>
          </div>


        </div>
      </div>
    </div>
  )
}

export default Login
