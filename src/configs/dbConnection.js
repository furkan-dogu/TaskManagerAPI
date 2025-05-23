"use strict"

const mongoose = require("mongoose")

const dbConnection = async () => {
    try {
        await mongoose.connect(process.env.MONGODB);
        console.log("MongoDB Connected");
    } catch (error) {
        console.log(`Error connecting to MongoDB: ${error}`);
        process.exit(1);
    }
};

module.exports = { mongoose, dbConnection }