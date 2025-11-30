const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const multer = require("multer");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Membuat direktori uploads jika belum ada
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Konfigurasi penyimpanan untuk multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({ storage: storage });

// Menyajikan file statis dari direktori uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Menyajikan file statis dari direktori uploads/documents
app.use("/documents", express.static(path.join(__dirname, "uploads/documents")));

// Menyajikan file statis dari direktori assets
app.use("/assets", express.static(path.join(__dirname, "../assets")));

const registerRoute = require("./routes/register");
app.use("/api/register", registerRoute);

const loginRoute = require("./routes/login");
app.use("/api/login", loginRoute);

const packageRoute = require("./routes/packages");
app.use("/api/packages", packageRoute);

const galleryRoute = require("./routes/gallery");
app.use("/api/gallery", galleryRoute);

const faqRouter = require('./routes/FAQ');
app.use('/api/faq', faqRouter);

// Tambahkan route untuk review
const reviewRouter = require('./routes/review');
app.use('/api/reviews', reviewRouter);

// Tambahkan route untuk chat history
const chatHistoryRouter = require('./routes/chatHistory');
app.use('/api/chat-history', chatHistoryRouter);

app.listen(3001, () => {
  console.log("Server backend running on http://localhost:3001");
});
