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
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  } catch (err) {
    console.error("Error fetching reviews:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// Add new review (Admin only)
router.post("/", authenticateToken, requireAdmin, upload.single("image"), async (req, res) => {
  const { name, service, location, rating, comment, date } = req.body;
  const image = req.file ? `/uploads/reviews/${path.basename(req.file.path)}` : null;
  const formattedDate = date ? new Date(date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

  try {
    const { data, error } = await supabase
      .from("reviews")
      .insert([
        {
          customer_name: name,
          service_type: service,
          location,
          rating: parseInt(rating),
          comment,
          image,
          date: formattedDate
        }
      ])
      .select();

    if (error) {
      console.error("Insert error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json(data[0]);
  } catch (err) {
    console.error("Error creating review:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// Update a review (Admin only)
router.put("/:id", authenticateToken, requireAdmin, upload.single("image"), async (req, res) => {
  const { id } = req.params;
  const { name, service, location, rating, comment, date } = req.body;
  const formattedDate = date ? new Date(date).toISOString().split('T')[0] : null;

  try {
    // Jika ada file baru yang diupload
    if (req.file) {
      const image = `/uploads/reviews/${path.basename(req.file.path)}`;

      // Cek apakah ada gambar lama yang perlu dihapus
      const { data: existingReview, error: fetchError } = await supabase
        .from("reviews")
        .select("image")
        .eq("id", id)
        .single();

      if (fetchError) {
        console.error("Fetch error:", fetchError);
        return res.status(500).json({ error: fetchError.message });
      }

      const oldImage = existingReview?.image;
      if (oldImage && oldImage.startsWith('/uploads/')) {
        const oldImagePath = path.join(__dirname, '..', oldImage);
        // Hapus file lama jika ada
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      // Update dengan gambar baru
      const { data, error } = await supabase
        .from("reviews")
        .update({
          customer_name: name,
          service_type: service,
          location,
          rating: parseInt(rating),
          comment,
          image,
          date: formattedDate
        })
        .eq("id", id)
        .select();

      if (error) {
        console.error("Update error:", error);
        return res.status(500).json({ error: error.message });
      }

      res.json(data[0]);
    } else {
      // Update tanpa mengubah gambar
      const { data, error } = await supabase
        .from("reviews")
        .update({
          customer_name: name,
          service_type: service,
          location,
          rating: parseInt(rating),
          comment,
          date: formattedDate
        })
        .eq("id", id)
        .select();

      if (error) {
        console.error("Update error:", error);
        return res.status(500).json({ error: error.message });
      }

      res.json({ success: true });
    }
  } catch (err) {
    console.error("Error updating review:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// Delete a review (Admin only)
router.delete("/:id", authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    // Cek apakah ada gambar yang perlu dihapus
    const { data: existingReview, error: fetchError } = await supabase
      .from("reviews")
      .select("image")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error("Fetch error:", fetchError);
      return res.status(500).json({ error: fetchError.message });
    }

    const image = existingReview?.image;
    if (image && image.startsWith('/uploads/')) {
      const imagePath = path.join(__dirname, '..', image);
      // Hapus file jika ada
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Hapus data dari database
    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Delete error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting review:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
