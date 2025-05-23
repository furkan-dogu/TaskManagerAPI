"use strict";

const router = require('express').Router()

const { protect, adminOnly } = require("../middlewares/permissions");
const task = require("../controllers/task");

router.get("/dashboard-data", protect, task.getDashboardData)
router.get("/user-dashboard-data", protect, task.getUserDashboardData)
router.get("/", protect, task.getTasks)
router.get("/:id", protect, task.getTasksById)
router.post("/", protect, adminOnly, task.createTask)
router.put("/:id", protect, task.updateTask)
router.delete("/:id", protect, adminOnly, task.deleteTask)
router.put("/:id/status", protect, task.updateTaskStatus)
router.put("/:id/todo", protect, task.updateTaskChecklist)

module.exports = router
