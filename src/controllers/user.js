"use strict";

const Task = require("../models/task");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const cloudinary = require("../configs/cloudinary");
const streamifier = require("streamifier");

const getUsers = async (req, res) => {
    /*
        #swagger.tags = ["Users"]
        #swagger.summary = "Get All Members with Task Counts"
        #swagger.description = "Returns a list of all users with role 'member' along with their task statistics (pending, in-progress, completed)."
    */
    try {
        const users = await User.find({ role: "member" }).select("-password");

        const usersWithTaskCounts = await Promise.all(users.map(async (user) => {
            const pendingTasks = await Task.countDocuments({ assignedTo: user._id, status: "Pending" });
            const inProgressTasks = await Task.countDocuments({ assignedTo: user._id, status: "In Progress" });
            const completedTasks = await Task.countDocuments({ assignedTo: user._id, status: "Completed" });

            return {
                ...user._doc,
                pendingTasks,
                inProgressTasks,
                completedTasks,
            };
        }))

        res.json(usersWithTaskCounts);
    } catch (error) {
        res.status(500).json({ message: "Sunucu hatası", error: error.message });
    }
}

const getUsersById = async (req, res) => {
    /*
        #swagger.tags = ["Users"]
        #swagger.summary = "Get User by ID"
        #swagger.description = "Returns user details by user ID, excluding password field."
    */
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Sunucu hatası", error: error.message });
    }
}

const deleteUser = async (req, res) => {
    /*
        #swagger.tags = ["Users"]
        #swagger.summary = "Delete User"
        #swagger.description = "Deletes a user by ID. Typically used by admin."
    */
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı" });

        await user.deleteOne();

        res.json({ message: "Kullanıcı başarıyla silindi" });
    } catch (error) {
        res.status(500).json({ message: "Sunucu hatası", error: error.message });
    }
};

const updateUserByAdmin = async (req, res) => {
    /*
        #swagger.tags = ["Users"]
        #swagger.summary = "Update User by Admin"
        #swagger.description = "Admin can update any user's profile info by ID (including role, isActive, profile image etc)."
        #swagger.parameters["body"] = {
            in: "body",
            required: true,
            schema: {
                "name": "Test",
                "email": "test@site.com",
                "password": "test@123",
                "profileImageUrl": "https://www.image.com/image.jpg",
                "isActive": true
            }
        }
    */
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı" });

        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.role = req.body.role || user.role;
        user.isActive = typeof req.body.isActive === "boolean" ? req.body.isActive : user.isActive;

        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(req.body.password, salt);
        }

        if (req.body.profileImageUrl === "null") {
            user.profileImageUrl = null;
        }

        if (req.file) {
            const uploadFromBuffer = (fileBuffer) => {
                return new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { folder: "users" },
                        (error, result) => {
                            if (result) resolve(result);
                            else reject(error);
                        }
                    );
                    streamifier.createReadStream(fileBuffer).pipe(stream);
                });
            };

            const result = await uploadFromBuffer(req.file.buffer);
            user.profileImageUrl = result.secure_url;
        }

        const updated = await user.save();

        res.json({
            message: "Kullanıcı admin tarafından güncellendi",
            user: {
                _id: updated._id,
                name: updated.name,
                email: updated.email,
                role: updated.role,
                isActive: updated.isActive,
                profileImageUrl: updated.profileImageUrl,
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Sunucu hatası", error: error.message });
    }
};


module.exports = { getUsers, getUsersById, deleteUser, updateUserByAdmin };