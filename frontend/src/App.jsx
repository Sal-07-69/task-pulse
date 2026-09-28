import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setTasks(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const { error } = await supabase
      .from('tasks')
      .insert([{ title: newTaskTitle }]);

    if (!error) {
      setNewTaskTitle('');
      fetchTasks();
    }
  };

  const toggleTask = async (id, currentStatus) => {
    const { error } = await supabase
      .from('tasks')
      .update({ is_completed: !currentStatus })
      .eq('id', id);

    if (!error) fetchTasks();
  };

  const deleteTask = async (id) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (!error) fetchTasks();
  };

  return (
    <div style={{ maxWidth: '500px', margin: '50px auto', fontFamily: 'system-ui, sans-serif', padding: '0 20px' }}>
      <h1 style={{ color: '#333' }}>TaskPulse ⚡</h1>
      <p style={{ color: '#666' }}>I tuoi task sincronizzati in tempo reale.</p>

      <form onSubmit={addTask} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Cosa c'è da fare?"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
        />
        <button type="submit" style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', background: '#0070f3', color: '#fff', cursor: 'pointer' }}>
          Aggiungi
        </button>
      </form>

      {loading ? (
        <p>Caricamento task...</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {tasks.map((task) => (
            <li
              key={task.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 0',
                borderBottom: '1px solid #eee',
              }}
            >
              <span
                onClick={() => toggleTask(task.id, task.is_completed)}
                style={{
                  cursor: 'pointer',
                  textDecoration: task.is_completed ? 'line-through' : 'none',
                  color: task.is_completed ? '#aaa' : '#333',
                  fontSize: '16px'
                }}
              >
                {task.is_completed ? '✅ ' : '⭕ '} {task.title}
              </span>
              <button
                onClick={() => deleteTask(task.id)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '16px' }}
              >
                🗑️
              </button>
            </li>
          ))}
          {tasks.length === 0 && <p style={{ color: '#888' }}>Nessun task presente. Aggiungine uno!</p>}
        </ul>
      )}
    </div>
  );
}
