"use client"

import { createContext, useState, useEffect, useContext } from "react"
import axios from "axios"

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem("tarumenyanUser")
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  // Fungsi login
  const login = async (email, password) => {
    try {
      const res = await axios.post("http://localhost:3001/api/login", { email, password })

      if (res.data.success) {
        const user = res.data.user
        localStorage.setItem("tarumenyanUser", JSON.stringify(user))
        setCurrentUser(user)
        return { success: true }
      } else {
        return { success: false, message: res.data.message || "Gagal login" }
      }
    } catch (err) {
      console.error("Login error:", err)
      return { success: false, message: "Terjadi kesalahan saat login" }
    }
  }

  const logout = () => {
    localStorage.removeItem("tarumenyanUser")
    setCurrentUser(null)
  }

  const isAdmin = () => {
    return currentUser?.role === "admin"
  }

  const value = {
    currentUser,
    login,
    logout,
    isAdmin,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  return useContext(AuthContext)
}
