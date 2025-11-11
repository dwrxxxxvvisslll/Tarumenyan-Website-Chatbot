"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import "./User.css"

function Dashboard() {
  const [featuredPackages, setFeaturedPackages] = useState([
    {
      id: 1,
      name: "Paket Pernikahan Basic",
      price: "Rp 5.000.000",
      description: "Paket fotografi pernikahan dasar untuk acara sederhana",
      features: ["8 jam liputan", "1 fotografer utama", "1 asisten fotografer", "Minimal 300 foto hasil edit"],
    },
    {
      id: 2,
      name: "Paket Pre-wedding",
      price: "Rp 3.500.000",
      description: "Sesi foto pre-wedding di lokasi pilihan Anda",
      features: ["6 jam sesi foto", "1 fotografer utama", "1 asisten fotografer", "2 lokasi"],
    },
  ])

  const [recentPhotos, setRecentPhotos] = useState([
    { id: 1, image: "/placeholder.svg?height=300&width=400", title: "Pernikahan Budi & Sari" },
    { id: 2, image: "/placeholder.svg?height=300&width=400", title: "Pre-wedding Andi & Maya" },
    { id: 3, image: "/placeholder.svg?height=300&width=400", title: "Potret Keluarga Santoso" },
    { id: 4, image: "/placeholder.svg?height=300&width=400", title: "Pernikahan Deni & Lina" },
    { id: 5, image: "/placeholder.svg?height=300&width=400", title: "Pre-wedding Rudi & Ani" },
    { id: 6, image: "/placeholder.svg?height=300&width=400", title: "Potret Bisnis PT Maju Jaya" },
  ])

  const handleWhatsAppOrder = (packageName) => {
    // Nomor WhatsApp Tarumenyan (ganti dengan nomor yang sebenarnya)
    const phoneNumber = "085792862780"
    const message = `Halo, saya tertarik dengan ${packageName} dan ingin mendapatkan informasi lebih lanjut.`

    // Buat URL WhatsApp dengan nomor dan pesan
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`

    // Buka WhatsApp di tab baru
    window.open(whatsappUrl, "_blank")
  }

  return (
    <div className="user-dashboard">
      <div className="welcome-card">
        <h2>Selamat Datang di Tarumenyan</h2>
        <p>Temukan paket fotografi yang sesuai dengan kebutuhan Anda dan abadikan momen berharga dalam hidup Anda.</p>
        <Link to="/pricelist" className="btn-white">
          Lihat Semua Paket
        </Link>
        <div className="decoration">
          <i className="fas fa-camera"></i>
        </div>
      </div>

      <div className="user-content-row">
        <div className="user-content-col">
          <div className="user-card">
            <div className="user-card-header">
              <h2>Paket Populer</h2>
              <Link to="/pricelist" className="view-all">
                Lihat Semua
              </Link>
            </div>
            <div className="user-card-body">
              <div className="package-list">
                {featuredPackages.map((pkg) => (
                  <div key={pkg.id} className="package-item">
                    <h3 className="package-name">{pkg.name}</h3>
                    <div className="package-price">{pkg.price}</div>
                    <p className="package-description">{pkg.description}</p>
                    <ul className="package-features">
                      {pkg.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                    <button className="btn-whatsapp" onClick={() => handleWhatsAppOrder(pkg.name)}>
                      <i className="fab fa-whatsapp"></i> Pesan via WhatsApp
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="user-content-row">
        <div className="user-content-col">
          <div className="user-card">
            <div className="user-card-header">
              <h2>Galeri Terbaru</h2>
              <Link to="/gallery" className="view-all">
                Lihat Semua
              </Link>
            </div>
            <div className="user-card-body">
              <div className="gallery-preview">
                {recentPhotos.map((photo) => (
                  <div key={photo.id} className="gallery-preview-item">
                    <img src={photo.image || "/placeholder.svg"} alt={photo.title} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
