const express = require('express') // import express
const app = express()
const mysql = require('mysql2')
const cors = require('cors')
const config = require('./config');
const bcrypt = require('bcrypt')

app.use(cors())
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*")
    next()
})
app.use(express.json({limit:'10mb'}))


const connection = mysql.createConnection({
    host: config.database.host,
    user: config.database.user,
    password: config.database.password,
    database: config.database.database
})

// Connect to the database
connection.connect(function(err) {
    if (err) {
        console.error('Error connecting: ' + err.stack)
        return
    }
    console.log('Connected as id ' + connection.threadId)
})

// Test SQL query ------------------------------------------------------------------------------
connection.query('SELECT * FROM users', function(err, rows) {
    if (err) {
        console.error(err)
        return 
    }
    console.log(rows)
}) 


app.post('/validatePassword', (req, res) => {
    const {email, password} = req.body
    const sql = 'SELECT * FROM users WHERE email = ?'
    connection.query(sql, [email], async function(err, rows) {
        if (err) {

        }
        if(!rows.length) { 
            res.send({validation: false})
        }

        const hashedPasswordDB = rows[0].hashed_password
        bcrypt.compare(password, hashedPasswordDB, function(err, ok) {
            if (err || !ok) {
                res.send({validation: false})
            } else {
                res.send({validation: true})
            }
        })
    })
})




const indexRouter = require('./routes/index') // reference to index route
const registerRouter = require('./routes/register') // reference to register route


app.use('/', indexRouter)
app.use('/register', registerRouter)


app.listen(process.env.PORT || 3002, () => {
    console.log("Server running on port 3002")
}) // default to port 3002
