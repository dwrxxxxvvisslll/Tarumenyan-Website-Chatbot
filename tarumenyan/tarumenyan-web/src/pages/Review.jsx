"use client"

import { useState } from "react"
import { useData } from "../context/DataContext"
import { FaTimes } from "react-icons/fa"
import "./Review.css"

function Review() {
  const { reviews } = useData()
  const [filter, setFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [showModal, setShowModal] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  
  // Function to open modal with selected image
  const openImageModal = (imagePath) => {
    setSelectedImage(imagePath)
    setShowModal(true)
  }
  
  // Function to close modal
  const closeModal = () => {
    setShowModal(false)
    setSelectedImage(null)
  }

  // Filter reviews
  const filteredReviews =
    filter === "all"
      ? reviews
      : reviews.filter((review) => {
          if (filter === "wedding") return review.service_type === "wedding"
          if (filter === "pre-wedding") return review.service_type === "pre-wedding"
          if (filter === "lainnya") return review.service_type === "lainnya"
          return true
        })

  // Sort reviews
  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.date) - new Date(a.date)
    } else if (sortBy === "highest") {
      return b.rating - a.rating
    } else if (sortBy === "lowest") {
      return a.rating - b.rating
    }
    return 0
  })

  // Render stars
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
    <div className="review-page">
      {showModal && (
        <div className="review-modal-overlay" onClick={closeModal}>
          <div className="review-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={closeModal}>
              <FaTimes />
            </button>
            <img 
              src={selectedImage || "/placeholder.svg"} 
              alt="Review Image" 
              className="modal-review-image"
              onError={(e) => {
                console.error("Error loading modal image");
                e.target.src = "/placeholder.svg";
              }}
            />
          </div>
        </div>
      )}
      
      <div className="review-header">
        <h1>Review Pelanggan</h1>
        <p>Apa kata pelanggan kami tentang layanan Tarumenyan</p>
      </div>

      <div className="review-controls">
        <div className="filter-controls">
          <label>Filter:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">Semua Layanan</option>
            <option value="wedding">Pernikahan</option>
            <option value="pre-wedding">Pre-wedding</option>
            <option value="lainnya">Layanan Lainnya</option>
          </select>
        </div>

        <div className="sort-controls">
          <label>Urutkan:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="newest">Terbaru</option>
            <option value="highest">Rating Tertinggi</option>
            <option value="lowest">Rating Terendah</option>
          </select>
        </div>
      </div>

      <div className="review-container">
        {sortedReviews.map((review) => (
          <div key={review.id} className="review-card">
            <div className="review-image" onClick={() => review.image && openImageModal(`http://localhost:3001${review.image}`)}>
              <img 
                src={review.image ? `http://localhost:3001${review.image}` : "/placeholder.svg"} 
                alt={`Review by ${review.customer_name || 'Anonymous'}`} 
                onError={(e) => {
                  console.error("Error loading image:", review.image);
                  e.target.src = "/placeholder.svg";
                }}
                className={review.image ? "clickable-image" : ""}
              />
              {review.image && <div className="img-overlay"><span>Klik untuk memperbesar</span></div>}
            </div>
            <div className="review-content">
              <div className="review-header">
                <h3>{review.customer_name || 'Anonymous'}</h3>
                <div className="review-meta">
                  <span className="review-date">
                    {new Date(review.date).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                  <span className="review-service">
                    {review.service_type || 'Layanan tidak disebutkan'}
                  </span>
                  <span className="review-location">
                    {review.location || 'Lokasi tidak disebutkan'}
                  </span>
                </div>
                <div className="review-rating">{renderStars(review.rating || 0)}</div>
              </div>
              <p className="review-comment">
                {review.comment || 'Tidak ada komentar'}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="review-footer">
        <h2>Testimoni Pelanggan</h2>
        <p>Kami sangat menghargai kepercayaan pelanggan yang telah menggunakan jasa fotografi kami</p>
      </div>
    </div>
  )
}

export default Review
