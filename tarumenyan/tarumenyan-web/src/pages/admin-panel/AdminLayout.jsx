"use client"

import { useState } from "react"
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import "./Admin.css"
import { useAuth } from "../../context/AuthContext"

function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const isActive = (path) => {
    return location.pathname === path
  }

  const handleLogout = () => {
    // Implementasi logout akan ditambahkan nanti
    logout() 
    alert("Logout berhasil")
    navigate("/login")
  }

  return (
    <div className={`admin-layout ${isSidebarOpen ? "" : "sidebar-collapsed"}`}>
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <Link to="/" className="sidebar-logo">
            TARUMENYAN
          </Link>
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            <i className={`fas fa-${isSidebarOpen ? "chevron-left" : "chevron-right"}`}></i>
          </button>
        </div>

        <div className="sidebar-content">
          <ul className="sidebar-menu">
            <li className="sidebar-item">
              <Link to="/admin" className={`sidebar-link ${isActive("/admin") ? "active" : ""}`}>
                <i className="fas fa-tachometer-alt"></i>
                <span>Dashboard</span>
              </Link>
            </li>
            <li className="sidebar-item">
              <Link to="/admin/gallery" className={`sidebar-link ${isActive("/admin/gallery") ? "active" : ""}`}>
                <i className="fas fa-images"></i>
                <span>Galeri</span>
              </Link>
            </li>
            <li className="sidebar-item">
              <Link to="/admin/pricelist" className={`sidebar-link ${isActive("/admin/pricelist") ? "active" : ""}`}>
                <i className="fas fa-tags"></i>
                <span>Daftar Harga</span>
              </Link>
            </li>
            <li className="sidebar-item">
              <Link to="/admin/review" className={`sidebar-link ${isActive("/admin/review") ? "active" : ""}`}>
                <i className="fas fa-star"></i>
                <span>Review</span>
              </Link>
            </li>
            <li className="sidebar-item">
              <Link to="/admin/faq" className={`sidebar-link ${isActive("/admin/faq") ? "active" : ""}`}>
                <i className="fas fa-question-circle"></i>
                <span>FAQ</span>
              </Link>
            </li>
            <li className="sidebar-item">
              <Link to="/admin/about" className={`sidebar-link ${isActive("/admin/about") ? "active" : ""}`}>
                <i className="fas fa-info-circle"></i>
                <span>Tentang Kami</span>
              </Link>
            </li>
          </ul>
        </div>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div className="admin-main">
        <div className="admin-header">
          <div className="header-actions">
            <div className="notification-icon">
              <i className="fas fa-bell"></i>
              <span className="badge">3</span>
            </div>
            <div className="admin-profile">
              <img src="/placeholder.svg?height=40&width=40" alt="Admin" />
              <span>Admin</span>
            </div>
          </div>
        </div>

        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default AdminLayout
