"use strict";

const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cloudinary = require("../configs/cloudinary");
const streamifier = require("streamifier");

// Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
};

const registerUser = async (req, res) => {
    /*
        #swagger.tags = ["Authentication"]
        #swagger.summary = "Register"
        #swagger.description = "Register user with multipart/form-data (includes image)"
        #swagger.parameters["body"] = {
            in: "body",
            required: true,
            schema: {
                "name": "Test",
                "email": "test@site.com",
                "password": "test@123",
                "profileImageUrl": "https://www.image.com/image.jpg",
                "adminInviteToken": "******"
            }
        }
    */
    try {
        const { name, email, password, adminInviteToken } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        let profileImageUrl = null;

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
            profileImageUrl = result.secure_url;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let role = "member";
        if (adminInviteToken && adminInviteToken === process.env.ADMIN_INVITE_TOKEN) {
            role = "admin";
        }

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            profileImageUrl,
            role,
        });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            profileImageUrl: user.profileImageUrl,
            role: user.role,
            token: generateToken(user._id),
            isActive: user.isActive
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const loginUser = async (req, res) => {
    /*
        #swagger.tags = ["Authentication"]
        #swagger.summary = "Login"
        #swagger.description = "Login with email and password"
        #swagger.parameters["body"] = {
            in: "body",
            required: true,
            schema: {
                "email": "test@site.com",
                "password": "test@123",
            }
        }
    */
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        if (!user.isActive) {
            return res.status(403).json({ message: "Your account is deactivated. Please contact support." });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            profileImageUrl: user.profileImageUrl,
            role: user.role,
            token: generateToken(user._id),
            isActive: user.isActive
        })
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const logoutUser = (req, res) => {
    /*
        #swagger.tags = ["Authentication"]
        #swagger.summary = "Logout"
    */
    try {
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const getUserProfile = async (req, res) => {
    /*
        #swagger.tags = ["Authentication"]
        #swagger.summary = "Get User Profile"
    */
    try {
        const user = await User.findById(req.user.id).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const updateUserProfile = async (req, res) => {
    /*
        #swagger.tags = ["Authentication"]
        #swagger.summary = "Update User Profile"
        #swagger.parameters["body"] = {
            in: "body",
            required: true,
            schema: {
                "name": "Test",
                "email": "test@site.com",
                "password": "test@123",
                "profileImageUrl": "https://www.image.com/image.jpg"
            }
        }
    */
    try {
        const user = await User.findById(req.user.id);

        if (req.user.role !== "admin") {
            delete req.body.isActive;
            delete req.body.role;
        }

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        
        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(req.body.password, salt);
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

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            profileImageUrl: updatedUser.profileImageUrl,
            role: updatedUser.role,
            token: generateToken(updatedUser._id),
            isActive: updatedUser.isActive
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getUserProfile,
    updateUserProfile,
};