const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('../frontend'));

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

// ===== УТИЛИТЫ =====
function validateString(str) {
  return !!(str && typeof str === 'string' && str.trim().length > 0);
}

function isValidId(id) {
  if (!id || typeof id !== 'string') return false;
  // Только целые положительные числа, без ведущих нулей
  return /^[1-9]\d*$/.test(id);
}

// ===== ЗАКРЫТИЕ ПУЛА (ДЛЯ ТЕСТОВ) =====
async function closePool() {
  await pool.end();
}

// ----- API Routes -----
app.get('/api/notes', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM notes ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
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
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Notes API', timestamp: new Date().toISOString() });
});

module.exports = { app, db, initDB, closePool, validateString, isValidId };

if (require.main === module) {
  initDB().then(() => {
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
      console.log(`📊 Health check: http://localhost:${port}/health`);
    });
  });
}