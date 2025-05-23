"use strict"

const express = require("express")
const app = express()
const cors = require("cors")
require("dotenv").config()

app.use(
    cors({
        origin: process.env.CLIENT_URL || "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

const { dbConnection } = require("./src/configs/dbConnection")
dbConnection()

app.use(express.json());

app.use("/api/auth", require("./src/routes/auth"));
app.use("/api/users", require("./src/routes/user"));
app.use("/api/tasks", require("./src/routes/task"));
app.use("/api/reports", require("./src/routes/report"));
app.use("/api/documents", require("./src/routes/document"));

app.all('/', (req, res) => {
    res.send({
        error: false,
        message: 'Welcome to Task Manager API',
        docs: {
            swagger: "/api/documents/swagger",
            redoc: "/api/documents/redoc",
            json: "/api/documents/json",
        },
        user: req.user,
    })
})

const PORT = process.env.PORT || 8000
app.listen(PORT, () => console.log('http://127.0.0.1:' + PORT))

//! Syncronization 

// require('./src/helpers/sync')()