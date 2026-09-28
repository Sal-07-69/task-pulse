const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Inizializza la tabella al primo avvio
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Tabella 'tasks' verificata con successo.");
  } catch (err) {
    console.error("Errore durante l'inizializzazione della tabella:", err.message);
  }
}
initDB();

// GET: Recupera tutti i task
app.get('/api/tasks', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tasks ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Errore Database GET:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST: Crea un nuovo task (ora gestisce anche la descrizione!)
app.post('/api/tasks', async (req, res) => {
  const { title, description } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  try {
    const result = await pool.query(
      'INSERT INTO tasks (title, description) VALUES ($1, $2) RETURNING *',
      [title, description || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Errore Database POST:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// DELETE: Elimina un task per ID (AGGIUNTO)
app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
    res.status(200).json({ message: 'Task eliminato con successo' });
  } catch (err) {
    console.error('Errore Database DELETE:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});