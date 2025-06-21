const mysql = require('mysql2');
const connection = mysql.createConnection({
  host: '50.50.50.8', // ← ضع هنا IP السيرفر
  user: 'kumail',
  password: 'Alajmi0011',
  database: 'kam_db'
});

connection.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL!");
});

module.exports = connection;
