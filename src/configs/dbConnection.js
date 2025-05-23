"use strict"

const mongoose = require("mongoose")

const dbConnection = function () {
    mongoose.connect(process.env.MONGODB)
        .then(() => console.log("* MongoDB ile bağlantı kuruldu *"))
        .catch(() => console.log("! MongoDB bağlantısı kurulamadı !"))
}

module.exports = { mongoose, dbConnection }