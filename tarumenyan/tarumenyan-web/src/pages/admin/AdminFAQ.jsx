"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import { useAuth } from "../../context/AuthContext"
import { useData } from "../../context/DataContext"
import "./AdminNew.css"

function AdminFAQNew() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const { logout } = useAuth()
  const navigate = useNavigate()
  const { faqItems, updateFaq } = useData()
  
  const [items, setItems] = useState([...faqItems])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    id: "",
    question: "",
    answer: "",
  })
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

  // Fetch FAQ data from backend
  useEffect(() => {
    fetchFaq()
  }, [])

  const fetchFaq = async () => {
    try {
      setLoading(true)
      const res = await axios.get("http://localhost:3001/api/faq")
      setItems(res.data)
      updateFaq(res.data)
      setLoading(false)
    } catch (err) {
      console.error("Error saat mengambil data FAQ:", err)
      console.error("Error response:", err.response?.data)
      setError(`Gagal memuat data FAQ: ${err.response?.data?.error || err.message}`)
      setLoading(false)
    }
  }

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  // Add new FAQ item
  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post("http://localhost:3001/api/faq", formData)
      setItems([...items, res.data])
      updateFaq([...items, res.data])
      setFormData({
        id: "",
        question: "",
        answer: "",
      })
      setIsAdding(false)
    } catch (err) {
      console.error("Gagal menambahkan FAQ:", err)
      alert(`Gagal menambahkan FAQ: ${err.response?.data?.error || err.message}`)
    }
  }

  // Edit FAQ item
  const handleEdit = (item) => {
    setEditingItem(item.id)
    setFormData({
      id: item.id,
      question: item.question,
      answer: item.answer,
    })
  }

  // Update FAQ item
  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      await axios.put(`http://localhost:3001/api/faq/${formData.id}`, formData)
      const updatedItems = items.map((item) =>
        item.id === formData.id ? { ...formData } : item
      )
      setItems(updatedItems)
      updateFaq(updatedItems)
      setEditingItem(null)
      setFormData({
        id: "",
        question: "",
        answer: "",
      })
    } catch (err) {
      console.error("Gagal memperbarui FAQ:", err)
      alert(`Gagal memperbarui FAQ: ${err.response?.data?.error || err.message}`)
    }
  }

  // Delete FAQ item
  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus FAQ ini?")) {
      try {
        await axios.delete(`http://localhost:3001/api/faq/${id}`)
        const updatedItems = items.filter((item) => item.id !== id)
        setItems(updatedItems)
        updateFaq(updatedItems)
      } catch (err) {
        console.error("Gagal menghapus FAQ:", err)
        alert(`Gagal menghapus FAQ: ${err.response?.data?.error || err.message}`)
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
              <Link to="/admin/faq" className="sidebar-link active">
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
              <h1>Kelola FAQ</h1>
              <p>Tambah, edit, atau hapus pertanyaan yang sering ditanyakan</p>
            </div>

            <div className="admin-actions-top">
              <button className="add-btn" onClick={() => setIsAdding(!isAdding)}>
                {isAdding ? "Batal" : "Tambah FAQ Baru"}
              </button>
            </div>

            {isAdding && (
              <div className="admin-form-container">
                <h2>Tambah FAQ Baru</h2>
                <form onSubmit={handleAdd} className="admin-form">
                  <div className="form-group">
                    <label htmlFor="question">Pertanyaan</label>
                    <input
                      type="text"
                      id="question"
                      name="question"
                      value={formData.question}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="answer">Jawaban</label>
                    <textarea
                      id="answer"
                      name="answer"
                      value={formData.answer}
                      onChange={handleChange}
                      rows="5"
                      required
                    ></textarea>
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
                          question: "",
                          answer: "",
                        })
                      }}
                    >
                      Batal
                    </button>
                  </div>
                </form>
              </div>
            )}

            {loading ? (
              <div className="loading">Memuat data...</div>
            ) : error ? (
              <div className="error">{error}</div>
            ) : (
              <div className="admin-items-container">
                {items.length === 0 ? (
                  <div className="no-items">Belum ada FAQ yang ditambahkan</div>
                ) : (
                  items.map((item) => (
                    <div key={item.id} className="admin-item">
                      {editingItem === item.id ? (
                        <form onSubmit={handleUpdate} className="admin-form">
                          <div className="form-group">
                            <label htmlFor="question">Pertanyaan</label>
                            <input
                              type="text"
                              id="question"
                              name="question"
                              value={formData.question}
                              onChange={handleChange}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label htmlFor="answer">Jawaban</label>
                            <textarea
                              id="answer"
                              name="answer"
                              value={formData.answer}
                              onChange={handleChange}
                              rows="5"
                              required
                            ></textarea>
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
                                  question: "",
                                  answer: "",
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
                            <h3>{item.question}</h3>
                            <p>{item.answer}</p>
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
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminFAQNew