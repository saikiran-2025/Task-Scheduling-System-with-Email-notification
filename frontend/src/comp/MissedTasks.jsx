import React from 'react';
import { useTasks } from '../context/TaskContext.jsx';

const MissedTasks = () => {
  const { tasks } = useTasks();
  const now = new Date();
  const missedTasks = tasks.filter(task => 
    (task.status === 'missed' || task.status === 'incompleted') && 
    new Date(task.dueDate) < now
  );

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
      <h3>Missed Tasks ({missedTasks.length})</h3>
      {missedTasks.length === 0 ? (
        <p className="no-tasks">No missed tasks</p>
      ) : (
        <div className="task-list">
          {missedTasks.map(task => (
            <div key={task._id} className="task-card missed">
              <div className="task-content">
                <h4>{task.title}</h4>
                <p>{task.description}</p>
                <p><strong>Due (IST):</strong> {formatForDisplay(task.dueDate)}</p>
                <p><strong>Email:</strong> {task.email}</p>
                <span className="status-badge missed">📋 Missed</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MissedTasks;
