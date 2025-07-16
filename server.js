const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const app = express();

// Serve static files from public/
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Connect to MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'Etracker',
});

db.connect((err) => {
  if (err) {
    console.error('MySQL Connection Failed:', err);
  } else {
    console.log('Connected to MySQL');
  }
});

// Insert expense
app.post('/api/expenses', (req, res) => {
  const { name, amount, category, date } = req.body;
  const sql = 'INSERT INTO expenses (name, amount, category, date) VALUES (?, ?, ?, ?)';
  db.query(sql, [name, amount, category, date], (err, result) => {
    if (err) {
      console.error('Insert failed:', err);
      res.status(500).send('Failed to insert expense');
    } else {
      res.status(200).send('Expense inserted');
    }
  });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
