"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useData } from "../../context/DataContext"
import "./Admin.css"

function AdminPricelist() {
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

  // Ambil data awal dari backend
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleFeatureInputChange = (e) => {
    setFeatureInput(e.target.value)
  }

  const handleAddFeature = () => {
    if (featureInput.trim() !== "") {
      setFormData((f) => ({
        ...f,
        features: [...f.features, featureInput.trim()],
      }))
      setFeatureInput("")
    }
  }

  const handleRemoveFeature = (index) => {
    setFormData((f) => ({
      ...f,
      features: f.features.filter((_, i) => i !== index),
    }))
  }

  const handleAddNew = () => {
    console.log("🆕 Masuk mode tambah paket");
    setIsAdding(true)
    setEditingItem(null)
    resetForm()
  }

  const handleEdit = (item) => {
    setIsAdding(false)
    setEditingItem(item.id)
    setFormData({
      id: item.id,
      name: item.name,
      price: item.price,
      description: item.description,
      features: [...item.features],
      popular: item.popular,
    })
    setFeatureInput("")
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus paket ini?")) return
    try {
      await fetch(`http://localhost:3001/api/packages/${id}`, {
        method: "DELETE",
      })
      const updated = items.filter((it) => it.id !== id)
      setItems(updated)
      updatePackages(updated)
    } catch (err) {
      console.error("Gagal hapus paket:", err)
    }
  }

  const handleSubmit = async (e) => {
  e.preventDefault();

  // ⬇️ Tambahin log payload di sini
  console.log("🔥 Payload dikirim ke backend:", formData);

  const url = isAdding
    ? "http://localhost:3001/api/packages"
    : `http://localhost:3001/api/packages/${formData.id}`;
  const method = isAdding ? "POST" : "PUT";

  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    // ⬇️ Tambahin log status & body response di sini
    console.log("🛬 Response status:", res.status);
    const data = await res.json();
    console.log("🛬 Response body:", data);
    let updated;
    if (isAdding) {
      updated = [...items, { ...formData, id: data.id }];
    } else {
      updated = items.map((it) =>
        it.id === editingItem ? formData : it
      );
    }
    setItems(updated);
    updatePackages(updated);
    resetForm();
    setIsAdding(false);
    setEditingItem(null);
  } catch (err) {
    console.error("Gagal submit paket:", err);
  }
};


  const handleCancel = () => {
    setIsAdding(false)
    setEditingItem(null)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      id: "",
      name: "",
      price: "",
      description: "",
      features: [],
      popular: false,
    })
    setFeatureInput("")
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Kelola Paket Harga</h1>
        <div className="admin-actions">
          <button className="add-btn" onClick={handleAddNew}>
            Tambah Paket Baru
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
          <Link to="/admin" className="back-btn">
            Kembali ke Dashboard
          </Link>
        </div>
      </div>

      {(isAdding || editingItem) && (
        <div className="admin-form-container">
          <h2>{isAdding ? "Tambah Paket Baru" : "Edit Paket"}</h2>
          <form onSubmit={handleSubmit} className="admin-form">
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
                placeholder="Contoh: Rp 5.000.000"
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
              />
            </div>

            <div className="form-group">
              <label>Fitur Paket</label>
              <div className="feature-input-container">
                <input
                  type="text"
                  value={featureInput}
                  onChange={handleFeatureInputChange}
                  placeholder="Tambahkan fitur paket"
                />
                <button type="button" onClick={handleAddFeature}>
                  Tambah
                </button>
              </div>
              <ul className="feature-list">
                {formData.features.map((feat, i) => (
                  <li key={i} className="feature-item">
                    <span>{feat}</span>
                    <button type="button" onClick={() => handleRemoveFeature(i)}>
                      &times;
                    </button>
                  </li>
                ))}
              </ul>
              {formData.features.length === 0 && (
                <p className="form-help">Belum ada fitur yang ditambahkan</p>
              )}
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="popular"
                  checked={formData.popular}
                  onChange={handleChange}
                />
                Tandai sebagai paket populer
              </label>
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
              <th>Nama Paket</th>
              <th>Harga</th>
              <th>Populer</th>
              <th>Fitur</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>{item.price}</td>
                <td>{item.popular ? "Ya" : "Tidak"}</td>
                <td>{item.features.length} fitur</td>
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

export default AdminPricelist
