const express = require("express");
const router = express.Router();
const db = require("../db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Konfigurasi penyimpanan untuk multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const galleryDir = path.join(__dirname, "../uploads/gallery");
    if (!fs.existsSync(galleryDir)) {
      fs.mkdirSync(galleryDir, { recursive: true });
    }
    cb(null, galleryDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, "gallery-" + uniqueSuffix + ext);
  },
});

// Filter untuk hanya menerima file png, jpg, atau jpeg
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Hanya file PNG, JPG, atau JPEG yang diperbolehkan"), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter
});

// Get all gallery items
router.get("/", (req, res) => {
  db.query("SELECT * FROM gallery ORDER BY created_at DESC", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Add new item with image upload
router.post("/", upload.single("image"), (req, res) => {
  const { title, category } = req.body;
  const image = req.file ? `/uploads/gallery/${path.basename(req.file.path)}` : null;
  const created_at = new Date();
  
  if (!image) {
    return res.status(400).json({ error: "Image is required" });
  }
  
  db.query(
    "INSERT INTO gallery (title, category, image, created_at) VALUES (?, ?, ?, ?)",
    [title, category, image, created_at],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      // Return the new record
      db.query("SELECT * FROM gallery WHERE id = ?", [result.insertId], (err2, rows) => {
        if (err2) return res.status(500).json({ error: err2.message });
        res.status(201).json(rows[0]);
      });
    }
  );
});

// Update an item with image upload
router.put("/:id", upload.single("image"), (req, res) => {
  const { id } = req.params;
  const { title, category } = req.body;
  
  // Jika ada file baru yang diupload
  if (req.file) {
    const image = `/uploads/gallery/${path.basename(req.file.path)}`;
    
    // Cek apakah ada gambar lama yang perlu dihapus
    db.query("SELECT image FROM gallery WHERE id = ?", [id], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      
      const oldImage = results[0]?.image;
      if (oldImage && (oldImage.startsWith('/uploads/') || oldImage.startsWith('/assets/'))) {
        const oldImagePath = oldImage.startsWith('/uploads/') 
          ? path.join(__dirname, '..', oldImage)
          : path.join(__dirname, '../..', oldImage);
        // Hapus file lama jika ada
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      
      // Update dengan gambar baru
      db.query(
        "UPDATE gallery SET title = ?, category = ?, image = ? WHERE id = ?",
        [title, category, image, id],
        (err, result) => {
          if (err) return res.status(500).json({ error: err.message });
          if (result.affectedRows === 0) return res.status(404).json({ error: "Item not found" });
          
          // Return the updated record
          db.query("SELECT * FROM gallery WHERE id = ?", [id], (err2, rows) => {
            if (err2) return res.status(500).json({ error: err2.message });
            res.json(rows[0]);
          });
        }
      );
    });
  } else {
    // Update tanpa mengubah gambar
    db.query(
      "UPDATE gallery SET title = ?, category = ? WHERE id = ?",
      [title, category, id],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
      }
    );
  }
});

// Delete an item
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  
  // Cek apakah ada gambar yang perlu dihapus
  db.query("SELECT image FROM gallery WHERE id = ?", [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    
    const image = results[0]?.image;
    if (image) {
      let imagePath;
      if (image.startsWith('/uploads/')) {
        imagePath = path.join(__dirname, '..', image);
      } else if (image.startsWith('/assets/')) {
        imagePath = path.join(__dirname, '../..', image);
      }
      
      // Hapus file jika ada dan path valid
      if (imagePath && fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    // Hapus data dari database
    db.query("DELETE FROM gallery WHERE id = ?", [id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
  });
});

module.exports = router;
