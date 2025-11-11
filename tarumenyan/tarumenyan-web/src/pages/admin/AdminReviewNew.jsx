"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import { useAuth } from "../../context/AuthContext"
import { useData } from "../../context/DataContext"
import "./AdminNew.css"

function AdminReviewNew() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const { logout } = useAuth()
  const navigate = useNavigate()
  const { reviews, updateReviews } = useData()
  
  const [items, setItems] = useState([...reviews])
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    customer_name: "", // Add customer_name field
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

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  // Handle logout
  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  // Fetch reviews data from backend
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get("http://localhost:3001/api/reviews")
        const reviewsWithImages = res.data.map(review => ({
          ...review,
          image: review.image ? `http://localhost:3001${review.image}` : null
        }))
        setItems(reviewsWithImages)
        updateReviews(reviewsWithImages)
      } catch (err) {
        console.error("Gagal fetch reviews:", err)
      }
    }
    fetchReviews()
  }, [updateReviews])

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type } = e.target
    if (type === "file") {
      const file = e.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setFormData({
            ...formData,
            imageFile: file,
            imagePreview: reader.result,
          })
        }
        reader.readAsDataURL(file)
      }
    } else if (name === "rating") {
      setFormData({
        ...formData,
        [name]: Number(value)
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  // Add new review
  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      let dateToSend = formData.date;
      
      const reviewData = new FormData()
      reviewData.append("name", formData.name)
      reviewData.append("customer_name", formData.name) // Add customer_name
      reviewData.append("date", dateToSend)
      reviewData.append("rating", formData.rating || 5)
      reviewData.append("service", formData.service)
      reviewData.append("service_type", formData.service) // Add service_type
      reviewData.append("location", formData.location)
      reviewData.append("comment", formData.comment)
      if (formData.imageFile) {
        reviewData.append("image", formData.imageFile)
      }

      const res = await axios.post("http://localhost:3001/api/reviews", reviewData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      const newReview = res.data;
      const formattedNewReview = {
        id: newReview.id,
        name: newReview.customer_name || newReview.name,
        customer_name: newReview.customer_name,
        service: newReview.service_type || newReview.service,
        service_type: newReview.service_type || newReview.service,
        location: newReview.location,
        rating: Number(newReview.rating),
        comment: newReview.comment,
        image: newReview.image ? `http://localhost:3001${newReview.image}` : null,
        date: formData.date
      };
      
      const updatedItems = [...items, formattedNewReview];
      setItems(updatedItems);
      updateReviews(updatedItems);

      setFormData({
        id: "",
        name: "",
        customer_name: "",
        date: "",
        rating: 5,
        service: "",
        location: "",
        comment: "",
        image: "",
        imagePreview: null,
        imageFile: null
      })
      setIsAdding(false)
      alert("Review berhasil ditambahkan!");
    } catch (err) {
      console.error("Gagal menambahkan review:", err)
      alert(`Terjadi kesalahan saat menambahkan review: ${err.response?.data?.error || err.message}. Silakan coba lagi.`);
    }
  }

  // Edit review
  const handleEdit = (item) => {
    setEditingItem(item.id)
    setFormData({
      id: item.id,
      name: item.name,
      customer_name: item.customer_name,
      date: item.date,
      rating: Number(item.rating),
      service: item.service_type || item.service,
      location: item.location,
      comment: item.comment,
      image: item.image,
      imagePreview: item.image ? item.image : null,
      imageFile: null
    })
    
    if (item.image) {
      console.log("Setting image preview from existing image:", item.image);
    }
  }

  // Update review
  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      let dateToSend = formData.date;
      
      const reviewData = new FormData()
      reviewData.append("name", formData.name)
      reviewData.append("customer_name", formData.name)
      reviewData.append("date", dateToSend)
      reviewData.append("rating", formData.rating || 5)
      reviewData.append("service", formData.service)
      reviewData.append("service_type", formData.service) // Add service_type
      reviewData.append("location", formData.location)
      reviewData.append("comment", formData.comment)
      if (formData.imageFile) {
        reviewData.append("image", formData.imageFile)
      }

      const response = await axios.put(`http://localhost:3001/api/reviews/${formData.id}`, reviewData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      const updatedItem = response.data;
      const updatedItems = items.map(item => {
        if (item.id === formData.id) {
          return {
            ...item,
            name: updatedItem.customer_name || updatedItem.name || formData.name,
            customer_name: updatedItem.customer_name,
            service: updatedItem.service_type || updatedItem.service || formData.service,
            service_type: updatedItem.service_type || updatedItem.service || formData.service,
            location: updatedItem.location || formData.location,
            rating: Number(updatedItem.rating || formData.rating),
            comment: updatedItem.comment || formData.comment,
            image: updatedItem.image ? `http://localhost:3001${updatedItem.image}` : item.image,
            date: formData.date
          };
        }
        return item;
      });
      
      setItems(updatedItems);
      updateReviews(updatedItems);

      setEditingItem(null)
      setFormData({
        id: "",
        name: "",
        customer_name: "",
        date: "",
        rating: 5,
        service: "",
        location: "",
        comment: "",
        image: "",
        imagePreview: null,
        imageFile: null
      })
      alert("Review berhasil diperbarui!");
    } catch (err) {
      console.error("Gagal memperbarui review:", err)
      alert(`Terjadi kesalahan saat memperbarui review: ${err.response?.data?.error || err.message}. Silakan coba lagi.`);
    }
  }

  // Delete review
  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus review ini?")) {
      try {
        await axios.delete(`http://localhost:3001/api/reviews/${id}`)
        const updatedItems = items.filter((item) => item.id !== id)
        setItems(updatedItems)
        updateReviews(updatedItems)
      } catch (err) {
        console.error("Gagal menghapus review:", err)
      }
    }
  }

  // Generate star rating display
  const renderStars = (rating) => {
    const numRating = Number(rating) || 0
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <i
          key={i}
          className={`fas fa-star ${i <= numRating ? "filled" : ""}`}
        ></i>
      )
    }
    return stars
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
              <Link to="/admin/review" className="sidebar-link active">
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
              <h1>Kelola Review</h1>
              <p>Tambah, edit, atau hapus review pelanggan</p>
            </div>

            <div className="admin-actions-top">
              <button className="add-btn" onClick={() => setIsAdding(!isAdding)}>
                {isAdding ? "Batal" : "Tambah Review Baru"}
              </button>
            </div>

            {isAdding && (
              <div className="admin-form-container">
                <h2>Tambah Review Baru</h2>
                <form onSubmit={handleAdd} className="admin-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="name">Nama</label>
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
                      <label htmlFor="date">Tanggal</label>
                      <input
                        type="date"
                        id="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="service">Layanan</label>
                      <input
                        type="text"
                        id="service"
                        name="service"
                        value={formData.service}
                        onChange={handleChange}
                        placeholder="contoh : wedding, pre-wedding, lainnya"
                        required
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
                  </div>
                  <div className="form-group">
                    <label htmlFor="rating">Rating</label>
                    <div className="rating-input">
                      <select
                        id="rating"
                        name="rating"
                        value={formData.rating}
                        onChange={handleChange}
                        required
                      >
                        <option value="1">1 Bintang</option>
                        <option value="2">2 Bintang</option>
                        <option value="3">3 Bintang</option>
                        <option value="4">4 Bintang</option>
                        <option value="5">5 Bintang</option>
                      </select>
                      <div className="rating-stars">
                        {renderStars(formData.rating)}
                      </div>
                    </div>
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
                    <label htmlFor="image">Foto (ukuran 1:1)</label>
                    <input
                      type="file"
                      id="image"
                      name="image"
                      accept="image/*"
                      onChange={handleChange}
                    />
                    <div className="form-preview">
                      <h3>Preview</h3>
                      <div className="image-preview">
                        {formData.imagePreview ? (
                          <img src={formData.imagePreview} alt="Preview" style={{ maxWidth: "200px", height: "auto", border: "1px solid #ddd", borderRadius: "4px", padding: "5px" }} />
                        ) : (
                          <img 
                            src={formData.image ? (formData.image.startsWith('http') ? formData.image : `http://localhost:3001${formData.image}`) : null} 
                            alt="Preview" 
                            style={{ maxWidth: "200px", height: "auto", border: "1px solid #ddd", borderRadius: "4px", padding: "5px" }}
                            onError={(e) => {
                              if (formData.image) {
                                console.error("Error loading image:", formData.image);
                              }
                              e.target.src = "/placeholder.svg";
                            }}
                          />
                        )}
                      </div>
                    </div>
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
                          customer_name: "",
                          date: "",
                          rating: 5,
                          service: "",
                          location: "",
                          comment: "",
                          image: "",
                          imagePreview: null,
                          imageFile: null
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
                <div className="no-items">Belum ada review yang ditambahkan</div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="admin-item">
                    {editingItem === item.id ? (
                      <form onSubmit={handleUpdate} className="admin-form">
                        <div className="form-row">
                          <div className="form-group">
                            <label htmlFor="name">Nama</label>
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
                            <label htmlFor="date">Tanggal</label>
                            <input
                              type="date"
                              id="date"
                              name="date"
                              value={formData.date}
                              onChange={handleChange}
                              required
                            />
                          </div>
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label htmlFor="service">Layanan</label>
                            <input
                              type="text"
                              id="service"
                              name="service"
                              value={formData.service}
                              onChange={handleChange}
                              required
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
                        </div>
                        <div className="form-group">
                          <label htmlFor="rating">Rating</label>
                          <div className="rating-input">
                            <select
                              id="rating"
                              name="rating"
                              value={formData.rating}
                              onChange={handleChange}
                              required
                            >
                              <option value="1">1 Bintang</option>
                              <option value="2">2 Bintang</option>
                              <option value="3">3 Bintang</option>
                              <option value="4">4 Bintang</option>
                              <option value="5">5 Bintang</option>
                            </select>
                            <div className="rating-stars">
                              {renderStars(formData.rating)}
                            </div>
                          </div>
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
                          <label htmlFor="image">Foto (ukuran 1:1)</label>
                          <input
                            type="file"
                            id="image"
                            name="image"
                            accept="image/*"
                            onChange={handleChange}
                          />
                          <div className="form-preview">
                      <h3>Preview</h3>
                      <div className="image-preview">
                        {formData.imagePreview ? (
                          <img src={formData.imagePreview} alt="Preview" style={{ maxWidth: "200px", height: "auto", border: "1px solid #ddd", borderRadius: "4px", padding: "5px" }} />
                        ) : (
                          <img 
                            src={formData.image ? (formData.image.startsWith('http') ? formData.image : `http://localhost:3001${formData.image}`) : null} 
                            alt="Preview" 
                            style={{ maxWidth: "200px", height: "auto", border: "1px solid #ddd", borderRadius: "4px", padding: "5px" }}
                            onError={(e) => {
                              if (formData.image) {
                                console.error("Error loading image:", formData.image);
                              }
                              e.target.src = "/placeholder.svg";
                            }}
                          />
                        )}
                      </div>
                    </div>
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
                                customer_name: "",
                                date: "",
                                rating: 5,
                                service: "",
                                location: "",
                                comment: "",
                                image: "",
                                imagePreview: null,
                                imageFile: null
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
                          <div className="review-header">
                            {/* <h3>Reviewer: {item.name}</h3> */}
                            <h1></h1>
                            <h1></h1>
                            <p className="reviewed-by">Reviewed by : {item.customer_name || item.name}</p>
                            <div className="review-meta">
                              <span className="review-date">{item.date}</span>
                              <div className="review-rating">
                                {renderStars(item.rating)}
                              </div>
                            </div>
                          </div>
                          <div className="review-details">
                            <span className="review-service"><strong>Layanan : </strong> {item.service_type || item.service}</span>
                            <span className="review-location"><strong>Lokasi : </strong> {item.location}</span>

                          </div>
                          <p className="review-comment">{item.comment}</p>
                          <div className="review-image">
                            <img 
                            src={item.image || "/placeholder.svg?height=300&width=300"}
                            alt={`Review by ${item.name}`}
                            style={{ maxWidth: "300px", height: "auto", border: "1px solid #ddd", borderRadius: "4px", padding: "5px" }}
                            onError={(e) => {
                              // Hanya tampilkan error jika ada path gambar yang valid
                              if (item.image && item.image !== "/placeholder.svg") {
                                console.error("Error loading image:", item.image);
                              }
                              e.target.src = "/placeholder.svg?height=300&width=300";
                            }}
                          />
                          </div>
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

export default AdminReviewNew