"use client"

import { createContext, useState, useEffect, useContext } from "react"

// Buat context untuk data
export const DataContext = createContext()

// Data awal untuk gallery kosong
const initialGalleryItems = []

// Data paket kosong karena akan diambil dari database
const initialPackages = []

// Data FAQ kosong karena akan diambil dari database
const initialFaqItems = []

// Data review kosong karena akan diambil dari database
const initialReviews = []

const initialAboutInfo = {
  story:
    "T, seorang fotografer yang memiliki hasrat untuk mengabadikan momen-momen berharga dalam hidup. Nama 'Tarumenyan' berasal dari bahasa Sunda yang berarti 'tempat yang indah', mencerminkan filosofi kami untuk menciptakan keindahan dalam setiap karya.",
  vision: "Menjadi studio fotografi terdepan yang dikenal karena kualitas, kreativitas, dan pelayanan yang luar biasa.",
  mission:
    "Mengabadikan momen berharga dengan sentuhan artistik dan profesional, memberikan pengalaman yang personal bagi setiap klien, dan terus berinovasi dalam seni fotografi.",
  values:
    "Kualitas, kreativitas, profesionalisme, integritas, dan kepuasan klien adalah nilai-nilai utama yang kami junjung tinggi dalam setiap aspek pekerjaan kami.",
  hours: 
    "Senin - Jumat : 09:00 - 18:00\nSabtu : 09:00 - 15:00\nMinggu : Dengan perjanjian melalui WhatsApp"
}

export const DataProvider = ({ children }) => {
  const [galleryItems, setGalleryItems] = useState([])
  const [packages, setPackages] = useState([])
  const [faqItems, setFaqItems] = useState([])
  const [reviews, setReviews] = useState([])
  const [aboutInfo, setAboutInfo] = useState({})
  const [loading, setLoading] = useState(false)

  // Fungsi untuk mengambil data gallery dari API
  const fetchGalleryFromAPI = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/gallery")
      if (response.ok) {
        const data = await response.json()
        setGalleryItems(data)
        return data
      } else {
        console.error("Gagal mengambil data gallery dari API")
        // Fallback ke data lokal jika API gagal
        const loadedGallery = localStorage.getItem("tarumenyanGallery")
        const galleryData = loadedGallery ? JSON.parse(loadedGallery) : initialGalleryItems
        setGalleryItems(galleryData)
        return galleryData
      }
    } catch (error) {
      console.error("Error saat mengambil data gallery:", error)
      // Fallback ke data lokal jika terjadi error
      const loadedGallery = localStorage.getItem("tarumenyanGallery")
      const galleryData = loadedGallery ? JSON.parse(loadedGallery) : initialGalleryItems
      setGalleryItems(galleryData)
      return galleryData
    }
  }

  // Fungsi untuk mengambil data review dari API
  const fetchReviewsFromAPI = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/reviews")
      if (response.ok) {
        const data = await response.json()
        setReviews(data)
        return data
      } else {
        console.error("Gagal mengambil data review dari API")
        // Fallback ke data lokal jika API gagal
        const loadedReviews = localStorage.getItem("tarumenyanReviews")
        const reviewsData = loadedReviews ? JSON.parse(loadedReviews) : initialReviews
        setReviews(reviewsData)
        return reviewsData
      }
    } catch (error) {
      console.error("Error saat mengambil data review:", error)
      // Fallback ke data lokal jika terjadi error
      const loadedReviews = localStorage.getItem("tarumenyanReviews")
      const reviewsData = loadedReviews ? JSON.parse(loadedReviews) : initialReviews
      setReviews(reviewsData)
      return reviewsData
    }
  }

  // Load data dari localStorage atau gunakan data awal
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      
      // Ambil data gallery dari API
      await fetchGalleryFromAPI()
      
      // Ambil data review dari API
      await fetchReviewsFromAPI()
      
      // Load data lain dari localStorage
      const loadedPackages = localStorage.getItem("tarumenyanPackages")
      const loadedFaq = localStorage.getItem("tarumenyanFaq")
      const loadedAbout = localStorage.getItem("tarumenyanAbout")
      
      setPackages(loadedPackages ? JSON.parse(loadedPackages) : initialPackages)
      setFaqItems(loadedFaq ? JSON.parse(loadedFaq) : initialFaqItems)
      setAboutInfo(loadedAbout ? JSON.parse(loadedAbout) : initialAboutInfo)
      setLoading(false)
    }
    
    loadData()
  }, [])

  // Fungsi untuk update gallery
  const updateGallery = async () => {
    try {
      // Ambil data terbaru dari API
      const updatedData = await fetchGalleryFromAPI()
      setGalleryItems(updatedData)
      
      // Simpan juga di localStorage sebagai cadangan
      localStorage.setItem("tarumenyanGallery", JSON.stringify(updatedData))
      
      return updatedData
    } catch (error) {
      console.error("Error saat update gallery:", error)
      return galleryItems
    }
  }

  // Fungsi untuk update packages
  const updatePackages = (newPackages) => {
    setPackages(newPackages)
    localStorage.setItem("tarumenyanPackages", JSON.stringify(newPackages))
  }

  // Fungsi untuk update FAQ
  const updateFaq = (newFaq) => {
    setFaqItems(newFaq)
    localStorage.setItem("tarumenyanFaq", JSON.stringify(newFaq))
  }

  // Fungsi untuk update reviews
  const updateReviews = async (newReviews) => {
    try {
      // Simpan di state dan localStorage
      setReviews(newReviews)
      localStorage.setItem("tarumenyanReviews", JSON.stringify(newReviews))
      
      // Ambil data terbaru dari API
      await fetchReviewsFromAPI()
      
      return newReviews
    } catch (error) {
      console.error("Error saat update reviews:", error)
      return reviews
    }
  }

  // Fungsi untuk update about info
  const updateAbout = (newAbout) => {
    setAboutInfo(newAbout)
    localStorage.setItem("tarumenyanAbout", JSON.stringify(newAbout))
  }

  // Reset data ke nilai awal (untuk demo)
  const resetData = async () => {
    // Untuk gallery, kita ambil data terbaru dari API
    await fetchGalleryFromAPI()
    
    // Reset data lain ke nilai awal
    setPackages(initialPackages)
    setFaqItems(initialFaqItems)
    setReviews(initialReviews)
    setAboutInfo(initialAboutInfo)

    // Simpan data lain di localStorage
    localStorage.setItem("tarumenyanPackages", JSON.stringify(initialPackages))
    localStorage.setItem("tarumenyanFaq", JSON.stringify(initialFaqItems))
    localStorage.setItem("tarumenyanReviews", JSON.stringify(initialReviews))
    localStorage.setItem("tarumenyanAbout", JSON.stringify(initialAboutInfo))
  }

  const value = {
    galleryItems,
    packages,
    faqItems,
    reviews,
    aboutInfo,
    loading,
    updateGallery,
    updatePackages,
    updateFaq,
    updateReviews,
    updateAbout,
    resetData,
    fetchGalleryFromAPI,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

// Custom hook untuk menggunakan data context
export const useData = () => {
  return useContext(DataContext)
}
