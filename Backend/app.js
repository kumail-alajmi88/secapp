const express = require('express');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const db = require('./db');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, '../Frontend')));
app.use(bodyParser.urlencoded({ extended: true }));

const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

function logEvent(text) {
  const logPath = path.join(logsDir, 'event.log');
  fs.appendFileSync(logPath, `${new Date().toISOString()} - ${text}\n`);
}

app.post('/api/register', async (req, res) => {
  const hashed = await bcrypt.hash(req.body.password, 10);
  const query = 'INSERT INTO users (username, password_hash) VALUES (?, ?)';
  db.query(query, [req.body.username, hashed], (err) => {
    if (err) return res.status(500).send('Database error');
    logEvent(`REGISTER: ${req.body.username}`);
    res.redirect('/login.html');
  });
});

app.post('/api/login', (req, res) => {
  const query = 'SELECT * FROM users WHERE username = ?';
  db.query(query, [req.body.username], async (err, results) => {
    if (err || results.length === 0) return res.status(401).send('Invalid username');
    const valid = await bcrypt.compare(req.body.password, results[0].password_hash);
    if (!valid) return res.status(401).send('Invalid password');
    logEvent(`LOGIN: ${req.body.username}`);
    res.redirect('/dashboard.html');
  });
});

app.post('/api/action', (req, res) => {
  const text = `ACTION: ${req.body.item} - ${req.body.type}`;
  logEvent(text);
  res.send('Action logged');
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
