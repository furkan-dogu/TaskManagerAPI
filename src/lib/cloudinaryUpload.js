const cloudinary = require("../configs/cloudinary");
const streamifier = require("streamifier");

const uploadFromBuffer = (fileBuffer, folder = "users") => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder },
            (error, result) => {
                if (result) resolve(result);
                else reject(error);
            }
        );
        streamifier.createReadStream(fileBuffer).pipe(stream);
    });
};

module.exports = uploadFromBuffer;
