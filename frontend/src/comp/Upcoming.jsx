import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext.jsx';

const Upcoming = () => {
  const { tasks, updateTask, deleteTask } = useTasks();
  const now = new Date();
  const upcomingTasks = tasks.filter(task => 
    (task.status === 'upcoming' || task.status === 'incompleted') && 
    new Date(task.dueDate) > now
  );

  const [editingTask, setEditingTask] = useState(null);
  const [editForm, setEditForm] = useState({});

  // ✅ IST ONLY: Perfect roundtrip for datetime-local input
  const formatForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    // Extract IST components exactly
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // ✅ IST Display format
  const formatForDisplay = (dateString) => {
    if (!dateString) return 'Invalid date';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleEdit = (task) => {
    setEditingTask(task._id);
    setEditForm({
      title: task.title,
      description: task.description,
      dueDate: formatForInput(task.dueDate), // ✅ Shows 18:00 exactly
      email: task.email,
      status: task.status || 'upcoming'
    });
    console.log('Edit form time:', formatForInput(task.dueDate)); // Debug
  };

  const handleSaveEdit = async (taskId) => {
    try {
      console.log('Saving IST time:', editForm.dueDate); // Debug
      await updateTask(taskId, editForm);
      setEditingTask(null);
      setEditForm({});
    } catch (error) {
      alert('Error updating task');
    }
  };

  const handleDelete = async (taskId) => {
    if (window.confirm('Delete this task?')) {
      try {
        await deleteTask(taskId);
      } catch (error) {
        alert('Error deleting task');
      }
    }
  };

  return (
    <div className="task-section">
      <h3>Upcoming Tasks ({upcomingTasks.length})</h3>
      {upcomingTasks.length === 0 ? (
        <p className="no-tasks">No upcoming tasks</p>
      ) : (
        <div className="task-list">
          {upcomingTasks.map(task => (
            <div key={task._id} className="task-card upcoming">
              {editingTask === task._id ? (
                <div className="edit-form">
                  <div className="form-group">
                    <label>Title:</label>
                    <input value={editForm.title || ''} onChange={(e) => setEditForm({...editForm, title: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Description:</label>
                    <textarea value={editForm.description || ''} onChange={(e) => setEditForm({...editForm, description: e.target.value})} rows="2" />
                  </div>
                  <div className="form-group">
                    <label>Due (IST):</label>
                    <input type="datetime-local" value={editForm.dueDate || ''} onChange={(e) => setEditForm({...editForm, dueDate: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Email:</label>
                    <input type="email" value={editForm.email || ''} onChange={(e) => setEditForm({...editForm, email: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Status:</label>
                    <select value={editForm.status || 'upcoming'} onChange={(e) => setEditForm({...editForm, status: e.target.value})}>
                      <option value="upcoming">📋 Upcoming</option>
                      <option value="completed">✅ Completed</option>
                    </select>
                  </div>
                  <div className="edit-buttons">
                    <button onClick={() => handleSaveEdit(task._id)} className="btn-save">💾 Save</button>
                    <button onClick={() => setEditingTask(null)} className="btn-cancel">❌ Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="task-content">
                  <h4>{task.title}</h4>
                  <p>{task.description}</p>
                  <p><strong>Due (IST):</strong> {formatForDisplay(task.dueDate)}</p>
                  <p><strong>Email:</strong> {task.email}</p>
                  <span className="status-badge upcoming">📋 Upcoming</span>
                  <div className="task-actions">
                    <button onClick={() => handleEdit(task)} className="btn-edit">✏️ Edit</button>
                    <button onClick={() => handleDelete(task._id)} className="btn-delete">🗑️ Delete</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Upcoming;
