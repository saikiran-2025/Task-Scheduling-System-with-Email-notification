const Task = require('../models/usermodel');
const nodemailer = require('nodemailer');
const cron = require('node-cron');

// ✅ GMAIL TRANSPORTER (Add to .env)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,     // saikirangundapu2003@gmail.com
    pass: process.env.EMAIL_PASS      // Gmail App Password (16 chars)
  }
});

let scheduledJobs = new Map();

// ✅ IST TIME PARSING (18:00 stays 18:00 IST exactly)
const parseDateTimeIST = (dateTimeString) => {
  const date = new Date(dateTimeString + ':00.000+05:30'); // Force IST timezone
  return date;
};

// ✅ 1. TASK ASSIGNED NOTIFICATION (IMMEDIATE)
const sendTaskAssignedEmail = async (task) => {
  const dueDateIST = new Date(task.dueDate).toLocaleString('en-IN', { 
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: task.email,
    subject: `📋 NEW TASK ASSIGNED: ${task.title}`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa;">
        <h2 style="color: #007bff; text-align: center;">🎯 New Task Assigned to You!</h2>
        <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,123,255,0.15); border-left: 6px solid #007bff;">
          <h3 style="margin: 0 0 20px 0; color: #0056b3;">📋 ${task.title}</h3>
          <div style="display: grid; grid-template-columns: 120px 1fr; gap: 10px; margin: 15px 0;">
            <strong>Description:</strong>
            <p style="margin: 0;">${task.description}</p>
            <strong>Due Date:</strong>
            <p style="margin: 0; color: #dc3545; font-weight: bold;">${dueDateIST} (IST)</p>
            <strong>Status:</strong>
            <span style="padding: 4px 12px; background: #d4edda; color: #155724; border-radius: 20px; font-size: 14px;">📋 Upcoming</span>
          </div>
          <div style="text-align: center; margin-top: 25px;">
            <p style="color: #666; font-size: 14px;">Please complete this task before the due date.</p>
          </div>
        </div>
        <p style="text-align: center; color: #666; font-size: 12px; margin-top: 20px;">
          Task Scheduler - Automated Assignment Notification
        </p>
      </div>
    `
  });
  console.log(`📧 TASK ASSIGNED: "${task.title}" → ${task.email}`);
};

// ✅ 2. 1 HOUR WARNING
const send1HourWarningEmail = async (task) => {
  if (task.status === 'completed') return; // Skip if already completed
  
  const dueDateIST = new Date(task.dueDate).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: task.email,
    subject: `⚠️ 1 HOUR LEFT: ${task.title}`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #ff9800;">⏰ 1 HOUR WARNING - Task Due Soon!</h2>
        <div style="background: #fff3e0; padding: 25px; border-radius: 12px; border-left: 6px solid #ff9800;">
          <h3 style="margin: 0 0 15px 0; color: #e65100;">📋 ${task.title}</h3>
          <p style="margin: 8px 0;"><strong>Description:</strong> ${task.description}</p>
          <p style="margin: 8px 0;"><strong>Due:</strong> <strong style="color: #e65100;">${dueDateIST}</strong></p>
          <p style="color: #e65100; font-weight: bold; font-size: 16px;">⏳ COMPLETE THIS TASK WITHIN 1 HOUR!</p>
        </div>
      </div>
    `
  });
  console.log(`🕐 1HR WARNING: "${task.title}" → ${task.email}`);
};

// ✅ 3. 30 MIN FINAL WARNING
const send30MinWarningEmail = async (task) => {
  if (task.status === 'completed') return;
  
  const dueDateIST = new Date(task.dueDate).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: task.email,
    subject: `🚨 30 MINS LEFT: ${task.title} - URGENT!`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #dc3545;">⚠️ FINAL WARNING - 30 MINUTES LEFT!</h2>
        <div style="background: #f8d7da; padding: 25px; border-radius: 12px; border-left: 6px solid #dc3545;">
          <h3 style="margin: 0 0 15px 0; color: #721c24;">📋 ${task.title}</h3>
          <p style="margin: 8px 0;"><strong>Description:</strong> ${task.description}</p>
          <p style="margin: 8px 0;"><strong>Due:</strong> <strong style="color: #dc3545;">${dueDateIST}</strong></p>
          <p style="color: #dc3545; font-weight: bold; font-size: 18px;">🚨 IMMEDIATE ACTION REQUIRED!</p>
        </div>
      </div>
    `
  });
  console.log(`🚨 30MIN WARNING: "${task.title}" → ${task.email}`);
};

// ✅ 4. TASK COMPLETED CONFIRMATION
const sendTaskCompletedEmail = async (task) => {
  const dueDateIST = new Date(task.dueDate).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: task.email,
    subject: `✅ ${task.title} - COMPLETED!`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #28a745;">🎉 Task Successfully Completed!</h2>
        <div style="background: #d4edda; padding: 25px; border-radius: 12px; border-left: 6px solid #28a745;">
          <h3 style="margin: 0 0 15px 0; color: #155724;">✅ ${task.title}</h3>
          <p style="margin: 8px 0;"><strong>Description:</strong> ${task.description}</p>
          <p style="margin: 8px 0;"><strong>Due:</strong> ${dueDateIST}</p>
          <p style="color: #155724; font-weight: bold;">Excellent work! Task marked as completed.</p>
        </div>
      </div>
    `
  });
  console.log(`✅ COMPLETED: "${task.title}" → ${task.email}`);
};

