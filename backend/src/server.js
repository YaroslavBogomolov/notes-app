const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const frontendPath = path.join(__dirname, '../../frontend');
console.log(`📁 Frontend path: ${frontendPath}`);

app.use(express.static(frontendPath));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const db = {
  async query(text, params) {
    return pool.query(text, params);
  }
};

async function initDB() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS notes (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Database initialized');
  } catch (error) {
    console.error('Database error:', error);
  }
}

function validateString(str) {
  return !!(str && typeof str === 'string' && str.trim().length > 0);
}

function isValidId(id) {
  if (!id || typeof id !== 'string') return false;
  return /^[1-9]\d*$/.test(id);
}

async function closePool() {
  await pool.end();
}

app.get('/debug', (req, res) => {
  const indexPath = path.join(frontendPath, 'index.html');
  const cssPath = path.join(frontendPath, 'css', 'style.css');
  const jsPath = path.join(frontendPath, 'js', 'app.js');
  
  const files = fs.existsSync(frontendPath) ? fs.readdirSync(frontendPath) : [];
  const cssFiles = fs.existsSync(path.join(frontendPath, 'css')) 
    ? fs.readdirSync(path.join(frontendPath, 'css')) 
    : [];
  const jsFiles = fs.existsSync(path.join(frontendPath, 'js')) 
    ? fs.readdirSync(path.join(frontendPath, 'js')) 
    : [];

  res.json({
    frontendPath,
    indexPathExists: fs.existsSync(indexPath),
    cssPathExists: fs.existsSync(cssPath),
    jsPathExists: fs.existsSync(jsPath),
    frontendFiles: files,
    cssFiles,
    jsFiles,
    cwd: process.cwd(),
    __dirname
  });
});

app.get('/api/notes', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM notes ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('GET /api/notes error:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

app.post('/api/notes', async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!validateString(title)) {
      return res.status(400).json({ error: 'Title is required' });
    }
    const result = await db.query(
      'INSERT INTO notes (title, content) VALUES ($1, $2) RETURNING *',
      [title.trim(), content || '']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('POST /api/notes error:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

app.delete('/api/notes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ error: 'Invalid note ID' });
    }
    const result = await db.query('DELETE FROM notes WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('DELETE /api/notes/:id error:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

app.get('/health', (req, res) => {
  console.log(`🩺 Health check received at ${new Date().toISOString()} from ${req.ip}`);
  res.status(200).json({
    status: 'OK',
    service: 'Notes API',
    timestamp: new Date().toISOString()
  });
});

app.get('*', (req, res) => {
  if (req.path.startsWith('/api/') || req.path === '/health' || req.path === '/debug') {
    return res.status(404).json({ error: 'Not found' });
  }
  
  const indexPath = path.join(frontendPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Frontend not found. Please check deployment.');
  }
});

module.exports = { app, db, initDB, closePool, validateString, isValidId };

if (require.main === module) {
  initDB().then(() => {
    app.listen(port, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${port}`);
      console.log(`📊 Health check: http://localhost:${port}/health`);
      console.log(`📁 Serving static files from: ${frontendPath}`);
    });
  });
}