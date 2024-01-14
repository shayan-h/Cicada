import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import mysql from 'mysql2'
import config from './config.js'

import registerRouter from './routes/register.js'
import loginRouter from './routes/login.js'
import dashboardRouter from './routes/dashboard.js'
import newProjectRouter from './routes/newProject.js'

const app = express()
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: ["http://localhost:3000"],
    methods: ["POST", "GET"],
    credentials: true
}))

const connection = mysql.createConnection({
    host: config.database.host,
    user: config.database.user,
    password: config.database.password,
    database: config.database.database
})
connection.query("SELECT * FROM users", (err, rows) => {
    if (err) {
        console.log("Error in server: mysql")
    } else {
        console.log(rows)
    }
})

app.use('/register', registerRouter)
app.use('/login', loginRouter)
app.use('/dashboard', dashboardRouter)
app.use('/newProject', newProjectRouter)

app.listen(3002, () => {
    console.log("Server connected on port 3002")
})
