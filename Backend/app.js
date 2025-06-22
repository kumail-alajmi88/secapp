const express = require('express');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const db = require('./db');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, '../frontend')));
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
  db.query(
    'INSERT INTO users (username, password_hash) VALUES (?, ?)',
    [req.body.username, hashed],
    (err) => {
      if (err) return res.status(500).send('Database error');
      logEvent(`REGISTER - ${req.body.username}`);
      res.redirect('/login.html');
    }
  );
});

app.post('/api/login', (req, res) => {
  db.query(
    'SELECT * FROM users WHERE username = ?',
    [req.body.username],
    async (err, results) => {
      if (err || results.length === 0) return res.status(401).send('User not found');
      const user = results[0];
      const valid = await bcrypt.compare(req.body.password, user.password_hash);
      if (valid) {
        logEvent(`LOGIN - ${req.body.username}`);
        res.redirect('/dashboard.html');
      } else {
        res.status(401).send('Wrong password');
      }
    }
  );
});

app.post('/api/action', (req, res) => {
  const { item, type } = req.body;
  logEvent(`ACTION - ${type.toUpperCase()} ${item}`);
  res.send(`Action '${type}' on '${item}' recorded.`);
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
  console.log('Connected to MySQL!');
});
