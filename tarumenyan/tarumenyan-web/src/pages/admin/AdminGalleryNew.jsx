"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import { useAuth } from "../../context/AuthContext"
import "./AdminNew.css"

function AdminGalleryNew() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const { logout } = useAuth()
  const navigate = useNavigate()
  
  const [items, setItems] = useState([])
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    category: "wedding",
    image: ""
  })
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState("")
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

  // Fetch gallery items from backend
  const fetchGallery = async () => {
    try {
      const response = await axios.get("http://localhost:3001/api/gallery")
      setItems(response.data)
    } catch (error) {
      console.error("Gagal mengambil data galeri:", error)
    }
  }

  // Load data on component mount
  useEffect(() => {
    fetchGallery()
  }, [])

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  // Handle file input changes
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      // Buat URL preview untuk file yang dipilih
      const fileUrl = URL.createObjectURL(file)
      setPreviewUrl(fileUrl)
    }
  }

  // Add new gallery item
  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      // Buat FormData untuk mengirim file
      const formDataToSend = new FormData()
      formDataToSend.append("title", formData.title)
      formDataToSend.append("category", formData.category)
      
      // Tambahkan file jika ada
      if (selectedFile) {
        formDataToSend.append("image", selectedFile)
      }

      await axios.post("http://localhost:3001/api/gallery", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      
      setFormData({
        id: "",
        title: "",
        category: "wedding",
        image: ""
      })
      setSelectedFile(null)
      setPreviewUrl("")
      setIsAdding(false)
      fetchGallery()
    } catch (error) {
      console.error("Gagal menambahkan item galeri:", error)
    }
  }

  // Edit gallery item
  const handleEdit = (item) => {
    setEditingItem(item.id)
    setFormData({
      id: item.id,
      title: item.title,
      category: item.category,
      image: item.image
    })
    
    // Set preview URL jika ada gambar
    if (item.image) {
      const imageUrl = item.image.startsWith('http') ? item.image : `http://localhost:3001${item.image}`
      setPreviewUrl(imageUrl)
    } else {
      setPreviewUrl("")
    }
    
    setSelectedFile(null)
  }

  // Update gallery item
  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      // Buat FormData untuk mengirim file
      const formDataToSend = new FormData()
      formDataToSend.append("title", formData.title)
      formDataToSend.append("category", formData.category)
      
      // Tambahkan file jika ada
      if (selectedFile) {
        formDataToSend.append("image", selectedFile)
      } else if (formData.image && !selectedFile) {
        // Jika tidak ada file baru yang dipilih tapi ada image URL yang sudah ada (saat edit)
        formDataToSend.append("image", formData.image)
      }

      await axios.put(`http://localhost:3001/api/gallery/${formData.id}`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      
      setEditingItem(null)
      setFormData({
        id: "",
        title: "",
        category: "wedding",
        image: ""
      })
      setSelectedFile(null)
      setPreviewUrl("")
      fetchGallery()
    } catch (error) {
      console.error("Gagal memperbarui item galeri:", error)
    }
  }

  // Delete gallery item
  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus item ini?")) {
      try {
        await axios.delete(`http://localhost:3001/api/gallery/${id}`)
        fetchGallery()
      } catch (error) {
        console.error("Gagal menghapus item galeri:", error)
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
              <Link to="/admin/gallery" className="sidebar-link active">
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
          <div className="admin-page">
            <div className="admin-welcome">
              <h1>Kelola Galeri</h1>
              <p>Tambah, edit, atau hapus foto di galeri</p>
            </div>

            <div className="admin-actions-top">
              <button className="add-btn" onClick={() => setIsAdding(!isAdding)}>
                {isAdding ? "Batal" : "Tambah Foto Baru"}
              </button>
            </div>

            {isAdding && (
              <div className="admin-form-container">
                <h2>Tambah Foto Baru</h2>
                <form onSubmit={handleAdd} className="admin-form">
                  <div className="form-group">
                    <label htmlFor="title">Judul</label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="category">Kategori</label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                    >
                      <option value="wedding">Wedding</option>
                      <option value="prewedding">Pre-wedding</option>
                      <option value="lainnya">Lainnya</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="image">Upload Gambar</label>
                    <input
                      type="file"
                      id="image"
                      name="image"
                      onChange={handleFileChange}
                      accept=".png,.jpg,.jpeg"
                      className="file-input"
                    />
                    <p className="form-help">
                      Hanya file PNG, JPG, atau JPEG yang diperbolehkan
                    </p>
                  </div>

                  <div className="form-preview">
                    <h3>Preview</h3>
                    <div className="image-preview">
                      {previewUrl ? (
                        <img src={previewUrl} alt="Preview" />
                      ) : (
                        <img 
                          src={formData.image ? (formData.image.startsWith('http') ? formData.image : `http://localhost:3001${formData.image}`) : null} 
                          alt="Preview" 
                          onError={(e) => {
                            console.error("Error loading image:", formData.image);
                            e.target.src = "/placeholder.svg";
                          }}
                        />
                      )}
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="save-btn">Simpan</button>
                    <button type="button" className="cancel-btn" onClick={() => setIsAdding(false)}>Batal</button>
                  </div>
                </form>
              </div>
            )}

            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Judul</th>
                    <th>Kategori</th>
                    <th>Gambar</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        {editingItem === item.id ? (
                          <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                          />
                        ) : (
                          item.title
                        )}
                      </td>
                      <td>
                        {editingItem === item.id ? (
                          <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                          >
                            <option value="wedding">Wedding</option>
                            <option value="prewedding">Pre-wedding</option>
                            <option value="family">Family</option>
                            <option value="graduation">Graduation</option>
                            <option value="other">Other</option>
                          </select>
                        ) : (
                          item.category
                        )}
                      </td>
                      <td>
                        {editingItem === item.id ? (
                          <div className="form-group">
                            <input
                              type="file"
                              name="image"
                              onChange={handleFileChange}
                              accept=".png,.jpg,.jpeg"
                              className="file-input"
                            />
                            <div className="image-preview">
                              {previewUrl ? (
                                <img src={previewUrl} alt="Preview" />
                              ) : (
                                <img 
                                  src={formData.image ? (formData.image.startsWith('http') ? formData.image : `http://localhost:3001${formData.image}`) : null} 
                                  alt="Preview" 
                                  onError={(e) => {
                                    console.error("Error loading image:", formData.image);
                                    e.target.src = "/placeholder.svg";
                                  }}
                                />
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="admin-table-image">
                            <img
                              src={item.image ? `http://localhost:3001${item.image}` : "/placeholder.svg?height=50&width=50"}
                              alt={item.title}
                              onError={(e) => {
                                console.error("Error loading image:", item.image);
                                e.target.src = "/placeholder.svg";
                              }}
                            />
                          </div>
                        )}
                      </td>
                      <td>
                        {editingItem === item.id ? (
                          <div className="table-actions">
                            <button className="save-btn" onClick={handleUpdate}>
                              Simpan
                            </button>
                            <button
                              className="cancel-btn"
                              onClick={() => {
                                setEditingItem(null)
                                setFormData({
                                  id: "",
                                  title: "",
                                  category: "wedding",
                                  image: ""
                                })
                                setSelectedFile(null)
                                setPreviewUrl("")
                              }}
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <div className="table-actions">
                            <button className="edit-btn" onClick={() => handleEdit(item)}>
                              <i className="fas fa-edit"></i>
                            </button>
                            <button className="delete-btn" onClick={() => handleDelete(item.id)}>
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminGalleryNew