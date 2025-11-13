"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import "./Navbar.css"
import Chatbot from "../pages/Chatbot"

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [chatAnimating, setChatAnimating] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const { currentUser, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  const handleChatClick = (e) => {
    e.preventDefault()
    setChatAnimating(true)
    setTimeout(() => {
      setChatAnimating(false)
      setIsMenuOpen(false)
      setIsChatOpen(true)
    }, 250)
  }

  const closeChat = () => {
    setIsChatOpen(false)
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <div className="logo-text">
            TARUMENYAN
            <span className="navbar-tagline">CAPTURING MOMENTS, CRAFTING MEMORIES</span>
          </div>
          <img src="/Icon_Gold.png" alt="Tarumenyan Logo" className="navbar-logo-image" />
        </Link>

        <div className="menu-icon" onClick={toggleMenu}>
          <i className={isMenuOpen ? "fas fa-times" : "fas fa-bars"} />
        </div>

        <ul className={isMenuOpen ? "nav-menu active" : "nav-menu"}>
          <li className="nav-item">
            <Link to="/gallery" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              Gallery
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/pricelist" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              Pricelist
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/review" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              Review
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/faq" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              FAQ
            </Link>
          </li>
          
          <li className="nav-item">
            <Link to="/about-us" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              About Us
            </Link>
          </li>

          {isAdmin() && (
            <li className="nav-item">
              <Link to="/admin" className="nav-link admin-link" onClick={() => setIsMenuOpen(false)}>
                Admin
              </Link>
            </li>
          )}

          {currentUser ? (
            <li className="nav-item">
              <button className="nav-link logout-button" onClick={handleLogout}>
                Logout
              </button>
            </li>
          ) : (
            <li className="nav-item">
              <Link to="/login" className="nav-link login-button" onClick={() => setIsMenuOpen(false)}>
                Login
              </Link>
            </li>
          )}
        </ul>
        <Link
          to="/chat"
          className={`floating-chat bubble-chat ${chatAnimating ? "animate" : ""}`}
          onClick={handleChatClick}
        >
          <i className="fas fa-comment-dots bubble-icon" />
          Ask Tarumenyan
        </Link>
        <div className={`chat-widget ${isChatOpen ? "open" : ""}`}>
          <div className="chat-widget-header">
            <div className="chat-title">Tarumenyan</div>
            <button className="chat-close" onClick={closeChat} aria-label="Close">
              <i className="fas fa-chevron-down" />
            </button>
          </div>
          <div className="chat-widget-body">
            <Chatbot embedded />
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
