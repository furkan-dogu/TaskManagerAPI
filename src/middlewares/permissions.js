"use strict"

const jwt = require("jsonwebtoken");
const User = require("../models/user");

const protect = async (req, res, next) => {
    try {
        let token = req.headers.authorization;

        if (token && token.startsWith("Bearer")) {
            token = token.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select("-password");

            if (!user || !user.isActive) {
                return res.status(403).json({ message: "User is inactive or not found" });
            }

            req.user = user;
            next();
        } else {
            res.status(401).json({ message: "Not authorized, no token" });
        }
    } catch (error) {
        res.status(401).json({ message: "Token failed", error: error.message });
    }
};

// admin-only
const adminOnly = (req, res, next) => {
    if (req.user && req.user.isActive && req.user.role === "admin") {
        next();
    } else {
        res.status(403).json({ message: "Access denied, admin only" });
    }
};

module.exports = { protect, adminOnly };