"use strict";

const router = require('express').Router()

const { protect, adminOnly } = require("../middlewares/permissions");
const user = require("../controllers/user");
const upload = require("../middlewares/upload");

router.get("/", protect, adminOnly, user.getUsers);
router.get("/:id", protect, user.getUsersById);
router.delete("/:id", protect, adminOnly, user.deleteUser);
router.put("/:id", protect, adminOnly, upload.single("profileImageUrl"), user.updateUserByAdmin);

module.exports = router;