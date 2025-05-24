"use strict";

const Task = require("../models/task");
const User = require("../models/user");
const excelJS = require("exceljs");

const translateStatus = (status) => {
  return status === "Pending"
    ? "Beklemede"
    : status === "In Progress"
    ? "Devam Ediyor"
    : status === "Completed"
    ? "Tamamlandı"
    : status;
};

const translatePriority = (priority) => {
  return priority === "Low"
    ? "Düşük"
    : priority === "Medium"
    ? "Orta"
    : priority === "High"
    ? "Yüksek"
    : priority;
};


const exportTasksReport = async (req, res) => {
    /*
        #swagger.tags = ["Reports"]
        #swagger.summary = "Export Task Report"
        #swagger.description = "Exports all tasks to an Excel (.xlsx) file including ID, title, description, priority, status, due date, and assigned users."
    */
    try {
        const tasks = await Task.find().populate("assignedTo", "name email");

        const workbook = new excelJS.Workbook();
        const worksheet = workbook.addWorksheet("Tasks Report");

        worksheet.columns = [
            { header: "Görev ID", key: "_id", width: 25 },
            { header: "Başlık", key: "title", width: 30 },
            { header: "Açıklama", key: "description", width: 50 },
            { header: "Öncelik", key: "priority", width: 15 },
            { header: "Durum", key: "status", width: 20 },
            { header: "Teslim Tarihi", key: "dueDate", width: 20 },
            { header: "Atanan Kişi(ler)", key: "assignedTo", width: 30 },
        ];

        tasks.forEach((task) => {
            const assignedTo = task.assignedTo
                .map((user) => `${user.name} (${user.email})`)
                .join(", ");
            worksheet.addRow({
                _id: task._id,
                title: task.title,
                description: task.description,
                priority: translatePriority(task.priority),
                status: translateStatus(task.status),
                dueDate: new Date(task.dueDate).toLocaleDateString("tr-TR"),
                assignedTo: assignedTo || "Atanmamış",
            });
        });

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        res.setHeader(
            "Content-Disposition",
            "attachment; filename=tasks_report.xlsx"
        );

        return workbook.xlsx.write(res).then(() => {
            res.end();
        })
    } catch (error) {
        res.status(500).json({ message: "Sunucu hatası", error: error.message });
    }
}

const exportUsersReport = async (req, res) => {
    /*
        #swagger.tags = ["Reports"]
        #swagger.summary = "Export User Task Summary"
        #swagger.description = "Generates an Excel report showing each user’s total task count and task distribution by status (Pending, In Progress, Completed)."
    */
    try {
        const users = await User.find().select("name email _id").lean();
        const userTasks = await Task.find().populate("assignedTo", "name email _id");

        const userTaskMap = {}
        users.forEach(user => {
            userTaskMap[user._id] = {
                name: user.name,
                email: user.email,
                taskCount: 0,
                pendingTasks: 0,
                inProgressTasks: 0,
                completedTasks: 0,
            };
        })

        userTasks.forEach(task => {
            if (task.assignedTo) {
                task.assignedTo.forEach(assignedUser => {
                    if (userTaskMap[assignedUser._id]) {
                        userTaskMap[assignedUser._id].taskCount += 1;
                        if (task.status === "Pending") {
                            userTaskMap[assignedUser._id].pendingTasks += 1;
                        } else if (task.status === "In Progress") {
                            userTaskMap[assignedUser._id].inProgressTasks += 1;
                        } else if (task.status === "Completed") {
                            userTaskMap[assignedUser._id].completedTasks += 1;
                        }
                    }
                })
            }
        })

        const workbook = new excelJS.Workbook();
        const worksheet = workbook.addWorksheet("User Task Report");

        worksheet.columns = [
            { header: "Kullanıcı Adı", key: "name", width: 30 },
            { header: "E-posta", key: "email", width: 40 },
            { header: "Toplam Görev", key: "taskCount", width: 20 },
            { header: "Bekleyen Görevler", key: "pendingTasks", width: 20 },
            { header: "Devam Eden Görevler", key: "inProgressTasks", width: 20 },
            { header: "Tamamlanan Görevler", key: "completedTasks", width: 20 },
        ];


        Object.values(userTaskMap).forEach(user => {
            worksheet.addRow(user);
        });

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        res.setHeader(
            "Content-Disposition",
            "attachment; filename=user_task_report.xlsx"
        );
        
        return workbook.xlsx.write(res).then(() => {
            res.end();
        })
    } catch (error) {
        res.status(500).json({ message: "Sunucu hatası", error: error.message });
    }
}

module.exports = { exportTasksReport, exportUsersReport };