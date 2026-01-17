let express = require("express");
let { createTask, getAllTasks, getTaskById, updateTask, deleteTask } = require("../controllers/usercont");
let rt = new express.Router();

rt.post("/addtask", createTask);
rt.get("/tasks", getAllTasks);
rt.get("/task/:id", getTaskById);
rt.put("/task/:id", updateTask);
rt.delete("/task/:id", deleteTask);

module.exports = rt;
