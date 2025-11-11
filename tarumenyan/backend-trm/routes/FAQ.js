const express = require("express");
const router = express.Router();
const db = require("../db");

// Get all FAQ items
router.get("/", (req, res) => {
  db.query("SELECT * FROM faq", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Add a new FAQ
router.post("/", (req, res) => {
  const { question, answer } = req.body;
  db.query(
    "INSERT INTO faq (question, answer) VALUES (?, ?)",
    [question, answer],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: result.insertId, question, answer });
    }
  );
});

// Update an existing FAQ
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { question, answer } = req.body;
  db.query(
    "UPDATE faq SET question = ?, answer = ? WHERE id = ?",
    [question, answer, id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

// Delete a FAQ
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM faq WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

module.exports = router;
