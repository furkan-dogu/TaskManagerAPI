"use strict";

const multer = require("multer");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Yalnızca JPEG, PNG ve JPG dosyalarına izin verilir.'), false);
    }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
