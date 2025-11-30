const express = require("express");
const router = express.Router();
const supabase = require("../db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { authenticateToken, requireAdmin } = require("../middleware/auth");

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
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("packages")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Database error" });
    }

    const formatted = data.map((pkg) => ({
      id: pkg.id,
      name: pkg.name,
      price: pkg.price,
      description: pkg.description,
      features: pkg.features || [],
      popular: !!pkg.popular,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Error fetching packages:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// Add new package (Admin only)
router.post("/", authenticateToken, requireAdmin, async (req, res) => {
  const { name, price, description, features } = req.body;
  const popular = req.body.popular ?? false;

  try {
    const { data, error } = await supabase
      .from("packages")
      .insert([
        {
          name,
          price,
          description,
          features: features || [],
          popular
        }
      ])
      .select();

    if (error) {
      console.error("Error inserting package:", error);
      return res.status(500).json({ error: "Database error" });
    }

    res.json({ success: true, id: data[0].id });
  } catch (err) {
    console.error("Error creating package:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// Edit package (Admin only)
router.put("/:id", authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, price, description, features } = req.body;
  const popular = req.body.popular ?? false;

  try {
    const { error } = await supabase
      .from("packages")
      .update({
        name,
        price,
        description,
        features: features || [],
        popular
      })
      .eq("id", id);

    if (error) {
      console.error("Error updating package:", error);
      return res.status(500).json({ error: "Database error" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Error updating package:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// Delete package (Admin only)
router.delete("/:id", authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const { error } = await supabase
      .from("packages")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting package:", error);
      return res.status(500).json({ error: "Database error" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting package:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// Upload pricelist PDF (Admin only)
router.post("/upload-pdf", authenticateToken, requireAdmin, upload.single("pricelist"), (req, res) => {
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
