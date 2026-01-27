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

  const handleEdit = (task) => {
    setEditingTask(task._id);

    // ✅ FIX: Preserve local time correctly
    const date = new Date(task.dueDate);
    const localDateTime = new Date(
      date.getTime() + date.getTimezoneOffset() * 60000
    ).toISOString().slice(0, 16);

    setEditForm({
      title: task.title,
      description: task.description,
      dueDate: localDateTime,
      email: task.email,
      status: task.status || 'upcoming'
    });
  };

  const handleSaveEdit = async (taskId) => {
    try {
      const localDate = new Date(editForm.dueDate);
      const utcDate = new Date(
        localDate.getTime() - localDate.getTimezoneOffset() * 60000
      );

      await updateTask(taskId, {
        ...editForm,
        dueDate: utcDate.toISOString()
      });

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
                    <input 
                      value={editForm.title || ''} 
                      onChange={(e) => setEditForm({...editForm, title: e.target.value})} 
                    />
                  </div>

                  <div className="form-group">
                    <label>Description:</label>
                    <textarea 
                      value={editForm.description || ''} 
                      onChange={(e) => setEditForm({...editForm, description: e.target.value})} 
                      rows="2" 
                    />
                  </div>

                  <div className="form-group">
                    <label>Due:</label>
                    <input 
                      type="datetime-local" 
                      value={editForm.dueDate || ''} 
                      onChange={(e) => setEditForm({...editForm, dueDate: e.target.value})} 
                    />
                  </div>

                  <div className="form-group">
                    <label>Email:</label>
                    <input 
                      type="email" 
                      value={editForm.email || ''} 
                      onChange={(e) => setEditForm({...editForm, email: e.target.value})} 
                    />
                  </div>

                  <div className="form-group">
                    <label>Status:</label>
                    <select 
                      value={editForm.status || 'upcoming'} 
                      onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                    >
                      <option value="upcoming">📋 Incompleted</option>
                      <option value="completed">✅ Completed</option>
                    </select>
                  </div>

                  <div className="edit-buttons">
                    <button onClick={() => handleSaveEdit(task._id)}>💾 Save</button>
                    <button onClick={() => setEditingTask(null)}>❌ Cancel</button>
                  </div>

                </div>
              ) : (
                <div className="task-content">
                  <p><strong>Title:</strong> {task.title}</p>
                  <div className="task-details">
                    <p><strong>Description:</strong> {task.description}</p>
                    <p className="due-date">
                      <strong>Due:</strong> {new Date(task.dueDate).toLocaleString()}
                    </p>
                    <p><strong>Email:</strong> {task.email}</p>
                    <span>
                      <strong>Status:</strong> {task.status === 'completed' ? '✅ Completed' : '📋 Incompleted'}
                    </span>
                  </div>
                  <div className="task-actions">
                    <button onClick={() => handleEdit(task)}>✏️</button>
                    <button onClick={() => handleDelete(task._id)}>🗑️</button>
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
