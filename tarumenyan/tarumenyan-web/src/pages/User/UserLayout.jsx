"use client"

import { useState } from "react"
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import "./User.css"

function UserLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const isActive = (path) => {
    return location.pathname === path
  }

  const handleLogout = () => {
    // Implementasi logout akan ditambahkan nanti
    alert("Logout berhasil")
    navigate("/Login")
  }

  return (
    <div className={`user-layout ${isSidebarOpen ? "" : "sidebar-collapsed"}`}>
      <div className="user-sidebar">
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
              <Link to="/user" className={`sidebar-link ${isActive("/user") ? "active" : ""}`}>
                <i className="fas fa-tachometer-alt"></i>
                <span>Dashboard</span>
              </Link>
            </li>
            <li className="sidebar-item">
              <Link to="/user/profile" className={`sidebar-link ${isActive("/user/profile") ? "active" : ""}`}>
                <i className="fas fa-user"></i>
                <span>Profil Saya</span>
              </Link>
            </li>
            <li className="sidebar-item">
              <Link to="/gallery" className="sidebar-link">
                <i className="fas fa-images"></i>
                <span>Galeri</span>
              </Link>
            </li>
            <li className="sidebar-item">
              <Link to="/pricelist" className="sidebar-link">
                <i className="fas fa-tags"></i>
                <span>Daftar Harga</span>
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

      <div className="user-main">
        <div className="user-header">
          <div className="header-welcome">
            <h2>
              Selamat datang, <span className="user-name">John Doe</span>
            </h2>
          </div>
          <div className="header-actions">
            <div className="notification-icon">
              <i className="fas fa-bell"></i>
              <span className="badge">2</span>
            </div>
            <div className="user-profile">
              <img src="/placeholder.svg?height=40&width=40" alt="User" />
              <span>John Doe</span>
            </div>
          </div>
        </div>

        <div className="user-content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default UserLayout
