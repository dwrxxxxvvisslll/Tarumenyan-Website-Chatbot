"use client"

import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

// Komponen untuk melindungi rute admin
function ProtectedRoute({ children }) {
  const { currentUser, isAdmin, loading } = useAuth()

  // Tampilkan loading jika masih memuat status autentikasi
  if (loading) {
    return <div className="loading">Loading...</div>
  }

  // Redirect ke login jika tidak login atau bukan admin
  if (!currentUser || !isAdmin()) {
    return <Navigate to="/login" />
  }

  // Render children jika sudah login dan admin
  return children
}

export default ProtectedRoute
