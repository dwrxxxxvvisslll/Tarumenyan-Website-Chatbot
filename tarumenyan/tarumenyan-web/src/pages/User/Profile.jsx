"use client"

import { useState } from "react"
import "./User.css"

function Profile() {
  const [profile, setProfile] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "johndoe@example.com",
    phone: "081234567890",
    address: "Jl. Contoh No. 123, Jakarta",
    city: "Jakarta",
    province: "DKI Jakarta",
    postalCode: "12345",
    bio: "Saya sangat menyukai fotografi dan seni. Saya ingin mengabadikan momen-momen penting dalam hidup saya dengan kualitas terbaik.",
    avatar: "/placeholder.svg?height=200&width=200",
  })

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({ ...profile })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setProfile({ ...formData })
    setIsEditing(false)
    alert("Profil berhasil diperbarui!")
  }

  const handleCancel = () => {
    setFormData({ ...profile })
    setIsEditing(false)
  }

  return (
    <div className="user-page">
      <div className="profile-header">
        <div className="profile-avatar">
          <img src={profile.avatar || "/placeholder.svg"} alt={`${profile.firstName} ${profile.lastName}`} />
        </div>
        <div className="profile-info">
          <h1>{`${profile.firstName} ${profile.lastName}`}</h1>
          <p>{profile.email}</p>
        </div>
      </div>

      <div className="profile-form">
        <h2>{isEditing ? "Edit Profil" : "Informasi Profil"}</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">Nama Depan</label>
              {isEditing ? (
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              ) : (
                <p>{profile.firstName}</p>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Nama Belakang</label>
              {isEditing ? (
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              ) : (
                <p>{profile.lastName}</p>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              {isEditing ? (
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              ) : (
                <p>{profile.email}</p>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="phone">Nomor Telepon</label>
              {isEditing ? (
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              ) : (
                <p>{profile.phone}</p>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="address">Alamat</label>
            {isEditing ? (
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
              />
            ) : (
              <p>{profile.address}</p>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city">Kota</label>
              {isEditing ? (
                <input type="text" id="city" name="city" value={formData.city} onChange={handleInputChange} required />
              ) : (
                <p>{profile.city}</p>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="province">Provinsi</label>
              {isEditing ? (
                <input
                  type="text"
                  id="province"
                  name="province"
                  value={formData.province}
                  onChange={handleInputChange}
                  required
                />
              ) : (
                <p>{profile.province}</p>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="postalCode">Kode Pos</label>
              {isEditing ? (
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  required
                />
              ) : (
                <p>{profile.postalCode}</p>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            {isEditing ? (
              <textarea id="bio" name="bio" value={formData.bio} onChange={handleInputChange} rows="4"></textarea>
            ) : (
              <p>{profile.bio}</p>
            )}
          </div>

          <div className="form-buttons">
            {isEditing ? (
              <>
                <button type="submit" className="btn-primary">
                  Simpan Perubahan
                </button>
                <button type="button" className="btn-outline" onClick={handleCancel}>
                  Batal
                </button>
              </>
            ) : (
              <button type="button" className="btn-primary" onClick={() => setIsEditing(true)}>
                Edit Profil
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default Profile
