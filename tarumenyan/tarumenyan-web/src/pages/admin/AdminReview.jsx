"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import { useData } from "../../context/DataContext"
import "./Admin.css"

function AdminReview() {
  const { reviews, updateReviews } = useData()
  const [items, setItems] = useState([...reviews])
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    date: "",
    rating: 5,
    service: "",
    location: "",
    comment: "",
    image: "",
    imagePreview: null,
    imageFile: null
  })
  const [isAdding, setIsAdding] = useState(false)

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: name === "rating" ? Number.parseInt(value) : value,
    })
  }

  // Start adding new item
  const handleAddNew = () => {
    setIsAdding(true)
    setEditingItem(null)
    const today = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    setFormData({
      id: Date.now(), // Generate a unique ID
      name: "",
      date: today,
      rating: 5,
      service: "",
      location: "",
      comment: "",
      image: "",
      imagePreview: null,
      imageFile: null
    })
  }

  // Start editing an item
  const handleEdit = (item) => {
    setIsAdding(false)
    setEditingItem(item.id)
    setFormData({
      id: item.id,
      name: item.name,
      date: item.date,
      rating: item.rating,
      service: item.service,
      location: item.location,
      comment: item.comment,
      image: item.image,
      imagePreview: null,
      imageFile: null
    })
  }

  // Delete an item
  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus review ini?")) {
      try {
        // Hapus dari database melalui API
        await axios.delete(`http://localhost:3001/api/reviews/${id}`)
        
        // Update state lokal
        const updatedItems = items.filter((item) => item.id !== id)
        setItems(updatedItems)
        updateReviews(updatedItems)
        
        alert("Review berhasil dihapus!")
      } catch (error) {
        console.error("Error saat menghapus review:", error)
        alert("Gagal menghapus review. Silakan coba lagi.")
      }
    }
  }

  // Save changes
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Buat FormData untuk mengirim data termasuk file
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('service', formData.service);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('rating', formData.rating);
      formDataToSend.append('comment', formData.comment);
      
      // Format tanggal untuk database (YYYY-MM-DD)
      let dateToSend = formData.date;
      if (formData.date) {
        try {
          // Coba parse tanggal dari format Indonesia
          const dateParts = formData.date.split(' ');
          const months = {
            'Januari': '01', 'Februari': '02', 'Maret': '03', 'April': '04',
            'Mei': '05', 'Juni': '06', 'Juli': '07', 'Agustus': '08',
            'September': '09', 'Oktober': '10', 'November': '11', 'Desember': '12'
          };
          
          if (dateParts.length >= 3) {
            const day = dateParts[0].padStart(2, '0');
            const month = months[dateParts[1]] || '01';
            const year = dateParts[2];
            dateToSend = `${year}-${month}-${day}`;
          }
        } catch (e) {
          console.error('Error parsing date:', e);
          // Gunakan tanggal asli jika parsing gagal
        }
      }
      
      formDataToSend.append('date', dateToSend);
      
      // Tambahkan file gambar jika ada
      if (formData.imageFile) {
        formDataToSend.append('image', formData.imageFile);
      }

      let response;
      
      if (isAdding) {
        // Add new item
        response = await axios.post('http://localhost:3001/api/reviews', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        // Tambahkan item baru ke state
        const newItem = response.data;
        const updatedItems = [...items, {
          id: newItem.id,
          name: newItem.customer_name || newItem.name,
          service: newItem.service_type || newItem.service,
          location: newItem.location,
          rating: newItem.rating,
          comment: newItem.comment,
          image: newItem.image,
          date: formData.date // Gunakan date dari form karena mungkin format berbeda
        }];
        
        setItems(updatedItems);
        updateReviews(updatedItems);
        setIsAdding(false);
      } else {
        // Update existing item
        response = await axios.put(`http://localhost:3001/api/reviews/${editingItem}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        const updatedItem = response.data;
        const updatedItems = items.map(item => {
          if (item.id === editingItem) {
            return {
              ...item,
              name: updatedItem.customer_name || updatedItem.name || item.name,
              service: updatedItem.service_type || updatedItem.service || item.service,
              location: updatedItem.location || item.location,
              rating: updatedItem.rating || item.rating,
              comment: updatedItem.comment || item.comment,
              image: updatedItem.image || item.image,
              date: formData.date // Gunakan date dari form
            };
          }
          return item;
        });
        
        setItems(updatedItems);
        updateReviews(updatedItems);
        setEditingItem(null);
      }

      // Reset form
      setFormData({
        id: "",
        name: "",
        date: "",
        rating: 5,
        service: "",
        location: "",
        comment: "",
        image: "",
        imagePreview: null,
        imageFile: null
      });
      
      alert(isAdding ? "Review berhasil ditambahkan!" : "Review berhasil diperbarui!");
    } catch (error) {
      console.error("Error saat menyimpan review:", error);
      console.error("Error response:", error.response?.data);
      alert(`Terjadi kesalahan saat menyimpan review: ${error.response?.data?.error || error.message}. Silakan coba lagi.`);
    }
  };

  // Cancel editing/adding
  const handleCancel = () => {
    setIsAdding(false)
    setEditingItem(null)
    setFormData({
      id: "",
      name: "",
      date: "",
      rating: 5,
      service: "",
      location: "",
      comment: "",
      image: "",
      imagePreview: null,
      imageFile: null
    })
  }

  // Render stars for display
  const renderStars = (rating) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? "star filled" : "star"}>
          ★
        </span>,
      )
    }
    return stars
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Kelola Review</h1>
        <div className="admin-actions">
          <button className="add-btn" onClick={handleAddNew}>
            Tambah Review Baru
          </button>
          <Link to="/admin" className="back-btn">
            Kembali ke Dashboard
          </Link>
        </div>
      </div>

      {(isAdding || editingItem) && (
        <div className="admin-form-container">
          <h2>{isAdding ? "Tambah Review Baru" : "Edit Review"}</h2>
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-group">
              <label htmlFor="name">Nama Pelanggan</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label htmlFor="date">Tanggal</label>
              <input
                type="text"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                placeholder="Contoh: 15 Maret 2023"
              />
            </div>

            <div className="form-group">
              <label htmlFor="rating">Rating</label>
              <select id="rating" name="rating" value={formData.rating} onChange={handleChange} required>
                <option value="1">1 Bintang</option>
                <option value="2">2 Bintang</option>
                <option value="3">3 Bintang</option>
                <option value="4">4 Bintang</option>
                <option value="5">5 Bintang</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="service">Jenis Layanan</label>
              <input
                type="text"
                id="service"
                name="service"
                value={formData.service}
                onChange={handleChange}
                required
                placeholder="Contoh: wedding, pre-wedding, lainnya"
              />
            </div>

            <div className="form-group">
              <label htmlFor="location">Lokasi</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="comment">Komentar</label>
              <textarea
                id="comment"
                name="comment"
                value={formData.comment}
                onChange={handleChange}
                rows="4"
                required
              ></textarea>
            </div>

            <div className="form-group">
              <label htmlFor="image">Gambar Review</label>
              <input 
                type="file" 
                id="image" 
                name="image" 
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    // Untuk preview lokal saja
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      setFormData({
                        ...formData,
                        imagePreview: event.target.result,
                        imageFile: e.target.files[0]
                      });
                    };
                    reader.readAsDataURL(e.target.files[0]);
                  }
                }}
              />
              <p className="form-help">Upload gambar review (JPG, PNG)</p>
            </div>

            <div className="form-preview">
              <h3>Preview</h3>
              <div className="image-preview">
                <img 
                  src={formData.imagePreview || (formData.image ? `http://localhost:3001${formData.image}` : "/placeholder.svg")} 
                  alt="Preview" 
                  onError={(e) => {
                    console.error("Error loading image:", formData.image);
                    e.target.src = "/placeholder.svg";
                  }}
                />
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
              <th>Nama</th>
              <th>Tanggal</th>
              <th>Rating</th>
              <th>Layanan</th>
              <th>Lokasi</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>
                  <img 
                    src={item.image ? `http://localhost:3001${item.image}` : "/placeholder.svg"} 
                    alt={item.name} 
                    className="table-image" 
                    onError={(e) => {
                      console.error("Error loading image:", item.image);
                      e.target.src = "/placeholder.svg";
                    }}
                  />
                </td>
                <td>{item.name}</td>
                <td>{item.date}</td>
                <td>{renderStars(item.rating)}</td>
                <td>{item.service}</td>
                <td>{item.location}</td>
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

export default AdminReview