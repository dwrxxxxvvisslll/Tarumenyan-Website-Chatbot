"use client"

import { useData } from "../context/DataContext"
import "./Pricelist.css"

function Pricelist() {
  const { packages } = useData()

  const handleWhatsAppOrder = (packageName) => {
    // Nomor WhatsApp Tarumenyan (ganti dengan nomor yang sebenarnya)
    const phoneNumber = "6281236559230"
    const message = `Halo, saya tertarik dengan paket '${packageName}' dan ingin mendapatkan informasi lebih lanjut.`

    // Buat URL WhatsApp dengan nomor dan pesan
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`

    // Buka WhatsApp di tab baru
    window.open(whatsappUrl, "_blank")
  }

  return (
    <div className="pricelist-page">
      <div className="pricelist-header">
        <h1>Daftar Harga</h1>
        <p>Pilih paket yang sesuai dengan kebutuhan Anda</p>
      </div>

      <div className="pricelist-container">
        {packages.map((pkg) => (
          <div key={pkg.id} className={`price-card ${pkg.popular ? "popular" : ""}`}>
            {pkg.popular && <div className="popular-tag">Paling Populer</div>}
            <h2>{pkg.name}</h2>
            <div className="price">{pkg.price}</div>
            <p className="description">{pkg.description}</p>
            <ul className="features">
              {pkg.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
            <button className="book-btn whatsapp-btn" onClick={() => handleWhatsAppOrder(pkg.name)}>
              <i className="fab fa-whatsapp"></i> Pesan via WhatsApp
            </button>
          </div>
        ))}
      </div>

      <div className="custom-package">
        <h2>Butuh Paket Khusus?</h2>
        <p>Kami dapat menyesuaikan paket sesuai dengan kebutuhan spesifik Anda</p>
        <div className="custom-package-buttons" style={{
          display: 'flex', 
          justifyContent: 'space-around', 
          alignItems: 'center', 
          gap: '1rem',
          flexWrap: 'wrap',
          margin: '1rem 0'
        }}>
          <a href="../../Tarumenyan Pricelist 2025.pdf" target="_blank" className="contact-btn pdf-btn" style={{ textDecoration: 'none' }}>
            <i className="fas fa-file-pdf"></i> Buka Pricelist Lainnya
          </a>
          <button 
            className="contact-btn whatsapp-btn" 
            onClick={() => {
              const phoneNumber = "6281236559230"
              const message = "halo! saya ingin konsultasi paket."
              const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
              window.open(whatsappUrl, "_blank")
            }}
          >
            <i className="fab fa-whatsapp"></i> Konsultasi via WhatsApp
          </button>
        </div>
      </div>

      <div className="additional-info">
        <h3>HOW TO BOOK</h3>
        <ul>
          <li>Pilih paket dokumentasi yang paling pas dan sesuai dengan acara yang akan dilaksanakan.</li>
          <li>Hubungi kami via WhatsApp dengan klik "Pesan via WhatsApp" serta ceritakan sedikit tentang acara yang akan dilaksanakan.</li>
          <li>Klien mengisi formulir pendataan. (akan dijelaskan lebih lanjut oleh admin via WhatsApp)</li>
          <li>Pembayaran uang muka sebesar 50% untuk konfirmasi pemesanan atau dapat langsung melakukan pelunasan.</li>
          <li>invoice akan dikirimkan setelah klien melakukan payment DP atau pelunasan. </li>
          <li>pelunasan dibayar paling lambat H+3 setelah acara apabila baru melakukan DP sebesar 50% di awal. </li>
          <li>Di hari spesialmu, kami siap menangkap setiap momen berharga yang akan terjadi nanti.</li>
        </ul>
      </div>
    </div>
  )
}

export default Pricelist
