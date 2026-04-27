import express from "express"
import userController from "./Modules/User/user.controller.js"
import dbConnection from "./DB/connection.js"
import noteController from "./Modules/Note/Note.controller.js"
import { port } from "./config/config.service.js"
import cors from "cors"


export default (app) => {


    app.use(cors({
        origin: '*',  // Allow all origins
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }));

    app.use(express.json())

    app.use('/upload', express.static("upload")) // in brwoser

    dbConnection()

    app.use("/users", userController)
    app.use("/notes", noteController)

    app.use("/", (req, res, next) => {
        return res.status(200).json({
            message: "Hello"
        })
    })

    app.use((err, req, res, next) => {
        return res.status(err.cause || 500).json({
            message: err.message,
            stack: err.stack
        })
    })

    app.listen(port, () => {
        console.log(`server is running at port ${port}`);
    })
}