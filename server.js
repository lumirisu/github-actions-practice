const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = process.env.APP_PORT || process.env.PORT || 3000;

// PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'db',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'myapp',
  user: process.env.DB_USER || 'app_user',
  password: process.env.DB_PASSWORD || 'secure_password',
});

// 1. Health check endpoint (for Criterion 4)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// 2. Database connectivity check endpoint (for Criterion 4)
app.get('/api/data', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as current_time');
    res.status(200).json({
      status: 'connected',
      db_time: result.rows[0].current_time,
      database: process.env.DB_NAME || 'myapp'
    });
  } catch (err) {
    console.error('Database connection error:', err.message);
    res.status(500).json({ error: 'Database connection failed', details: err.message });
  }
});

// 3. Items count endpoint (for Criterion 4: must return plain text count matching psql output)
app.get('/api/items/count', async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) FROM items;');
    const count = result.rows[0].count;
    res.type('text/plain').send(String(count).trim());
  } catch (err) {
    console.error('Database query error:', err.message);
    res.status(500).send('0');
  }
});

// Root info endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'CI/CD Self-Hosted Runner Full-Stack App',
    endpoints: ['/health', '/api/data', '/api/items/count']
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on port ${port}`);
});
