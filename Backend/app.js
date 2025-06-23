const express = require('express');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const db = require('./db');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, '../Frontend')));
app.use(bodyParser.urlencoded({ extended: true }));

const logsDir = path.join(__dirname, './logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

function logEvent(text) {
  const logPath = path.join(logsDir, 'event.log');
  fs.appendFileSync(logPath, `${new Date().toISOString()} - ${text}\n`);
}

app.post('/api/register', async (req, res) => {
  const hashed = await bcrypt.hash(req.body.password, 10);
  db.run('INSERT INTO users (username, password_hash) VALUES (?, ?)', [req.body.username, hashed], (err) => {
    if (err) return res.status(500).send('Database error');
    logEvent(`REGISTER: ${req.body.username}`);
    res.redirect('/login.html');
  });
});

app.post('/api/login', (req, res) => {
  db.get('SELECT * FROM users WHERE username = ?', [req.body.username], async (err, row) => {
    if (err || !row) return res.status(401).send('Invalid credentials');
    const match = await bcrypt.compare(req.body.password, row.password_hash);
    if (!match) return res.status(401).send('Invalid credentials');
    logEvent(`LOGIN: ${req.body.username}`);
    res.redirect('/dashboard.html');
  });
});

app.post('/api/action', (req, res) => {
  const { item, type } = req.body;
  logEvent(`ACTION: ${type.toUpperCase()} - ${item}`);
  res.send('Action recorded');
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
