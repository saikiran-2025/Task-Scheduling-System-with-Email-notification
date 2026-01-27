import React from 'react';
import { useTasks } from '../context/TaskContext.jsx';

const Completed = () => {
  const { tasks } = useTasks();
  const completedTasks = tasks.filter(task => task.status === 'completed');

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

  return (
    <div className="task-section">
      <h3>Completed Tasks ({completedTasks.length})</h3>
      {completedTasks.length === 0 ? (
        <p className="no-tasks">No completed tasks</p>
      ) : (
        <div className="task-list">
          {completedTasks.map(task => (
            <div key={task._id} className="task-card completed">
              <div className="task-content">
                <h4>{task.title}</h4>
                <p>{task.description}</p>
                <p><strong>Due (IST):</strong> {formatForDisplay(task.dueDate)}</p>
                <p><strong>Email:</strong> {task.email}</p>
                <span className="status-badge completed">✅ Completed</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Completed;
