import React, { useState } from 'react';
import { TaskProvider, useTasks } from './context/TaskContext.jsx';
import Upcoming from './comp/Upcoming.jsx';
import Completed from './comp/Completed.jsx';
import MissedTasks from './comp/MissedTasks.jsx';
import './App.css';

// ✅ FIXED: TaskForm uses useTasks() - MUST be inside TaskProvider
const TaskForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    email: ''
  });
  const { addTask } = useTasks();  // ✅ Now works - inside TaskProvider

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addTask(formData);
      setFormData({ title: '', description: '', dueDate: '', email: '' });
    } catch (error) {
      alert('Error adding task: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="task-form">
      <input
        type="text"
        placeholder="Task Title *"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        required
      />
      <textarea
        placeholder="Description *"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        rows="3"
        required
      />
      <input
        type="datetime-local"
        value={formData.dueDate}
        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
        required
      />
      <input
        type="email"
        placeholder="Email for reminders *"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
      />
      <button type="submit">Add Task</button>
    </form>
  );
};

// ✅ FIXED: Dashboard renders TaskForm inside TaskProvider
const DashboardContent = () => (
  <div className="dashboard">
    <header className="app-header">
      <h1>📋 Task Scheduler</h1>
      <p>Manage your tasks with automatic email reminders</p>
    </header>
    <TaskForm />
    <div className="task-sections">
      <Upcoming />
      <Completed />
      <MissedTasks />
    </div>
  </div>
);

function App() {
  return (
    <TaskProvider>
      <div className="App">
        <DashboardContent />
      </div>
    </TaskProvider>
  );
}

export default App;
