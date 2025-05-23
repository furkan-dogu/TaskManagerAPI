"use strict";

const router = require('express').Router();
const auth = require("../controllers/auth");
const { protect } = require("../middlewares/permissions");
const upload = require("../middlewares/upload");

router.post("/register", upload.single("profileImageUrl"), auth.registerUser);
router.post("/login", auth.loginUser);
router.get("/logout", auth.logoutUser);
router.get("/profile", protect, auth.getUserProfile);
router.put("/profile", protect, upload.single("profileImageUrl"), auth.updateUserProfile);

module.exports = router;