const express = require("express");
const router = express.Router();
const db = require("../db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { authenticateToken, requireAdmin } = require("../middleware/auth");

// Konfigurasi penyimpanan untuk multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadsDir = path.join(__dirname, "../uploads/reviews");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, "review-" + uniqueSuffix + ext);
  },
});

const upload = multer({ storage: storage });

// Get all reviews
router.get("/", (req, res) => {
  db.query("SELECT * FROM reviews ORDER BY created_at DESC", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Add new review (Admin only)
router.post("/", authenticateToken, requireAdmin, upload.single("image"), (req, res) => {
  const { name, service, location, rating, comment, date } = req.body;
  const image = req.file ? `/uploads/reviews/${path.basename(req.file.path)}` : null;
  const created_at = new Date();
  const formattedDate = date ? new Date(date) : new Date();
  
  db.query(
    "INSERT INTO reviews (customer_name, service_type, location, rating, comment, image, date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [name, service, location, rating, comment, image, formattedDate, created_at],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      // Return the new record
      db.query("SELECT * FROM reviews WHERE id = ?", [result.insertId], (err2, rows) => {
        if (err2) return res.status(500).json({ error: err2.message });
        res.status(201).json(rows[0]);
      });
    }
  );
});

// Update a review (Admin only)
router.put("/:id", authenticateToken, requireAdmin, upload.single("image"), (req, res) => {
  const { id } = req.params;
  const { name, service, location, rating, comment, date } = req.body;
  const formattedDate = date ? new Date(date) : null;
  
  // Jika ada file baru yang diupload
  if (req.file) {
    const image = `/uploads/reviews/${path.basename(req.file.path)}`;
    
    // Cek apakah ada gambar lama yang perlu dihapus
    db.query("SELECT image FROM reviews WHERE id = ?", [id], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      
      const oldImage = results[0]?.image;
      if (oldImage && oldImage.startsWith('/uploads/')) {
        const oldImagePath = path.join(__dirname, '..', oldImage);
        // Hapus file lama jika ada
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      
      // Update dengan gambar baru
      db.query(
        "UPDATE reviews SET customer_name = ?, service_type = ?, location = ?, rating = ?, comment = ?, image = ?, date = ? WHERE id = ?",
        [name, service, location, rating, comment, image, formattedDate, id],
        (err) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ id, name, service, location, rating, comment, image });
        }
      );
    });
  } else {
    // Update tanpa mengubah gambar
    db.query(
      "UPDATE reviews SET customer_name = ?, service_type = ?, location = ?, rating = ?, comment = ?, date = ? WHERE id = ?",
      [name, service, location, rating, comment, formattedDate, id],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
      }
    );
  }
});

// Delete a review (Admin only)
router.delete("/:id", authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  
  // Cek apakah ada gambar yang perlu dihapus
  db.query("SELECT image FROM reviews WHERE id = ?", [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    
    const image = results[0]?.image;
    if (image && image.startsWith('/uploads/')) {
      const imagePath = path.join(__dirname, '..', image);
      // Hapus file jika ada
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    // Hapus data dari database
    db.query("DELETE FROM reviews WHERE id = ?", [id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
  });
});

module.exports = router;