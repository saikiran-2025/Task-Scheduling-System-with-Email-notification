import React from 'react';
import { useTasks } from '../context/TaskContext.jsx';

const MissedTasks = () => {
  const { tasks } = useTasks();
  const now = new Date();
  const missedTasks = tasks.filter(task => 
    task.status === 'missed' || 
    (task.status === 'upcoming' && new Date(task.dueDate) < now)
  );

  return (
    <div className="task-section">
      <h3>Missed Tasks ({missedTasks.length})</h3>
      {missedTasks.length === 0 ? (
        <p className="no-tasks">No missed tasks</p>
      ) : (
        <div className="task-list">
          {missedTasks.map(task => (
            <div key={task._id} className="task-card missed">
              {/* ✅ Single title - ONE TIME ONLY */}
              <p><strong>Title:</strong> {task.title}</p>
              
              <div className="task-details">
                <p><strong>Description:</strong> {task.description}</p>
                <p className="due-date"><strong>Due:</strong> {new Date(task.dueDate).toLocaleString()}</p>
                <p><strong>Email:</strong> {task.email}</p>
                <p className="status-missed"><strong>Status:</strong> Incompleted</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MissedTasks;
