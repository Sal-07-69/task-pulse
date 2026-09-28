import React, { useState, useEffect } from 'react';

// URL CORRETTO del tuo backend su Render
const API_URL = 'https://task-pulse-isdu.onrender.com';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchTasks = async () => {
    try {
      const res = await fetch(`${API_URL}/api/tasks`);
      const data = await res.json();
      if (Array.isArray(data)) setTasks(data);
    } catch (err) {
      console.error('Errore nel recupero task:', err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description })
      });
      if (res.ok) {
        setTitle('');
        setDescription('');
        fetchTasks();
      }
    } catch (err) {
      console.error('Errore creazione task:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/tasks/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) fetchTasks();
    } catch (err) {
      console.error('Errore eliminazione task:', err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-indigo-400">Task-Pulse</h1>
        <p className="text-slate-400 mt-2">Gestione attività rapida e sicura con Supabase</p>
      </header>

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-lg mb-8">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-slate-300">Titolo Attività</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Es. Finire il progetto..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-slate-300">Descrizione</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Dettagli aggiuntivi..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
            rows="3"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? 'Aggiunta in corso...' : 'Aggiungi Task'}
        </button>
      </form>

      <div className="space-y-4">
        {tasks.length === 0 ? (
          <p className="text-center text-slate-500">Nessuna task presente.</p>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex justify-between items-start shadow-sm">
              <div>
                <h3 className="text-lg font-semibold text-slate-100">{task.title}</h3>
                {task.description && <p className="text-slate-400 text-sm mt-1">{task.description}</p>}
                <span className="text-xs text-slate-600 mt-2 block">{new Date(task.created_at).toLocaleString()}</span>
              </div>
            <button
                onClick={() => handleDelete(task.id)}
                className="text-red-400 hover:text-red-300 text-sm font-medium px-3 py-1 bg-red-950/40 border border-red-900/50 rounded-lg transition-colors"
              >
                Elimina
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}