// ✅ SCHEDULE ALL EMAILS (Assignment + Warnings)
const scheduleTaskEmails = async (task) => {
  const now = new Date();
  const dueDate = new Date(task.dueDate);
  const jobId = task._id.toString();

  // Clear existing scheduled jobs
  ['_1hr', '_30min'].forEach(suffix => {
    const existingJobId = `${jobId}${suffix}`;
    if (scheduledJobs.has(existingJobId)) {
      scheduledJobs.get(existingJobId).stop();
      scheduledJobs.delete(existingJobId);
    }
  });

  // ✅ 1. IMMEDIATE ASSIGNMENT EMAIL
  await sendTaskAssignedEmail(task);

  // ✅ 2. 1 HOUR WARNING (if more than 1hr away)
  if (dueDate > new Date(now.getTime() + 60 * 60 * 1000)) {
    const oneHourTime = new Date(dueDate.getTime() - 60 * 60 * 1000);
    const oneHourJob = cron.schedule(
      `${oneHourTime.getMinutes()} ${oneHourTime.getHours()} ${oneHourTime.getDate()} ${oneHourTime.getMonth() + 1} *`,
      () => send1HourWarningEmail(task),
      { scheduled: false, timezone: "Asia/Kolkata" }
    );
    oneHourJob.start();
    scheduledJobs.set(`${jobId}_1hr`, oneHourJob);
    console.log(`🕐 Scheduled 1HR warning: ${task.title}`);
  }

  // ✅ 3. 30 MIN WARNING (if more than 30min away)
  if (dueDate > new Date(now.getTime() + 30 * 60 * 1000)) {
    const thirtyMinTime = new Date(dueDate.getTime() - 30 * 60 * 1000);
    const thirtyMinJob = cron.schedule(
      `${thirtyMinTime.getMinutes()} ${thirtyMinTime.getHours()} ${thirtyMinTime.getDate()} ${thirtyMinTime.getMonth() + 1} *`,
      () => send30MinWarningEmail(task),
      { scheduled: false, timezone: "Asia/Kolkata" }
    );
    thirtyMinJob.start();
    scheduledJobs.set(`${jobId}_30min`, thirtyMinJob);
    console.log(`⚠️ Scheduled 30MIN warning: ${task.title}`);
  }
};

// ✅ CREATE TASK (Task Assigned → Email + Schedule Warnings)
const createTask = async (req, res) => {
  try {
    const taskData = { ...req.body };
    
    console.log('📥 New task assigned to:', taskData.email);
    console.log('📥 Input IST time:', taskData.dueDate);
    
    if (taskData.dueDate) {
      taskData.dueDate = parseDateTimeIST(taskData.dueDate);
    }
    
    const task = new Task(taskData);
    await task.save();
    
    // ✅ SEND TASK ASSIGNED + SCHEDULE WARNINGS
    await scheduleTaskEmails(task);
    
    console.log('✅ Task created & emails scheduled:', taskData.email);
    res.status(201).json({ success: true, task });
  } catch (error) {
    console.error('Create error:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// ✅ UPDATE TASK
const updateTask = async (req, res) => {
  try {
    const prevTask = await Task.findById(req.params.id);
    const taskData = { ...req.body };
    
    console.log('📥 Update for:', taskData.email || prevTask.email);
    
    if (taskData.dueDate !== undefined && taskData.dueDate !== '') {
      taskData.dueDate = parseDateTimeIST(taskData.dueDate);
    }
    
    const task = await Task.findByIdAndUpdate(req.params.id, taskData, { new: true });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    
    // ✅ RESCHEDULE EMAILS + SEND COMPLETION NOTIFICATION
    if (task.status === 'completed' && prevTask.status !== 'completed') {
      await sendTaskCompletedEmail(task);
    } else {
      await scheduleTaskEmails(task);
    }
    
    res.json({ success: true, task });
  } catch (error) {
    console.error('Update error:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// ✅ DELETE TASK (Cancel all emails)
const deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    
    // Cancel all scheduled emails
    ['_1hr', '_30min'].forEach(suffix => {
      const jobId = `${taskId}${suffix}`;
      if (scheduledJobs.has(jobId)) {
        scheduledJobs.get(jobId).stop();
        scheduledJobs.delete(jobId);
      }
    });
    
    await Task.findByIdAndDelete(taskId);
    res.json({ success: true, message: 'Task deleted & emails cancelled' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
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

// ✅ AUTO-MARK MISSED TASKS (every 5 mins)
cron.schedule('*/5 * * * *', async () => {
  const now = new Date();
  const result = await Task.updateMany(
    { status: { $in: ['upcoming', 'incompleted'] }, dueDate: { $lt: now } },
    { status: 'missed' }
  );
  if (result.modifiedCount > 0) {
    console.log(`🔄 ${result.modifiedCount} tasks marked as missed`);
  }
}, { timezone: "Asia/Kolkata" });

module.exports = {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask
};
