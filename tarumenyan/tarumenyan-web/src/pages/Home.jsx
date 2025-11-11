import { Link } from "react-router-dom"
import { useData } from "../context/DataContext"
import "./Home.css"
import { useEffect, useState } from "react"
import { FaChevronLeft, FaChevronRight, FaSearch } from "react-icons/fa"

function Home() {
  const { reviews, galleryItems } = useData()
  const [featuredPhotos, setFeaturedPhotos] = useState({
    wedding: null,
    prewedding: null,
    lainnya: null
  })
  
  // State untuk slideshow gambar
  const [categoryPhotos, setCategoryPhotos] = useState({
    wedding: [],
    prewedding: [],
    lainnya: []
  })
  
  // State untuk indeks gambar yang sedang ditampilkan
  const [currentIndices, setCurrentIndices] = useState({
    wedding: 0,
    prewedding: 0,
    lainnya: 0
  })
  
  // State untuk animasi fading
  const [fadeIn, setFadeIn] = useState({
    wedding: true,
    prewedding: true,
    lainnya: true
  })
  
  // State untuk modal dan karosel
  const [showModal, setShowModal] = useState(false)
  const [currentImage, setCurrentImage] = useState(null)
  const [currentCategory, setCurrentCategory] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  
  // Ambil 3 review teratas berdasarkan rating
  const topReviews = [...reviews]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3)
    
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

  // Ambil foto untuk setiap kategori dari gallery
  useEffect(() => {
    if (galleryItems && galleryItems.length > 0) {
      // Ambil satu foto untuk tampilan awal
      const photos = {
        wedding: galleryItems.find(item => item.category === "wedding"),
        prewedding: galleryItems.find(item => item.category === "prewedding"),
        lainnya: galleryItems.find(item => item.category === "lainnya")
      }
      setFeaturedPhotos(photos)
      
      // Ambil semua foto untuk setiap kategori untuk slideshow
      const allPhotos = {
        wedding: galleryItems.filter(item => item.category === "wedding"),
        prewedding: galleryItems.filter(item => item.category === "prewedding"),
        lainnya: galleryItems.filter(item => item.category === "lainnya")
      }
      setCategoryPhotos(allPhotos)
    }
  }, [galleryItems])
  
  // Efek untuk slideshow gambar setiap 5 detik dengan animasi fading
  useEffect(() => {
    const intervals = {}
    const categories = ["wedding", "prewedding", "lainnya"]
    
    categories.forEach(category => {
      // Hanya jalankan slideshow jika ada lebih dari 1 gambar dalam kategori
      if (categoryPhotos[category].length > 1) {
        // Interval untuk animasi fading out
        intervals[`${category}Fade`] = setInterval(() => {
          setFadeIn(prev => ({ ...prev, [category]: false }))
          
          // Setelah animasi fade out selesai, ganti gambar dan mulai fade in
          setTimeout(() => {
            setCurrentIndices(prev => ({
              ...prev,
              [category]: (prev[category] + 1) % categoryPhotos[category].length
            }))
            setFadeIn(prev => ({ ...prev, [category]: true }))
          }, 500) // Waktu untuk fade out (500ms)
        }, 5000) // Ganti gambar setiap 5 detik
      }
    })
    
    // Cleanup interval saat komponen unmount
    return () => {
      categories.forEach(category => {
        if (intervals[`${category}Fade`]) {
          clearInterval(intervals[`${category}Fade`])
        }
      })
    }
  }, [categoryPhotos])

  // Fungsi untuk membuka modal dan menampilkan gambar besar
  const openModal = (category) => {
    setCurrentCategory(category)
    
    // Gunakan gambar yang sedang aktif di slideshow
    if (categoryPhotos[category].length > 0) {
      setCurrentImage(categoryPhotos[category][currentIndices[category]])
    } else {
      setCurrentImage(featuredPhotos[category])
    }
    
    // Set currentIndex berdasarkan kategori yang dipilih
    const categories = ["wedding", "prewedding", "lainnya"]
    setCurrentIndex(categories.indexOf(category))
    
    setShowModal(true)
  }

  // Fungsi untuk menutup modal
  const closeModal = () => {
    setShowModal(false)
    setCurrentImage(null)
    setCurrentCategory(null)
  }

  // Fungsi untuk navigasi ke gambar berikutnya dalam karosel
  const nextImage = () => {
    const categories = ["wedding", "prewedding", "lainnya"]
    const nextIndex = (currentIndex + 1) % 3
    const nextCategory = categories[nextIndex]
    
    setCurrentIndex(nextIndex)
    setCurrentCategory(nextCategory)
    
    // Gunakan gambar yang sedang aktif di slideshow
    if (categoryPhotos[nextCategory].length > 0) {
      setCurrentImage(categoryPhotos[nextCategory][currentIndices[nextCategory]])
    } else {
      setCurrentImage(featuredPhotos[nextCategory])
    }
  }

  // Fungsi untuk navigasi ke gambar sebelumnya dalam karosel
  const prevImage = () => {
    const categories = ["wedding", "prewedding", "lainnya"]
    const prevIndex = (currentIndex - 1 + 3) % 3
    const prevCategory = categories[prevIndex]
    
    setCurrentIndex(prevIndex)
    setCurrentCategory(prevCategory)
    
    // Gunakan gambar yang sedang aktif di slideshow
    if (categoryPhotos[prevCategory].length > 0) {
      setCurrentImage(categoryPhotos[prevCategory][currentIndices[prevCategory]])
    } else {
      setCurrentImage(featuredPhotos[prevCategory])
    }
  }

  return (
    <div className="home">
      {/* Modal untuk menampilkan gambar besar */}
      {showModal && (
        <div className="image-modal">
          <div className="modal-content">
            <span className="close-modal" onClick={closeModal}>&times;</span>
            <div className="modal-image-container">
              <button className="carousel-btn prev" onClick={prevImage}>
                <FaChevronLeft />
              </button>
              <img 
                src={currentImage ? `http://localhost:3001${currentImage.image}` : "/placeholder.svg?height=600&width=800"} 
                alt={currentImage?.title || "Gallery Image"} 
                className="modal-image"
                onError={(e) => {
                  console.error("Error loading image");
                  e.target.src = "/placeholder.svg?height=600&width=800";
                }}
              />
              <button className="carousel-btn next" onClick={nextImage}>
                <FaChevronRight />
              </button>
            </div>
            <div className="modal-caption">
              <h3>{currentImage?.title || ""}</h3>
              <p>
                {currentCategory === "wedding" ? "Wedding" : 
                 currentCategory === "prewedding" ? "Pre-wedding" : "Lainnya"}
              </p>
            </div>
          </div>
        </div>
      )}

      <section className="hero-section">
        <div className="hero-container">
          <h1>TARUMENYAN</h1>
          <p> <strong> Mengabadikan momen berharga dalam hidup Anda</strong></p>
          <p>
            Pernikahan merupakan sebuah momen sakral dan akan menjadi babak kehidupan yang baru
 bagi setiap pasangan. Setiap pasangan di dunia ini akan mengalami momen pernikahan
 setidaknya sekali dalam seumur hidup dan momen tersebut harus di abadikan sebagai saksi bisu
 dalam perjalanan cinta. 
            </p>
            <p>
            Maka dari itu Tarumenyan hadir sebagai bagian dari cerita tersebut,
 kami yakin seiring bergulirnya waktu dan usia, momen-momen indah tak terlupakan yang telah
 berlalu tersebut akan menjadi sebuah kenangan yang abadi dan kelak dapat di ceritakan
 kembali kepada anak cucu kita nanti.
            </p>

          <div className="hero-btns">
            <Link to="/gallery" className="btn-primary">
              Lihat Galeri
            </Link>
            <Link to="/pricelist" className="btn-outline">
              Lihat Harga
            </Link>
          </div>
        </div>
      </section>

      <section className="featured-section">
        <h2>Layanan Fotografi Kami</h2>
        <div className="featured-container">
          <div className="featured-card">
            {categoryPhotos.wedding.length > 0 ? (
              <div className="featured-img-container" onClick={() => openModal("wedding")}>
                <img 
                  src={`http://localhost:3001${categoryPhotos.wedding[currentIndices.wedding]?.image}`} 
                  alt="Pernikahan" 
                  className={`featured-img ${fadeIn.wedding ? 'fade-in' : 'fade-out'}`} 
                  onError={(e) => {
                    console.error("Error loading image");
                    e.target.src = "/placeholder.svg?height=300&width=400";
                  }}
                />
                <div className="img-overlay">
                  <div className="view-icon">
                    <FaSearch />
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-gallery">
                <p>Saat ini belum ada foto untuk ditampilkan, nantikan foto-foto dari kami ya!</p>
              </div>
            )}
            <h3>Wedding</h3>
            <p>Abadikan momen spesial pernikahan Anda dengan sentuhan artistik kami</p>
          </div>
          <div className="featured-card">
            {categoryPhotos.prewedding.length > 0 ? (
              <div className="featured-img-container" onClick={() => openModal("prewedding")}>
                <img 
                  src={`http://localhost:3001${categoryPhotos.prewedding[currentIndices.prewedding]?.image}`} 
                  alt="Pre-wedding" 
                  className={`featured-img ${fadeIn.prewedding ? 'fade-in' : 'fade-out'}`} 
                  onError={(e) => {
                    console.error("Error loading image");
                    e.target.src = "/placeholder.svg?height=300&width=400";
                  }}
                />
                <div className="img-overlay">
                  <div className="view-icon">
                    <FaSearch />
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-gallery">
                <p>Saat ini belum ada foto untuk ditampilkan, nantikan foto-foto dari kami ya!</p>
              </div>
            )}
            <h3>Pre-wedding</h3>
            <p>Sesi foto pre-wedding yang menampilkan keindahan cinta Anda</p>
          </div>
          <div className="featured-card">
            {categoryPhotos.lainnya.length > 0 ? (
              <div className="featured-img-container" onClick={() => openModal("lainnya")}>
                <img 
                  src={`http://localhost:3001${categoryPhotos.lainnya[currentIndices.lainnya]?.image}`} 
                  alt="Lainnya" 
                  className={`featured-img ${fadeIn.lainnya ? 'fade-in' : 'fade-out'}`} 
                  onError={(e) => {
                    console.error("Error loading image");
                    e.target.src = "/placeholder.svg?height=300&width=400";
                  }}
                />
                <div className="img-overlay">
                  <div className="view-icon">
                    <FaSearch />
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-gallery">
                <p>Saat ini belum ada foto untuk ditampilkan, nantikan foto-foto dari kami ya!</p>
              </div>
            )}
            <h3>Lainnya</h3>
            <p>Berbagai jenis fotografi lainnya untuk kebutuhan personal dan bisnis</p>
          </div>
        </div>
      </section>

      <section className="about-section">
        <div className="about-container">
          <div className="about-content">
            <h1 className="about-title">Tentang Tarumenyan</h1>
            <div className="about-text">
              <h4>Tarumenyan adalah sebuah brand fotografi dan videografi yang berdiri sejak tahun 2022. </h4> <br></br>
              <h4>Berada di bawah naungan <strong>PT. Tarumenyan Karya Indonesia</strong>, kami hadir untuk mengabadikan momen-momen
              berharga dalam hidup kalian dengan berbagai layanan istimewa. Mulai dari dokumentasi wedding yang akan
              menangkap setiap detail cinta, hingga photobooth yang siap menambah keseruan dari setiap acara!
              </h4>
            </div>
            <div className="about-button-container">
              <Link to="/about-us" className="btn-primary">
                Pelajari Lebih Lanjut
              </Link>
            </div>
          </div>  
          </div>
      </section>

      <section className="testimonial-section">
        <h2>Apa Kata Mereka</h2>
        <div className="testimonial-container">
          {topReviews.length > 0 ? (
            topReviews.map((review) => (
              <div key={review.id} className="testimonial-card">
                <div className="testimonial-content">
                  <p>"{review.comment}"</p>
                  <div className="review-rating">{renderStars(review.rating)}</div>
                  <h4>{review.customer_name}</h4>
                  <p className="testimonial-info">{review.service_type}, {review.location}</p>
                </div>
              </div>
            ))
          ) : (
            <p>Belum ada review</p>
          )}
        </div>
        <Link to="/review" className="btn-outline testimonial-btn">
          Lihat Semua Review
        </Link>
      </section>

      <section className="cta-section">
        <div className="cta-container">
          <h2>Siap Mengabadikan Momen Berharga Anda?</h2>
          <p>Hubungi kami sekarang untuk konsultasi dan pemesanan</p>
          <a 
            href="https://wa.me/6281236559230?text=Halo%2C%20saya%20tertarik%20dengan%20layanan%20fotografi%20Tarumenyan%20dan%20ingin%20mendapatkan%20informasi%20lebih%20lanjut."
            className="btn-primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            Hubungi Kami Via WhatsApp Sekarang
          </a>
        </div>
      </section>
    </div>
  )
}

export default Home
