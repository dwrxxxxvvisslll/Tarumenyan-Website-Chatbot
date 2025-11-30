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
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("gallery")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  } catch (err) {
    console.error("Error fetching gallery:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// Add new item with image upload (Admin only)
router.post("/", authenticateToken, requireAdmin, upload.single("image"), async (req, res) => {
  const { title, category } = req.body;
  const image = req.file ? `/uploads/gallery/${path.basename(req.file.path)}` : null;

  if (!image) {
    return res.status(400).json({ error: "Image is required" });
  }

  try {
    const { data, error } = await supabase
      .from("gallery")
      .insert([
        {
          title,
          category,
          image
        }
      ])
      .select();

    if (error) {
      console.error("Insert error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json(data[0]);
  } catch (err) {
    console.error("Error creating gallery item:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// Update an item with image upload (Admin only)
router.put("/:id", authenticateToken, requireAdmin, upload.single("image"), async (req, res) => {
  const { id } = req.params;
  const { title, category } = req.body;

  try {
    // Jika ada file baru yang diupload
    if (req.file) {
      const image = `/uploads/gallery/${path.basename(req.file.path)}`;

      // Cek apakah ada gambar lama yang perlu dihapus
      const { data: existingItem, error: fetchError } = await supabase
        .from("gallery")
        .select("image")
        .eq("id", id)
        .single();

      if (fetchError) {
        console.error("Fetch error:", fetchError);
        return res.status(500).json({ error: fetchError.message });
      }

      const oldImage = existingItem?.image;
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
      const { data, error } = await supabase
        .from("gallery")
        .update({ title, category, image })
        .eq("id", id)
        .select();

      if (error) {
        console.error("Update error:", error);
        return res.status(500).json({ error: error.message });
      }

      if (!data || data.length === 0) {
        return res.status(404).json({ error: "Item not found" });
      }

      res.json(data[0]);
    } else {
      // Update tanpa mengubah gambar
      const { data, error } = await supabase
        .from("gallery")
        .update({ title, category })
        .eq("id", id)
        .select();

      if (error) {
        console.error("Update error:", error);
        return res.status(500).json({ error: error.message });
      }

      res.json({ success: true });
    }
  } catch (err) {
    console.error("Error updating gallery item:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// Delete an item (Admin only)
router.delete("/:id", authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    // Cek apakah ada gambar yang perlu dihapus
    const { data: existingItem, error: fetchError } = await supabase
      .from("gallery")
      .select("image")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error("Fetch error:", fetchError);
      return res.status(500).json({ error: fetchError.message });
    }

    const image = existingItem?.image;
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
    const { error } = await supabase
      .from("gallery")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Delete error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting gallery item:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
