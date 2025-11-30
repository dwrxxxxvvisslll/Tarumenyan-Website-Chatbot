const express = require("express");
const router = express.Router();
const supabase = require("../db");
const { authenticateToken, requireAdmin } = require("../middleware/auth");

// Get all FAQ items
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("faq")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  } catch (err) {
    console.error("Error fetching FAQ:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// Add a new FAQ (Admin only)
router.post("/", authenticateToken, requireAdmin, async (req, res) => {
  const { question, answer } = req.body;

  try {
    const { data, error } = await supabase
      .from("faq")
      .insert([{ question, answer }])
      .select();

    if (error) {
      console.error("Insert error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json(data[0]);
  } catch (err) {
    console.error("Error creating FAQ:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// Update an existing FAQ (Admin only)
router.put("/:id", authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { question, answer } = req.body;

  try {
    const { error } = await supabase
      .from("faq")
      .update({ question, answer })
      .eq("id", id);

    if (error) {
      console.error("Update error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Error updating FAQ:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// Delete a FAQ (Admin only)
router.delete("/:id", authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const { error } = await supabase
      .from("faq")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Delete error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting FAQ:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
