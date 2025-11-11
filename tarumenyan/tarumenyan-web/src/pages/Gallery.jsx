"use client"

import { useState, useEffect } from "react"
import { useData } from "../context/DataContext"
import { FaChevronLeft, FaChevronRight, FaSearch } from "react-icons/fa"
import "./Gallery.css"

function Gallery() {
  const [filter, setFilter] = useState("all")
  const { galleryItems, loading } = useData()
  const [modalOpen, setModalOpen] = useState(false)
  const [currentImage, setCurrentImage] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  const filteredItems = filter === "all" ? galleryItems : galleryItems.filter((item) => item.category === filter)

  const openModal = (item, index) => {
    setCurrentImage(item)
    setCurrentIndex(index)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
  }

  const nextImage = () => {
    const newIndex = (currentIndex + 1) % filteredItems.length
    setCurrentIndex(newIndex)
    setCurrentImage(filteredItems[newIndex])
  }

  const prevImage = () => {
    const newIndex = (currentIndex - 1 + filteredItems.length) % filteredItems.length
    setCurrentIndex(newIndex)
    setCurrentImage(filteredItems[newIndex])
  }

  // Menangani navigasi dengan keyboard
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!modalOpen) return

      if (e.key === 'ArrowRight') {
        nextImage()
      } else if (e.key === 'ArrowLeft') {
        prevImage()
      } else if (e.key === 'Escape') {
        closeModal()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [modalOpen, currentIndex, filteredItems])

  return (
    <div className="gallery-page">
      <div className="gallery-header">
        <h1>Galeri Foto</h1>
        <p>Koleksi karya fotografi terbaik kami</p>
      </div>

      <div className="gallery-filter">
        <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>
          Semua
        </button>
        <button className={filter === "wedding" ? "active" : ""} onClick={() => setFilter("wedding")}>
          Wedding
        </button>
        <button className={filter === "prewedding" ? "active" : ""} onClick={() => setFilter("prewedding")}>
          Pre-wedding
        </button>
        <button className={filter === "Lainnya" ? "active" : ""} onClick={() => setFilter("lainnya")}>
          Lainnya
        </button>
      </div>

      {loading ? (
        <div className="loading-container">
          <p>Memuat galeri foto...</p>
        </div>
      ) : (
        <div className="gallery-container">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => (
              <div key={item.id} className="gallery-item">
                <div className="gallery-img-container" onClick={() => openModal(item, index)}>
                  <img 
                    src={item.image ? `http://localhost:3001${item.image}` : null} 
                    alt={item.title} 
                    className="gallery-img" 
                    onError={(e) => {
                      console.error("Error loading image:", item.image);
                      e.target.src = "/placeholder.svg";
                    }}
                  />
                  <div className="gallery-overlay">
                    <h3>{item.title}</h3>
                    <p>
                      {item.category === "wedding"
                        ? "Wedding"
                        : item.category === "prewedding"
                          ? "Pre-wedding"
                          : "Lainnya"}
                    </p>
                  </div>
                  <div className="img-overlay">
                    <div className="view-icon">
                      <FaSearch />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-gallery">
              <p>Tidak ada foto dalam kategori ini</p>
            </div>
          )}
        </div>
      )}

      {/* Modal Karosel */}
      {modalOpen && currentImage && (
        <div className="image-modal" onClick={closeModal}>
          <span className="close-modal" onClick={closeModal}>&times;</span>
          
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-image-container">
              <img 
                src={currentImage.image ? `http://localhost:3001${currentImage.image}` : "/placeholder.svg"} 
                alt={currentImage.title} 
                className="modal-image" 
                onError={(e) => {
                  e.target.src = "/placeholder.svg";
                }}
              />
              
              <button className="carousel-btn prev" onClick={prevImage}>
                <FaChevronLeft />
              </button>
              
              <button className="carousel-btn next" onClick={nextImage}>
                <FaChevronRight />
              </button>
            </div>
            
            <div className="modal-caption">
              <h3>{currentImage.title}</h3>
              <p>
                {currentImage.category === "wedding"
                  ? "Wedding"
                  : currentImage.category === "prewedding"
                    ? "Pre-wedding"
                    : "Lainnya"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Gallery
