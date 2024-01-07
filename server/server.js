const express = require('express') // import express
const app = express()
const mysql = require('mysql2')
const cors = require('cors')
const config = require('./config');
const cookie = require('cookie-parser') // cookie
const session = require('express-session');
const BetterMemoryStore = require('session-memory-store')(session)
const bodyParser = require('body-parser')
const passport = require('passport')
const initializePassport = require('./passportConfig');


app.use(cors())
app.use(cookie())


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

app.use(express.urlencoded({extended: false}))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const store = new BetterMemoryStore({expire: 60*60*1000, debug: true})
app.use(session({
    cookie: {
        httpOnly: true,
        secure: false
    },
    name: 'session',
    secret: 'VERYVERYSECRETYO',
    store: store,
    resave: false,
    saveUninitialized: false,
    credentials: 'include'
}))
initializePassport(connection);
app.use(passport.initialize());
app.use(passport.session());



app.post('/validatePassword', passport.authenticate('local', {
    failureFlash: true
}), function(req, res) {
    if (req.user) {
        res.send({validation: true})
    }
})



const indexRouter = require('./routes/index') // reference to index route
const registerRouter = require('./routes/register') // reference to register route
const dashboardRouter = require('./routes/dashboard') // reference to dashboard route


app.use('/', indexRouter)
app.use('/register', registerRouter)
app.use('/dashboard', dashboardRouter)


app.listen(process.env.PORT || 3002, () => {
    console.log("Server running on port 3002")
}) // default to port 3002
