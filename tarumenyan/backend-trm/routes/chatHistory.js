const express = require("express");
const router = express.Router();
const supabase = require("../db");
const { authenticateToken, requireAdmin } = require("../middleware/auth");

// Save chat message (Public - anyone can save)
router.post("/", async (req, res) => {
  const {
    session_id,
    user_message,
    bot_response,
    intent,
    confidence,
    user_ip,
    user_agent
  } = req.body;

  // Validation
  if (!session_id || !user_message || !bot_response) {
    return res.status(400).json({
      error: "session_id, user_message, and bot_response are required"
    });
  }

  try {
    const { data, error } = await supabase
      .from("chat_history")
      .insert([
        {
          session_id,
          user_message,
          bot_response,
          intent: intent || null,
          confidence: confidence || null,
          user_ip: user_ip || req.ip || req.headers['x-forwarded-for'] || null,
          user_agent: user_agent || req.headers['user-agent'] || null
        }
      ])
      .select();

    if (error) {
      console.error("Insert error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json({ success: true, data: data[0] });
  } catch (err) {
    console.error("Error saving chat history:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// Get chat history by session (Public - anyone can view their session)
router.get("/session/:session_id", async (req, res) => {
  const { session_id } = req.params;

  try {
    const { data, error } = await supabase
      .from("chat_history")
      .select("*")
      .eq("session_id", session_id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Fetch error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  } catch (err) {
    console.error("Error fetching session history:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// Get all chat history (Admin only)
router.get("/all", authenticateToken, requireAdmin, async (req, res) => {
  const { limit = 100, offset = 0 } = req.query;

  try {
    const { data, error } = await supabase
      .from("chat_history")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Fetch error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  } catch (err) {
    console.error("Error fetching all chat history:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// Get chat analytics (Admin only)
router.get("/analytics", authenticateToken, requireAdmin, async (req, res) => {
  const { days = 7 } = req.query;

  try {
    // Get total messages
    const { count: totalMessages, error: countError } = await supabase
      .from("chat_history")
      .select("*", { count: "exact", head: true })
      .gte("created_at", new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());

    if (countError) throw countError;

    // Get unique sessions
    const { data: sessions, error: sessionsError } = await supabase
      .from("chat_history")
      .select("session_id")
      .gte("created_at", new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());

    if (sessionsError) throw sessionsError;

    const uniqueSessions = new Set(sessions.map(s => s.session_id)).size;

    // Get top intents
    const { data: intents, error: intentsError } = await supabase
      .from("chat_history")
      .select("intent")
      .gte("created_at", new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .not("intent", "is", null);

    if (intentsError) throw intentsError;

    // Count intents
    const intentCounts = {};
    intents.forEach(item => {
      intentCounts[item.intent] = (intentCounts[item.intent] || 0) + 1;
    });

    const topIntents = Object.entries(intentCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([intent, count]) => ({ intent, count }));

    res.json({
      period_days: parseInt(days),
      total_messages: totalMessages || 0,
      unique_sessions: uniqueSessions,
      avg_messages_per_session: uniqueSessions > 0 ? (totalMessages / uniqueSessions).toFixed(2) : 0,
      top_intents: topIntents
    });
  } catch (err) {
    console.error("Error fetching analytics:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// Delete old chat history (Admin only)
router.delete("/cleanup/:days", authenticateToken, requireAdmin, async (req, res) => {
  const { days } = req.params;
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  try {
    const { error } = await supabase
      .from("chat_history")
      .delete()
      .lt("created_at", cutoffDate);

    if (error) {
      console.error("Delete error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ success: true, message: `Deleted chats older than ${days} days` });
  } catch (err) {
    console.error("Error deleting old chat history:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
