import "./Footer.css"
import { Link } from "react-router-dom"

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-logo">
        <img src="/Icon_Gold.png" alt="Tarumenyan Logo" className="footer-logo-image" />
          <div className="footer-text">
            <h2>TARUMENYAN</h2>
            <p>CAPTURING MOMENTS, CRAFTING MEMORIES</p>
          </div>
          
        </div>

        <div className="footer-links">
          <div className="footer-link-wrapper">
            <div className="footer-link-items">
              <h2>Pusat Informasi</h2>
              <a href="https://wa.me/6281236559230" target="_blank" rel="noopener noreferrer">
                +6281236559230
              </a>
              <a href="mailto:tarumenyanstory@gmail.com" target="_blank" rel="noopener noreferrer">
                tarumenyanstory@gmail.com
              </a>
              <a href="https://maps.app.goo.gl/n4oJS2wio9YkLEdR8" target="_blank" rel="noopener noreferrer">
                Lokasi
              </a>
            </div>
          </div>

          <div className="footer-link-wrapper">
            <div className="footer-link-items">
              <h2>Produk Lainnya</h2>
              <a href="https://www.instagram.com/tarumenyan.booth?utm_source=ig_web_button_share_sheet&igsh=b2dkdWswbTBreGRv" target="_blank" rel="noopener noreferrer">
                Tarumenyan Booth
              </a>
              <a href="https://www.instagram.com/tarumenyan.grad?utm_source=ig_web_button_share_sheet&igsh=dnRzemltZzl3Z3Rn" target="_blank" rel="noopener noreferrer">
                Tarumenyan Grad
              </a>
              <a href="https://www.instagram.com/tarumenyan.gift/?utm_source=ig_web_button_share_sheet" target="_blank" rel="noopener noreferrer">
                Tarumenyan Gift
              </a>
            </div>
          </div>
          
          <div className="footer-link-wrapper">
            <div className="footer-link-items">
              <h2>Media Sosial</h2>
              <a href="https://www.instagram.com/tarumenyan.id?utm_source=ig_web_button_share_sheet&igsh=cTlua2xqeThqdXQz" target="_blank" rel="noopener noreferrer">
                Instagram
              </a>
              <a href="https://www.tiktok.com/@tarumenyan.id" target="_blank" rel="noopener noreferrer">
                Tiktok
              </a>
              <a href="https://youtube.com/@tarumenyan?si=TP73-g7ZkSUr7u0b" target="_blank" rel="noopener noreferrer">
                You Tube
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <div className="website-rights-container">
        <small className="website-rights">TARUMENYAN © {new Date().getFullYear()} All Rights Reserved</small>
      </div>
    </footer>
  )
}

export default Footer
