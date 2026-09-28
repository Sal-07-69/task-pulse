require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

app.use(cors());
app.use(express.json());

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

// Inizializza la tabella al primo avvio
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Tabella 'tasks' verificata/creata con successo.");
  } catch (err) {
    console.error("Errore creazione tabella:", err.message);
  }
}
initDB();

app.get('/', (req, res) => {
  res.send('Backend Task-Pulse attivo e connesso a PostgreSQL! 🚀');
});

// Ottieni tutte le task
app.get('/api/tasks', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tasks ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Errore Database:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Crea una task
app.post('/api/tasks', async (req, res) => {
  const { title, description } = req.body;
  if (!title) return res.status(400).json({ error: 'Il titolo è obbligatorio' });
  try {
    const result = await pool.query(
      'INSERT INTO tasks (title, description) VALUES ($1, $2) RETURNING *',
      [title, description || '']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Errore Database:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Elimina una task
app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
    res.json({ message: 'Task eliminata con successo' });
  } catch (err) {
    console.error('Errore Database:', err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server avviato sulla porta ${PORT}`);
});