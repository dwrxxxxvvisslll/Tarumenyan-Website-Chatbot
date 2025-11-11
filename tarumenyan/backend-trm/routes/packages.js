const express = require("express");
const router = express.Router();
const db = require("../db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Konfigurasi penyimpanan untuk multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadsDir = path.join(__dirname, "../uploads/documents");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Simpan dengan nama yang tetap untuk pricelist
    cb(null, "Tarumenyan Pricelist.pdf");
  },
});

const upload = multer({ storage: storage });

// Get all packages
router.get("/", (req, res) => {
  db.query("SELECT * FROM packages", (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    const formatted = results.map((pkg) => ({
      id: pkg.id,
      name: pkg.name,
      price: pkg.price,
      description: pkg.description,
      features: pkg.features ? JSON.parse(pkg.features) : [],
      popular: !!pkg.is_popular,
    }));

    res.json(formatted);
  });
});

// Add new package
router.post("/", (req, res) => {
  console.log("BODY DITERIMA:", req.body); // Tambahan log

  const { name, price, description, features } = req.body;
const popular = req.body.popular ?? false;

  const query = `
    INSERT INTO packages (name, price, description, features, is_popular)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.query(
    query,
    [name, price, description, JSON.stringify(features), popular ? 1 : 0],
    (err, result) => {
      if (err) {
        console.error("Error inserting package:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json({ success: true, id: result.insertId });
    }
  );
});

// Edit package
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { name, price, description, features } = req.body;
  const popular = req.body.popular ?? false;

  const query = `
    UPDATE packages
    SET name = ?, price = ?, description = ?, features = ?, is_popular = ?
    WHERE id = ?
  `;
  db.query(
    query,
    [name, price, description, JSON.stringify(features), popular ? 1 : 0, id],
    (err) => {
      if (err) {
        console.error("Error updating package:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json({ success: true });
    }
  );
});

// Delete package
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM packages WHERE id = ?", [id], (err) => {
    if (err) {
      console.error("Error deleting package:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ success: true });
  });
});

// Upload pricelist PDF
router.post("/upload-pdf", upload.single("pricelist"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: "Tidak ada file yang diunggah" });
  }
  
  // Salin file ke direktori publik agar bisa diakses dari frontend
  const publicDir = path.join(__dirname, "../../tarumenyan-web/public");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  const sourcePath = req.file.path;
  const destPath = path.join(publicDir, "Tarumenyan Pricelist 2025.pdf");
  
  fs.copyFile(sourcePath, destPath, (err) => {
    if (err) {
      console.error("Error copying file:", err);
      return res.status(500).json({ success: false, error: "Gagal menyalin file" });
    }
    
    res.json({ success: true, message: "File berhasil diunggah" });
  });
});

module.exports = router;
