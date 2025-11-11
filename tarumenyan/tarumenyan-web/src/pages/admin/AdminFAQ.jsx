"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import { useData } from "../../context/DataContext"
import "./Admin.css"

function AdminFAQ() {
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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Start adding new FAQ
  const handleAddNew = () => {
    setIsAdding(true)
    setEditingItem(null)
    setFormData({
      id: "",
      question: "",
      answer: "",
    })
  }

  // Start editing FAQ
  const handleEdit = (item) => {
    setIsAdding(false)
    setEditingItem(item.id)
    setFormData({
      id: item.id,
      question: item.question,
      answer: item.answer,
    })
  }

  // Delete FAQ
  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus item ini?")) {
      try {
        await axios.delete(`http://localhost:3001/api/faq/${id}`)
        const updatedItems = items.filter((item) => item.id !== id)
        setItems(updatedItems)
        updateFaq(updatedItems)
      } catch (err) {
        console.error("Error saat menghapus FAQ:", err)
        console.error("Error response:", err.response?.data)
        alert(`Gagal menghapus FAQ: ${err.response?.data?.error || err.message}`)
      }
    }
  }

  // Save (add or update)
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.question.trim() || !formData.answer.trim()) {
      alert("Pertanyaan dan Jawaban harus diisi")
      return
    }

    try {
      if (isAdding) {
        // POST new FAQ
        const res = await axios.post("http://localhost:3001/api/faq", {
          question: formData.question,
          answer: formData.answer,
        })
        const updatedItems = [...items, res.data]
        setItems(updatedItems)
        updateFaq(updatedItems)
        setIsAdding(false)
      } else {
        // PUT update FAQ
        await axios.put(`http://localhost:3001/api/faq/${formData.id}`, {
          question: formData.question,
          answer: formData.answer,
        })
        const updatedItems = items.map((item) =>
          item.id === formData.id
            ? { ...item, question: formData.question, answer: formData.answer }
            : item
        )
        setItems(updatedItems)
        updateFaq(updatedItems)
        setEditingItem(null)
      }
      setFormData({ id: "", question: "", answer: "" })
      alert(isAdding ? "FAQ berhasil ditambahkan!" : "FAQ berhasil diperbarui!")
    } catch (err) {
      console.error("Error saat menyimpan FAQ:", err)
      console.error("Error response:", err.response?.data)
      alert(`Gagal menyimpan data FAQ: ${err.response?.data?.error || err.message}`)
    }
  }

  // Cancel editing/adding
  const handleCancel = () => {
    setIsAdding(false)
    setEditingItem(null)
    setFormData({ id: "", question: "", answer: "" })
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Kelola FAQ</h1>
        <div className="admin-actions">
          <button className="add-btn" onClick={handleAddNew}>
            Tambah FAQ Baru
          </button>
          <Link to="/admin" className="back-btn">
            Kembali ke Dashboard
          </Link>
        </div>
      </div>

      {(isAdding || editingItem) && (
        <div className="admin-form-container">
          <h2>{isAdding ? "Tambah FAQ Baru" : "Edit FAQ"}</h2>
          <form onSubmit={handleSubmit} className="admin-form">
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
        {loading && <p>Loading data FAQ...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {!loading && !error && (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Pertanyaan</th>
                <th>Jawaban (Ringkasan)</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.question}</td>
                  <td>{item.answer.length > 100 ? item.answer.substring(0, 100) + "..." : item.answer}</td>
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
        )}
      </div>
    </div>
  )
}

export default AdminFAQ
