import { useEffect, useMemo, useRef, useState } from "react"

const RASA_URL = import.meta.env.VITE_RASA_URL || "/api/rasa"

function uid() {
  return "tmn-" + Math.random().toString(36).slice(2, 10)
}

export default function Chatbot() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)

  const senderId = useMemo(() => {
    const existing = localStorage.getItem("rasa_sender_id")
    if (existing) return existing
    const id = uid()
    localStorage.setItem("rasa_sender_id", id)
    return id
  }, [])

  async function sendMessage(text) {
    if (!text || loading) return
    setMessages((prev) => [...prev, { from: "user", text }])
    setLoading(true)
    try {
      const res = await fetch(RASA_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender: senderId, message: text }),
      })
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
        // Jika respons tidak valid JSON, anggap tidak ada pesan balasan
        data = []
      }
      const botMsgs = (Array.isArray(data) ? data : []).map((d) => ({
        from: "bot",
        text: d.text || null,
        image: d.image,
        buttons: d.buttons || [],
        custom: d.custom || d.json_message || null,
      }))
      setMessages((prev) => [...prev, ...botMsgs])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "⚠️ Gagal menghubungi server Rasa: " + err.message },
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

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={styles.header}>
          <strong>Chat Tarumenyan</strong>
          <span style={styles.status}>{loading ? "mengetik…" : "online"}</span>
        </div>

        <div style={styles.body}>
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
        <div style={styles.note}>Server Rasa: {RASA_URL}</div>
      </div>
    </div>
  )
}

const styles = {
  wrapper: { display: "flex", justifyContent: "center", alignItems: "center", padding: "40px 16px" },
  card: { width: 560, maxWidth: "100%", border: "1px solid #e5e7eb", borderRadius: 12, boxShadow: "0 10px 25px rgba(0,0,0,0.08)", background: "#fff" },
  header: { padding: 12, borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" },
  status: { fontSize: 12, color: "#10b981" },
  body: { padding: 12, height: 360, overflowY: "auto", display: "flex", gap: 8, flexDirection: "column" },
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
