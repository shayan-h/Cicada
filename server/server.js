// Importing required modules
import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import mysql from 'mysql2'
import config from './config.js'

// Importing route handlers
import registerRouter from './routes/register.js'
import loginRouter from './routes/login.js'
import dashboardRouter from './routes/dashboard.js'
import newProjectRouter from './routes/newProject.js'
import newTagRouter from './routes/newTag.js'
import projectRouter from './routes/projects.js'

// Creating an Express application
const app = express()

// Middlewares setup
app.use(express.json()) // Parse incoming JSON requests
app.use(cookieParser()) // Parse cookies in incoming requests
app.use(cors({
    origin: ["http://localhost:3000"], // Allowing requests from specified origin
    methods: ["POST", "GET"], // Allowing specified HTTP methods
    credentials: true // Allowing credentials in cross-origin requests
}))

// Creating a MySQL connection
const connection = mysql.createConnection({
    host: config.database.host,
    user: config.database.user,
    password: config.database.password,
    database: config.database.database
})

// Checking the connection by querying the 'users' table
connection.query("SELECT * FROM users", (err, rows) => {
    if (err) {
        console.log("Error in server: mysql")
    } else {
        console.log(rows)
    }
})

// Setting up route handlers
app.use('/register', registerRouter)
app.use('/login', loginRouter)
app.use('/dashboard', dashboardRouter)
app.use('/newProject', newProjectRouter)
app.use('/newTag', newTagRouter)
app.use('/projects', projectRouter)

// Starting the server on port 3002
app.listen(3002, () => {
    console.log("Server connected on port 3002")
})

// Code review 5/22/2024 - complete!
