"use client"

import { Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { useData } from "../../context/DataContext"
import "./Admin.css"

function AdminDashboard() {
  const { currentUser } = useAuth()
  const { galleryItems, packages, faqItems, reviews } = useData()

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Dashboard Admin</h1>
        <p>Selamat datang, {currentUser?.name || "Admin"}</p>
      </div>

      <div className="admin-content">
        <div className="admin-menu">
          <div className="admin-menu-item">
            <Link to="/admin/gallery" className="admin-menu-link">
              <i className="fas fa-images"></i>
              <span>Kelola Galeri</span>
            </Link>
          </div>
          <div className="admin-menu-item">
            <Link to="/admin/pricelist" className="admin-menu-link">
              <i className="fas fa-tags"></i>
              <span>Kelola Paket Harga</span>
            </Link>
          </div>
          <div className="admin-menu-item">
            <Link to="/admin/faq" className="admin-menu-link">
              <i className="fas fa-question-circle"></i>
              <span>Kelola FAQ</span>
            </Link>
          </div>
          <div className="admin-menu-item">
            <Link to="/admin/review" className="admin-menu-link">
              <i className="fas fa-star"></i>
              <span>Kelola Review</span>
            </Link>
          </div>
          <div className="admin-menu-item">
            <Link to="/admin/about" className="admin-menu-link">
              <i className="fas fa-info-circle"></i>
              <span>Kelola Tentang Kami</span>
            </Link>
          </div>
        </div>

        <div className="admin-stats">
          <h2>Statistik Website</h2>
          <div className="stats-container">
            <div className="stat-item">
              <h3>Galeri</h3>
              <p className="stat-value">{galleryItems.length}</p>
              <p className="stat-label">Foto</p>
            </div>
            <div className="stat-item">
              <h3>Paket</h3>
              <p className="stat-value">{packages.length}</p>
              <p className="stat-label">Paket Aktif</p>
            </div>
            <div className="stat-item">
              <h3>FAQ</h3>
              <p className="stat-value">{faqItems.length}</p>
              <p className="stat-label">Pertanyaan</p>
            </div>
            <div className="stat-item">
              <h3>Review</h3>
              <p className="stat-value">{reviews.length}</p>
              <p className="stat-label">Ulasan</p>
            </div>
          </div>
        </div>

        <div className="admin-actions">
          <h2>Tindakan Cepat</h2>
          <div className="actions-container">
            <Link to="/" className="action-btn view-site">
              Lihat Website
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
