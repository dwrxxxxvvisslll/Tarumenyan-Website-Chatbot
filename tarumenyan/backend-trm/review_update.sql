-- SQL untuk memperbarui tabel reviews

-- Pastikan tabel reviews sudah ada
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_name VARCHAR(100) NOT NULL,
  service_type ENUM('wedding', 'prewedding', 'other') NOT NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  image VARCHAR(255),
  location VARCHAR(100),
  date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Jika perlu mengubah nama kolom dari name menjadi customer_name
-- ALTER TABLE reviews CHANGE COLUMN name customer_name VARCHAR(100) NOT NULL;

-- Jika perlu mengubah nama kolom dari service menjadi service_type
-- ALTER TABLE reviews CHANGE COLUMN service service_type ENUM('wedding', 'prewedding', 'other') NOT NULL;

-- Pastikan direktori uploads/reviews ada
-- Catatan: Ini adalah perintah shell, bukan SQL. Jalankan secara terpisah
-- mkdir -p uploads/reviews


const initialAboutInfo = {
  story:
    "Tarumenyan didirikan pada tahun 2015 oleh Budi Santoso, seorang fotografer yang memiliki hasrat untuk mengabadikan momen-momen berharga dalam hidup. Nama 'Tarumenyan' berasal dari bahasa Sunda yang berarti 'tempat yang indah', mencerminkan filosofi kami untuk menciptakan keindahan dalam setiap karya.",
  vision: "Menjadi studio fotografi terdepan yang dikenal karena kualitas, kreativitas, dan pelayanan yang luar biasa.",
  mission:
    "Mengabadikan momen berharga dengan sentuhan artistik dan profesional, memberikan pengalaman yang personal bagi setiap klien, dan terus berinovasi dalam seni fotografi.",
  values:
    "Kualitas, kreativitas, profesionalisme, integritas, dan kepuasan klien adalah nilai-nilai utama yang kami junjung tinggi dalam setiap aspek pekerjaan kami.",

}

export const DataProvider = ({ children }) => {
  hours: "Senin - Sabtu: 09.00 - 18.00\nMinggu: Dengan janji temu,
  phone: "(022) 123-4567",
  email: "info@tarumenyan.com",ckages, setPackages] = useState([])
  const [faqItems, setFaqItems] = useState([])
  const [reviews, setReviews] = useState([])
  const [aboutInfo, setAboutInfo] = useState({})
  const [loading, setLoading] = useState(false)