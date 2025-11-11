"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { useData } from "../../context/DataContext"
import "./AdminNew.css"

function AdminDashboardNew() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const { currentUser, logout } = useAuth()
  const { galleryItems, packages, faqItems, reviews } = useData()
  const navigate = useNavigate()

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <div className={`admin-layout ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
    {/* Sidebar */}
    <div className="admin-sidebar">
      <div className="sidebar-header">
        <Link to="/" className="sidebar-logo">
          <div className="logo-text">TARUMENYAN</div>
          <img src="/Icon_Gold.png" alt="Tarumenyan Logo" className="sidebar-logo-image" />
        </Link>
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          <i className={`fas fa-${isSidebarOpen ? "chevron-left" : "chevron-right"}`}></i>
        </button>
      </div>


        <div className="sidebar-content">
          <ul className="sidebar-menu">
            <li className="sidebar-item">
              <Link to="/admin" className="sidebar-link active">
                <i className="fas fa-tachometer-alt"></i>
                <span>Dashboard</span>
              </Link>
            </li>
            <li className="sidebar-item">
              <Link to="/admin/gallery" className="sidebar-link">
                <i className="fas fa-images"></i>
                <span>Galeri</span>
              </Link>
            </li>
            <li className="sidebar-item">
              <Link to="/admin/pricelist" className="sidebar-link">
                <i className="fas fa-tags"></i>
                <span>Daftar Harga</span>
              </Link>
            </li>
            <li className="sidebar-item">
              <Link to="/admin/review" className="sidebar-link">
                <i className="fas fa-star"></i>
                <span>Review</span>
              </Link>
            </li>
            <li className="sidebar-item">
              <Link to="/admin/faq" className="sidebar-link">
                <i className="fas fa-question-circle"></i>
                <span>FAQ</span>
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


      {/* Web View Sidebar Toggle Button */}
      <div className="web-sidebar-toggle" onClick={toggleSidebar}>
        <i className="fas fa-bars"></i>
      </div>

      {/* Main Content */}
      <div className="admin-main">
        <div className="admin-content">
          <div className="admin-dashboard">
            <div className="admin-welcome">
              <h1>Dashboard Admin</h1>
              <p>Selamat datang, {currentUser?.name || "Admin"}</p>
            </div>

            {/* Stats */}
            <div className="admin-stats">
              <h2>Statistik</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-images"></i>
                  </div>
                  <div className="stat-info">
                    <h3>{galleryItems?.length || 0}</h3>
                    <p>Foto di Galeri</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-tags"></i>
                  </div>
                  <div className="stat-info">
                    <h3>{packages?.length || 0}</h3>
                    <p>Paket Harga</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-question-circle"></i>
                  </div>
                  <div className="stat-info">
                    <h3>{faqItems?.length || 0}</h3>
                    <p>FAQ</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-star"></i>
                  </div>
                  <div className="stat-info">
                    <h3>{reviews?.length || 0}</h3>
                    <p>Review</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="admin-actions">
              <h2>Aksi Cepat</h2>
              <div className="actions-grid">
                <Link to="/admin/gallery" className="action-card">
                  <div className="action-icon">
                    <i className="fas fa-plus"></i>
                  </div>
                  <div className="action-info">
                    <h3>Tambah Foto</h3>
                    <p>Tambahkan foto baru ke galeri</p>
                  </div>
                </Link>

                <Link to="/admin/pricelist" className="action-card">
                  <div className="action-icon">
                    <i className="fas fa-edit"></i>
                  </div>
                  <div className="action-info">
                    <h3>Edit Paket</h3>
                    <p>Perbarui paket harga</p>
                  </div>
                </Link>

                <Link to="/admin/faq" className="action-card">
                  <div className="action-icon">
                    <i className="fas fa-plus-circle"></i>
                  </div>
                  <div className="action-info">
                    <h3>Tambah FAQ</h3>
                    <p>Tambahkan pertanyaan umum</p>
                  </div>
                </Link>

                <Link to="/admin/review" className="action-card">
                  <div className="action-icon">
                    <i className="fas fa-check"></i>
                  </div>
                  <div className="action-info">
                    <h3>Kelola Review</h3>
                    <p>Moderasi review pelanggan</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* View Website Link */}
            <div className="view-website">
              <Link to="/" className="view-website-link">
                <i className="fas fa-external-link-alt"></i>
                <span>Lihat Website</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboardNew