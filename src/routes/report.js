"use strict";

const router = require('express').Router()

const { protect, adminOnly } = require("../middlewares/permissions");
const report = require("../controllers/report");

router.get("/export/tasks", protect, adminOnly, report.exportTasksReport);
router.get("/export/users", protect, adminOnly, report.exportUsersReport);

module.exports = router;