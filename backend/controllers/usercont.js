const Task = require('../models/usermodel');
const nodemailer = require('nodemailer');
const cron = require('node-cron');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

let scheduledJobs = new Map();

const scheduleTaskReminder = async (task) => {
  const now = new Date();
  const dueDate = new Date(task.dueDate);
  
  // 30min warning
  const warningTime = new Date(dueDate.getTime() - 30 * 60 * 1000);
  if (warningTime > now) {
    const job = cron.schedule(
      `${warningTime.getMinutes()} ${warningTime.getHours()} ${warningTime.getDate()} ${warningTime.getMonth() + 1} *`,
      () => sendWarningEmail(task),
      { scheduled: false }
    );
    job.start();
    console.log(`⚠️ 30min warning for ${task.title}`);
  }
  
  // 10min reminder
  const reminderTime = new Date(dueDate.getTime() - 10 * 60 * 1000);
  if (reminderTime > now) {
    const job = cron.schedule(
      `${reminderTime.getMinutes()} ${reminderTime.getHours()} ${reminderTime.getDate()} ${reminderTime.getMonth() + 1} *`,
      () => sendReminderEmail(task),
      { scheduled: false }
    );
    job.start();
    scheduledJobs.set(task._id, job);
  }
};

const sendWarningEmail = async (task) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: task.email,
    subject: `⚠️ 30min: ${task.title}`,
    html: `<h2>Task due in 30 minutes: ${task.title}</h2>`
  });
};

const sendReminderEmail = async (task) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: task.email,
    subject: `🚨 ${task.title}`,
    html: `<h2>Task overdue: ${task.title}</h2>`
  });
};

const createTask = async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    scheduleTaskReminder(task);
    res.status(201).json({ success: true, task });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find().sort({ dueDate: 1 });
    res.json({ success: true, tasks });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, task });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    
    if (scheduledJobs.has(task._id)) {
      scheduledJobs.get(task._id).stop();
    }
    scheduleTaskReminder(task);
    res.json({ success: true, task });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    
    if (scheduledJobs.has(task._id)) {
      scheduledJobs.get(task._id).stop();
      scheduledJobs.delete(task._id);
    }
    res.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Mark missed tasks
cron.schedule('*/5 * * * *', async () => {
  const now = new Date();
  await Task.updateMany({ status: 'upcoming', dueDate: { $lt: now } }, { status: 'missed' });
});

// ✅ CRITICAL: Export functions
module.exports = {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask
};
