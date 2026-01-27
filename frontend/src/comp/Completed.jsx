import React from 'react';
import { useTasks } from '../context/TaskContext.jsx';

const Completed = () => {
  const { tasks } = useTasks();
  const completedTasks = tasks.filter(task => task.status === 'completed');

  return (
    <div className="task-section">
      <h3>Completed Tasks ({completedTasks.length})</h3>
      {completedTasks.length === 0 ? (
        <p className="no-tasks">No completed tasks</p>
      ) : (
        <div className="task-list">
          {completedTasks.map(task => (
            <div key={task._id} className="task-card completed">
              <p><strong>Title:</strong> {task.title}</p>
              <div className="task-details">
                <p><strong>Description:</strong> {task.description}</p>
                <p className="due-date"><strong>Due:</strong> {new Date(task.dueDate).toLocaleString()}</p>
                <p><strong>Email:</strong> {task.email}</p>
                <p><strong>Status:</strong> completed</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Completed;
