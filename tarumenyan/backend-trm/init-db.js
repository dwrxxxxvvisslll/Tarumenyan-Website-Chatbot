const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');

// Baca file skema SQL
const schemaSQL = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

// Buat koneksi ke MySQL
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'NotGonnaLie90',
  multipleStatements: true // Penting untuk menjalankan multiple SQL statements
});
  
// Jalankan skema SQL
connection.query(schemaSQL, (err, results) => {
  if (err) {
    console.error('Error menjalankan skema SQL:', err);
    process.exit(1);
  }
  
  console.log('Skema database berhasil dibuat!');
  console.log('Hasil:', results);
  
  // Tutup koneksi
  connection.end((err) => {
    if (err) {
      console.error('Error menutup koneksi:', err);
      process.exit(1);
    }
    console.log('Koneksi database ditutup.');
    process.exit(0);
  });
});