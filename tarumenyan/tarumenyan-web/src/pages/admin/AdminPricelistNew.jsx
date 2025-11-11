"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { useData } from "../../context/DataContext"
import "./AdminNew.css"

function AdminPricelistNew() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const { logout } = useAuth()
  const navigate = useNavigate()
  const { updatePackages } = useData()
  
  const [items, setItems] = useState([])
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    price: "",
    description: "",
    features: [],
    popular: false,
  })
  const [featureInput, setFeatureInput] = useState("")
  const [isAdding, setIsAdding] = useState(false)

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  // Handle logout
  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  // Fetch packages data from backend
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/packages")
        const data = await res.json()
        setItems(data)
        updatePackages(data)
      } catch (err) {
        console.error("Gagal fetch packages:", err)
      }
    }
    fetchPackages()
  }, [updatePackages])

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  // Handle feature input
  const handleFeatureInputChange = (e) => {
    setFeatureInput(e.target.value)
  }

  // Add feature to list
  const addFeature = () => {
    if (featureInput.trim() !== "") {
      setFormData({
        ...formData,
        features: [...formData.features, featureInput.trim()],
      })
      setFeatureInput("")
    }
  }

  // Remove feature from list
  const removeFeature = (index) => {
    const updatedFeatures = [...formData.features]
    updatedFeatures.splice(index, 1)
    setFormData({
      ...formData,
      features: updatedFeatures,
    })
  }

  // Add new package
  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch("http://localhost:3001/api/packages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
      const newPackage = await res.json()
      const updatedItems = [...items, newPackage]
      setItems(updatedItems)
      updatePackages(updatedItems)
      setFormData({
        id: "",
        name: "",
        price: "",
        description: "",
        features: [],
        popular: false,
      })
      setIsAdding(false)
    } catch (err) {
      console.error("Gagal menambahkan paket:", err)
    }
  }

  // Edit package
  const handleEdit = (item) => {
    setEditingItem(item.id)
    setFormData({
      id: item.id,
      name: item.name,
      price: item.price,
      description: item.description,
      features: [...item.features],
      popular: item.popular,
    })
  }

  // Update package
  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      await fetch(`http://localhost:3001/api/packages/${formData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
      const updatedItems = items.map((item) =>
        item.id === formData.id ? { ...formData } : item
      )
      setItems(updatedItems)
      updatePackages(updatedItems)
      setEditingItem(null)
      setFormData({
        id: "",
        name: "",
        price: "",
        description: "",
        features: [],
        popular: false,
      })
    } catch (err) {
      console.error("Gagal memperbarui paket:", err)
    }
  }

  // Delete package
  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus paket ini?")) {
      try {
        await fetch(`http://localhost:3001/api/packages/${id}`, {
          method: "DELETE",
        })
        const updatedItems = items.filter((item) => item.id !== id)
        setItems(updatedItems)
        updatePackages(updatedItems)
      } catch (err) {
        console.error("Gagal menghapus paket:", err)
      }
    }
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
              <Link to="/admin" className="sidebar-link">
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
              <Link to="/admin/pricelist" className="sidebar-link active">
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
          <div className="admin-page">
            <div className="admin-welcome">
              <h1>Kelola Daftar Harga</h1>
              <p>Tambah, edit, atau hapus paket layanan</p>
            </div>

            <div className="admin-actions-top">
              <button className="add-btn" onClick={() => setIsAdding(!isAdding)}>
                {isAdding ? "Batal" : "Tambah Paket Baru"}
              </button>
              <label className="upload-btn">
                <i className="fas fa-file-upload"></i> Upload Pricelist PDF
                <input 
                  type="file" 
                  accept=".pdf" 
                  style={{ display: 'none' }} 
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const formData = new FormData();
                      formData.append('pricelist', file);
                      
                      fetch('http://localhost:3001/api/packages/upload-pdf', {
                        method: 'POST',
                        body: formData
                      })
                      .then(response => response.json())
                      .then(data => {
                        if (data.success) {
                          alert('Pricelist PDF berhasil diunggah!');
                        } else {
                          alert('Gagal mengunggah file: ' + data.error);
                        }
                      })
                      .catch(error => {
                        console.error('Error:', error);
                        alert('Terjadi kesalahan saat mengunggah file');
                      });
                    }
                  }}
                />
              </label>
            </div>

            {isAdding && (
              <div className="admin-form-container">
                <h2>Tambah Paket Baru</h2>
                <form onSubmit={handleAdd} className="admin-form">
                  <div className="form-group">
                    <label htmlFor="name">Nama Paket</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="price">Harga</label>
                    <input
                      type="text"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="description">Deskripsi</label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="3"
                      required
                    ></textarea>
                  </div>
                  <div className="form-group">
                    <label>Fitur</label>
                    <div className="feature-input-container">
                      <input
                        type="text"
                        value={featureInput}
                        onChange={handleFeatureInputChange}
                        placeholder="Tambahkan fitur"
                      />
                      <button
                        type="button"
                        className="add-feature-btn"
                        onClick={addFeature}
                      >
                        <i className="fas fa-plus"></i>
                      </button>
                    </div>
                    <div className="features-list">
                      {formData.features.map((feature, index) => (
                        <div key={index} className="feature-item">
                          <span>{feature}</span>
                          <button
                            type="button"
                            className="remove-feature-btn"
                            onClick={() => removeFeature(index)}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="form-group checkbox-group">
                    <label htmlFor="popular" className="checkbox-label">
                      <input
                        type="checkbox"
                        id="popular"
                        name="popular"
                        checked={formData.popular}
                        onChange={handleChange}
                      />
                      <span>Tandai sebagai paket populer</span>
                    </label>
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="save-btn">
                      Simpan
                    </button>
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={() => {
                        setIsAdding(false)
                        setFormData({
                          id: "",
                          name: "",
                          price: "",
                          description: "",
                          features: [],
                          popular: false,
                        })
                      }}
                    >
                      Batal
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="admin-items-container">
              {items.length === 0 ? (
                <div className="no-items">Belum ada paket yang ditambahkan</div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="admin-item">
                    {editingItem === item.id ? (
                      <form onSubmit={handleUpdate} className="admin-form">
                        <div className="form-group">
                          <label htmlFor="name">Nama Paket</label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="price">Harga</label>
                          <input
                            type="text"
                            id="price"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="description">Deskripsi</label>
                          <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="3"
                            required
                          ></textarea>
                        </div>
                        <div className="form-group">
                          <label>Fitur</label>
                          <div className="feature-input-container">
                            <input
                              type="text"
                              value={featureInput}
                              onChange={handleFeatureInputChange}
                              placeholder="Tambahkan fitur"
                            />
                            <button
                              type="button"
                              className="add-feature-btn"
                              onClick={addFeature}
                            >
                              <i className="fas fa-plus"></i>
                            </button>
                          </div>
                          <div className="features-list">
                            {formData.features.map((feature, index) => (
                              <div key={index} className="feature-item">
                                <span>{feature}</span>
                                <button
                                  type="button"
                                  className="remove-feature-btn"
                                  onClick={() => removeFeature(index)}
                                >
                                  <i className="fas fa-times"></i>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="form-group checkbox-group">
                          <label htmlFor="popular" className="checkbox-label">
                            <input
                              type="checkbox"
                              id="popular"
                              name="popular"
                              checked={formData.popular}
                              onChange={handleChange}
                            />
                            <span>Tandai sebagai paket populer</span>
                          </label>
                        </div>
                        <div className="form-actions">
                          <button type="submit" className="save-btn">
                            Perbarui
                          </button>
                          <button
                            type="button"
                            className="cancel-btn"
                            onClick={() => {
                              setEditingItem(null)
                              setFormData({
                                id: "",
                                name: "",
                                price: "",
                                description: "",
                                features: [],
                                popular: false,
                              })
                            }}
                          >
                            Batal
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="admin-item-content">
                        <div className="admin-item-info">
                          <div className="package-header">
                            <h3>{item.name}</h3>
                            {item.popular && <span className="popular-badge">Populer</span>}
                          </div>
                          <div className="package-price">{item.price}</div>
                          <p>{item.description}</p>
                          <ul className="package-features">
                            {item.features.map((feature, index) => (
                              <li key={index}>
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="admin-item-actions">
                          <button
                            className="edit-btn"
                            onClick={() => handleEdit(item)}
                          >
                            <i className="fas fa-edit"></i> Edit
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => handleDelete(item.id)}
                          >
                            <i className="fas fa-trash"></i> Hapus
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminPricelistNew