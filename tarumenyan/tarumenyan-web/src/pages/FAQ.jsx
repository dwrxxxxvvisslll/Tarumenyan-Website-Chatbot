"use client"

import { useState } from "react"
import { useData } from "../context/DataContext"
import "./FAQ.css"

function FAQ() {
  const [activeIndex, setActiveIndex] = useState(null)
  const { faqItems } = useData()

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index)
  }

  return (
    <div className="faq-page">
      <div className="faq-header">
        <h1>Pertanyaan yang Sering Diajukan</h1>
      </div>

      <div className="faq-container">
        <div className="faq-accordion">
          {faqItems.map((item, index) => (
            <div key={item.id} className={`faq-item ${activeIndex === index ? "active" : ""}`}>
              <div className="faq-question" onClick={() => toggleAccordion(index)}>
                <h3>{item.question}</h3>
                <span className="faq-icon">{activeIndex === index ? "−" : "+"}</span>
              </div>
              <div className={`faq-answer ${activeIndex === index ? "show" : ""}`}>
                <p>{item.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="contact-section">
        <h2>Masih Punya Pertanyaan?</h2>
        <p>Jika Anda tidak menemukan jawaban yang Anda cari, jangan ragu untuk menghubungi kami</p>
        <div className="contact-buttons">
          <a 
            href="https://wa.me/6281236559230" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="contact-btn primary"
          >
            Hubungi Kami
          </a>
          <a 
            href="mailto:tarumenyanstory@gmail.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="contact-btn secondary"
          >
            Kirim Email
          </a>
        </div>
      </div>
    </div>
  )
}

export default FAQ
