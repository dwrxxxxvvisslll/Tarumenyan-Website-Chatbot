import { useEffect, useMemo, useRef, useState } from "react"

const RASA_URL = import.meta.env.VITE_RASA_URL || "/api/rasa"
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001"

function uid() {
  return "tmn-" + Math.random().toString(36).slice(2, 10)
}

export default function Chatbot({ embedded = false }) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState("checking") // "checking" | "online" | "offline"
  const inputRef = useRef(null)
  const bodyRef = useRef(null)
  const endRef = useRef(null)
  const [stickToBottom, setStickToBottom] = useState(true)
  const retryTimeoutRef = useRef(null)

  const senderId = useMemo(() => {
    const existing = localStorage.getItem("rasa_sender_id")
    if (existing) return existing
    const id = uid()
    localStorage.setItem("rasa_sender_id", id)
    return id
  }, [])

  // Session ID untuk grouping chat history
  const sessionId = useMemo(() => {
    const existing = sessionStorage.getItem("chat_session_id")
    if (existing) return existing
    const id = `session-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
    sessionStorage.setItem("chat_session_id", id)
    return id
  }, [])

  // Save chat history to backend
  async function saveChatHistory(userMessage, botResponse, intent = null, confidence = null) {
    try {
      await fetch(`${BACKEND_URL}/api/chat-history`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          user_message: userMessage,
          bot_response: botResponse,
          intent,
          confidence
        })
      })
    } catch (err) {
      console.warn("Failed to save chat history:", err)
      // Silently fail - tidak mengganggu user experience
    }
  }

  // Health check ke Rasa server
  async function checkRasaHealth() {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 detik timeout

      const res = await fetch(RASA_URL.replace('/webhooks/rest/webhook', '') + '/status', {
        method: 'GET',
        signal: controller.signal
      })
      clearTimeout(timeoutId)

      if (res.ok) {
        setConnectionStatus("online")
        return true
      } else {
        setConnectionStatus("offline")
        return false
      }
    } catch (err) {
      console.warn("Rasa health check failed:", err.message)
      setConnectionStatus("offline")
      return false
    }
  }

  // Retry health check otomatis
  useEffect(() => {
    checkRasaHealth()

    const interval = setInterval(() => {
      if (connectionStatus === "offline") {
        checkRasaHealth()
      }
    }, 10000) // Check setiap 10 detik jika offline

    return () => clearInterval(interval)
  }, [connectionStatus])

  async function sendMessage(text, retryCount = 0) {
    if (!text || loading) return

    // Jangan kirim jika offline dan bukan retry
    if (connectionStatus === "offline" && retryCount === 0) {
      setMessages((prev) => [
        ...prev,
        { from: "user", text },
        { from: "bot", text: "⚠️ Koneksi ke Rasa server terputus. Mencoba reconnect..." },
      ])

      // Coba reconnect
      const isOnline = await checkRasaHealth()
      if (isOnline) {
        // Retry kirim message
        return sendMessage(text, 1)
      } else {
        setMessages((prev) => [
          ...prev,
          { from: "bot", text: "❌ Server Rasa tidak tersedia. Silakan restart server atau refresh halaman." },
        ])
        return
      }
    }

    if (retryCount === 0) {
      setMessages((prev) => [...prev, { from: "user", text }])
    }

    setLoading(true)

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 detik timeout

      const res = await fetch(RASA_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender: senderId, message: text }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`)
      }

      // Robust parsing: handle 204/empty body and non-JSON gracefully
      let data = []
      try {
        if (res.status === 204) {
          data = []
        } else {
          const raw = await res.text()
          data = raw ? JSON.parse(raw) : []
        }
      } catch (parseErr) {
        console.warn("Parse error:", parseErr)
        data = []
      }

      const botMsgs = (Array.isArray(data) ? data : []).map((d) => ({
        from: "bot",
        text: d.text || null,
        image: d.image,
        buttons: d.buttons || [],
        custom: d.custom || d.json_message || null,
      }))

      if (botMsgs.length === 0) {
        // Jika tidak ada response, tampilkan fallback
        botMsgs.push({
          from: "bot",
          text: "Maaf, saya tidak memahami pesan tersebut. Coba ketik 'help' untuk melihat panduan."
        })
      }

      setMessages((prev) => [...prev, ...botMsgs])
      setConnectionStatus("online") // Mark as online jika berhasil

      // Save chat history (ambil response pertama sebagai representasi)
      const botResponseText = botMsgs.map(m => m.text).filter(Boolean).join(" | ")
      const intent = data[0]?.metadata?.intent_name || null
      const confidence = data[0]?.metadata?.confidence || null
      saveChatHistory(text, botResponseText, intent, confidence)

    } catch (err) {
      console.error("Send message error:", err)

      // Jika timeout atau network error, coba retry
      if ((err.name === 'AbortError' || err.message.includes('fetch')) && retryCount < 2) {
        setMessages((prev) => [
          ...prev,
          { from: "bot", text: `⚠️ Timeout. Mencoba ulang (${retryCount + 1}/2)...` },
        ])

        // Wait 2 detik lalu retry
        await new Promise(resolve => setTimeout(resolve, 2000))
        return sendMessage(text, retryCount + 1)
      }

      // Gagal setelah retry
      setConnectionStatus("offline")
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: `❌ Gagal menghubungi Rasa server: ${err.message}\n\nSolusi:\n1. Pastikan Rasa server running\n2. Refresh halaman (F5)\n3. Restart Rasa: rasa run --enable-api --cors "*"` },
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // salam awal
    if (messages.length === 0) {
      setMessages([{ from: "bot", text: "Halo! Saya asisten Tarumenyan. Ketik pesan Anda di bawah." }])
    }
  }, [])

  useEffect(() => {
    const el = bodyRef.current
    if (!el) return
    if (stickToBottom) {
      endRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, stickToBottom])

  function handleScroll() {
    const el = bodyRef.current
    if (!el) return
    const gap = el.scrollHeight - el.scrollTop - el.clientHeight
    setStickToBottom(gap < 24)
  }

  const styles = {
    wrapper: embedded
      ? { height: "100%", padding: 0, display: "flex", flexDirection: "column" }
      : { display: "flex", justifyContent: "center", alignItems: "center", padding: "40px 16px" },
    card: embedded
      ? { width: "100%", height: "100%", border: "none", borderRadius: 0, boxShadow: "none", background: "#fff", display: "flex", flexDirection: "column" }
      : { width: 560, maxWidth: "100%", border: "1px solid #e5e7eb", borderRadius: 12, boxShadow: "0 10px 25px rgba(0,0,0,0.08)", background: "#fff", display: "flex", flexDirection: "column" },
    header: { padding: 12, borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" },
    status: { fontSize: 12, display: "flex", alignItems: "center", gap: 6 },
    statusDot: (status) => ({
      width: 8,
      height: 8,
      borderRadius: "50%",
      background: status === "online" ? "#10b981" : status === "offline" ? "#ef4444" : "#f59e0b",
      animation: status === "checking" ? "pulse 2s infinite" : "none"
    }),
    body: embedded
      ? { padding: 12, display: "flex", gap: 8, flexDirection: "column", flex: 1, minHeight: 0, overflowY: "auto", overscrollBehavior: "contain", WebkitOverflowScrolling: "touch" }
      : { padding: 12, height: 360, overflowY: "auto", display: "flex", gap: 8, flexDirection: "column", overscrollBehavior: "contain", WebkitOverflowScrolling: "touch" },
    msg: { padding: "8px 12px", borderRadius: 12, maxWidth: "85%" },
    user: { alignSelf: "flex-end", background: "#dbeafe" },
    bot: { alignSelf: "flex-start", background: "#f3f4f6" },
    footer: { display: "flex", gap: 8, padding: 12, borderTop: "1px solid #eee" },
    input: { flex: 1, padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd" },
    button: { padding: "10px 16px", borderRadius: 8, border: "none", background: "#2563eb", color: "white", cursor: "pointer" },
    note: { padding: "0 12px 12px", fontSize: 12, color: "#6b7280" },
    buttons: { display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" },
    quickButton: { padding: "6px 10px", borderRadius: 6, border: "1px solid #ddd", background: "#fff", cursor: "pointer" },
    cardBox: { marginTop: 10, padding: 10, border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff" },
    cardTitle: { fontWeight: 600, marginBottom: 6 },
    cardSection: { marginBottom: 6 },
    cardDetails: { marginTop: 6 },
    ctaLink: { display: "inline-block", marginTop: 8, color: "#2563eb" },
    storyCard: { marginTop: 10, padding: 8, border: "1px dashed #d1d5db", borderRadius: 8 },
    storyTitle: { fontWeight: 600, marginBottom: 4 },
    storySource: { color: "#6b7280", marginTop: 4 },
    storyActions: { display: "flex", gap: 8, marginTop: 8 },
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        {!embedded && (
          <div style={styles.header}>
            <strong>Chat Tarumenyan</strong>
            <div style={styles.status}>
              <span style={styles.statusDot(connectionStatus)} />
              <span style={{ color: connectionStatus === "online" ? "#10b981" : connectionStatus === "offline" ? "#ef4444" : "#f59e0b" }}>
                {loading ? "mengetik…" : connectionStatus === "checking" ? "connecting..." : connectionStatus === "online" ? "online" : "offline"}
              </span>
            </div>
          </div>
        )}

        <div style={styles.body} ref={bodyRef} onScroll={handleScroll}>
          {/* Spacer untuk push messages ke bottom saat masih sedikit */}
          <div style={{ flex: 1, minHeight: 0 }} />
          {messages.map((m, i) => (
            <div key={i} style={{ ...styles.msg, ...(m.from === "user" ? styles.user : styles.bot) }}>
              {m.image && <img src={m.image} alt="bot-image" style={{ maxWidth: "100%", borderRadius: 8 }} />}
              {m.text && <span>{m.text}</span>}

              {/* Render tombol cepat dari Rasa */}
              {m.buttons && m.buttons.length > 0 && (
                <div style={styles.buttons}>
                  {m.buttons.map((b, bi) => (
                    <button
                      key={bi}
                      style={styles.quickButton}
                      onClick={() => sendMessage(b.payload || b.title)}
                    >
                      {b.title}
                    </button>
                  ))}
                </div>
              )}

          {/* Render kartu custom detail konsep */}
          {m.custom && m.custom.type === "konsep_detail" && (
            <div style={styles.cardBox}>
              <div style={styles.cardTitle}>{m.custom.title}</div>
              {m.custom.legend_summary && (
                <div style={styles.cardSection}><strong>Ringkasan legenda:</strong> {m.custom.legend_summary}</div>
              )}
              <div style={styles.cardSection}><strong>Filosofi:</strong> {m.custom.philosophy}</div>
              <div style={styles.cardSection}><strong>Lokasi:</strong> {(m.custom.locations || []).join(", ")}</div>
              <div style={styles.cardSection}><strong>Paket direkomendasikan:</strong> {m.custom.recommended_package}</div>
              <details style={styles.cardDetails}>
                <summary>Lihat semua paket</summary>
                <ul>
                  {m.custom.packages && Object.entries(m.custom.packages).map(([k, v]) => (
                    <li key={k}>{v}</li>
                  ))}
                </ul>
              </details>
              {m.custom.cta && (
                <a href={m.custom.cta.href} target="_blank" rel="noreferrer" style={styles.ctaLink}>
                  {m.custom.cta.text}
                </a>
              )}
            </div>
          )}

          {/* Render daftar kisah Bali untuk inspirasi tema */}
          {m.custom && m.custom.type === "kisah_bali" && (
            <div style={styles.cardBox}>
              <div style={styles.cardTitle}>{m.custom.title}</div>
              {(m.custom.stories || []).map((s) => (
                <div key={s.id} style={styles.storyCard}>
                  <div style={styles.storyTitle}>{s.title}</div>
                  {s.summary && <div style={styles.cardSection}>{s.summary}</div>}
                  {s.source && <div style={styles.storySource}><small>Sumber: {s.source}</small></div>}
                  <div style={styles.storyActions}>
                    <button
                      style={styles.quickButton}
                      onClick={() => sendMessage(`/kisah_cinta_bali{"kisah_id":"${s.id}"}`)}
                    >
                      Pilih kisah ini
                    </button>
                    <button
                      style={styles.quickButton}
                      onClick={() => sendMessage(`/rekomendasi_dari_kisah{"kisah_id":"${s.id}"}`)}
                    >
                      {m.custom.cta?.text || "Rekomendasikan tema"}
                    </button>
                  </div>
                </div>
              ))}

              {m.custom.suggestions && m.custom.suggestions.length > 0 && (
                <div style={styles.buttons}>
                  {m.custom.suggestions.map((sg, si) => (
                    <button
                      key={si}
                      style={styles.quickButton}
                      onClick={() => sendMessage(sg.payload || sg.title)}
                    >
                      {sg.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
            </div>
          ))}
          <div ref={endRef} />
        </div>

        <form
          style={styles.footer}
          onSubmit={(e) => {
            e.preventDefault()
            const text = inputRef.current?.value?.trim()
            if (text) {
              sendMessage(text)
              inputRef.current.value = ""
            }
          }}
        >
          <input ref={inputRef} placeholder="Ketik pesan…" style={styles.input} />
          <button type="submit" style={styles.button} disabled={loading}>
            Kirim
          </button>
        </form>
        {!embedded && <div style={styles.note}>Server Rasa: {RASA_URL}</div>}
      </div>
    </div>
  )
}
