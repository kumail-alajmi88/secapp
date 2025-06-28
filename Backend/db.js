const mysql = require('mysql2');
const connection = mysql.createConnection({
  host: '192.168.2.101', 
  user: 'kumail',
  password: 'Alajmi0011',
  database: 'kam_db'
});

connection.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL!");
});

module.exports = connection;
