Cara menjalankan : 

-- Buat database
CREATE DATABASE tarumenyan;
USE tarumenyan;

-- Tabel: users
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel: faq
CREATE TABLE faq (
  id INT PRIMARY KEY AUTO_INCREMENT,
  question TEXT NOT NULL,
  answer TEXT NOT NULL
);

-- Tabel: gallery
CREATE TABLE gallery (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  category ENUM('wedding', 'prewedding', 'lainnya') NOT NULL,
  image VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel: packages
CREATE TABLE packages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255),
  price VARCHAR(255),
  description TEXT,
  features TEXT,
  is_popular TINYINT(1) DEFAULT 0
);

-- Tabel: reviews
CREATE TABLE reviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  customer_name VARCHAR(100) NOT NULL,
  service_type ENUM('wedding', 'pre-wedding', 'lainnya') NOT NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  image VARCHAR(255),
  location VARCHAR(100),
  date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (name, email, password, role) 
VALUES ('Admin Tarumenyan', 'admin@tarumenyan.com', 'admin123', 'admin');

untuk buat role admin. bisa disesuaikan atau gunakan template saja


-- Command : 
command frontend : npm run dev
command backend : node server.js