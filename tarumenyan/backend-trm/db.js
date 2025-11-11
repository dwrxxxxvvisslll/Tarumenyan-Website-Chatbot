const mysql = require("mysql2")
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "NotGonnaLie90",
  database: "tarumenyan",
})

connection.connect((err) => {
  if (err) {
    console.error("Database connection error:", err)
    return
  }
  console.log("Connected to MySQL database!")
})

module.exports = connection
