"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { useData } from "../../context/DataContext"
import "./Admin.css"

function AdminAbout() {
  const { aboutInfo, updateAbout } = useData()
  const [formData, setFormData] = useState({ ...aboutInfo })

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  // Save changes
  const handleSubmit = (e) => {
    e.preventDefault()
    updateAbout(formData)
    alert("Informasi Tentang Kami berhasil diperbarui!")
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Kelola Tentang Kami</h1>
        <div className="admin-actions">
          <Link to="/admin" className="back-btn">
            Kembali ke Dashboard
          </Link>
        </div>
      </div>

      <div className="admin-form-container">
        <h2>Edit Informasi Tentang Kami</h2>
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label htmlFor="story">Cerita Kami</label>
            <textarea
              id="story"
              name="story"
              value={formData.story}
              onChange={handleChange}
              rows="5"
              required
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="vision">Visi</label>
            <textarea
              id="vision"
              name="vision"
              value={formData.vision}
              onChange={handleChange}
              rows="3"
              required
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="mission">Misi</label>
            <textarea
              id="mission"
              name="mission"
              value={formData.mission}
              onChange={handleChange}
              rows="3"
              required
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="values">Nilai-nilai</label>
            <textarea
              id="values"
              name="values"
              value={formData.values}
              onChange={handleChange}
              rows="3"
              required
            ></textarea>
          </div>

          <h3 className="form-section-title">Informasi Kontak</h3>

          <div className="form-group">
            <label htmlFor="address">Alamat</label>
            <input type="text" id="address" name="address" value={formData.address} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="hours">Jam Operasional</label>
            <textarea
              id="hours"
              name="hours"
              value={formData.hours}
              onChange={handleChange}
              rows="2"
              required
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="phone">Telepon</label>
            <input type="text" id="phone" name="phone" value={formData.phone} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>

          <div className="form-buttons">
            <button type="submit" className="save-btn">
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminAbout
