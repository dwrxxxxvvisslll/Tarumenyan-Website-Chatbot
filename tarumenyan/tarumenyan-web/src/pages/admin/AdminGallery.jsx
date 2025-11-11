"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import "./Admin.css"

function AdminGallery() {
  const [items, setItems] = useState([])
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    category: "wedding",
    image: "",
  })
  const [isAdding, setIsAdding] = useState(false)

  // Fetch gallery items from backend
  const fetchGallery = async () => {
    try {
      const response = await axios.get("http://localhost:3001/api/gallery")
      setItems(response.data)
    } catch (error) {
      console.error("Gagal mengambil data galeri:", error)
    }
  }

  useEffect(() => {
    fetchGallery()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleAddNew = () => {
    setIsAdding(true)
    setEditingItem(null)
    setFormData({
      id: "", // ID akan di-generate oleh database
      title: "",
      category: "wedding",
      image: "",
    })
  }

  const handleEdit = (item) => {
    setIsAdding(false)
    setEditingItem(item.id)
    setFormData({
      id: item.id,
      title: item.title,
      category: item.category,
      image: item.image,
    })
  }

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus item ini?")) {
      try {
        await axios.delete(`http://localhost:3001/api/gallery/${id}`)
        fetchGallery()
      } catch (error) {
        console.error("Gagal menghapus item:", error)
      }
    }
  }

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Buat URL preview untuk file yang dipilih
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      // Buat FormData untuk mengirim file
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("category", formData.category);
      
      // Tambahkan file jika ada
      if (selectedFile) {
        formDataToSend.append("image", selectedFile);
      } else if (formData.image && !isAdding) {
        // Jika tidak ada file baru yang dipilih tapi ada image URL yang sudah ada (saat edit)
        formDataToSend.append("image", formData.image);
      }

      if (isAdding) {
        await axios.post("http://localhost:3001/api/gallery", formDataToSend);
      } else {
        await axios.put(`http://localhost:3001/api/gallery/${editingItem}`, formDataToSend);
      }

      fetchGallery()
      setIsAdding(false)
      setEditingItem(null)
      resetForm()
      setSelectedFile(null);
      setPreviewUrl("");
    } catch (error) {
      console.error("Gagal menyimpan data:", error)
    }
  }

  const handleCancel = () => {
    setIsAdding(false)
    setEditingItem(null)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      id: "",
      title: "",
      category: "wedding",
      image: "",
    })
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Kelola Galeri</h1>
        <div className="admin-actions">
          <button className="add-btn" onClick={handleAddNew}>
            Tambah Foto Baru
          </button>
          <Link to="/admin" className="back-btn">
            Kembali ke Dashboard
          </Link>
        </div>
      </div>

      {(isAdding || editingItem) && (
        <div className="admin-form-container">
          <h2>{isAdding ? "Tambah Foto Baru" : "Edit Foto"}</h2>
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-group">
              <label htmlFor="title">Judul Foto</label>
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

            <div className="form-buttons">
              <button type="submit" className="save-btn">
                {isAdding ? "Tambahkan" : "Simpan Perubahan"}
              </button>
              <button type="button" className="cancel-btn" onClick={handleCancel}>
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Gambar</th>
              <th>Judul</th>
              <th>Kategori</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>
                  <img
                    src={item.image ? `http://localhost:3001${item.image}` : null}
                    alt={item.title}
                    className="table-image"
                    onError={(e) => {
                      console.error("Error loading image:", item.image);
                      e.target.src = "/placeholder.svg";
                    }}
                  />
                </td>
                <td>{item.title}</td>
                <td>
                  {item.category === "wedding"
                    ? "Wedding"
                    : item.category === "prewedding"
                    ? "Pre-wedding"
                    : "Lainnya"}
                </td>
                <td>
                  <button className="edit-btn" onClick={() => handleEdit(item)}>
                    Edit
                  </button>
                  <button className="delete-btn" onClick={() => handleDelete(item.id)}>
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminGallery
