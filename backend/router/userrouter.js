const express = require("express");
const { createTask, getAllTasks, getTaskById, updateTask, deleteTask } = require("../controllers/usercont");

const router = express.Router();

router.post("/addtask", createTask);
router.get("/tasks", getAllTasks);
router.get("/task/:id", getTaskById);
router.put("/task/:id", updateTask);
router.delete("/task/:id", deleteTask);

module.exports = router;
