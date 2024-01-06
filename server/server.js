const express = require('express') // import express
const app = express()
const mysql = require('mysql2')
const cors = require('cors')
const config = require('./config');
const bcrypt = require('bcrypt')
const session = require('express-session');
const flash  = require('express-flash')
const BetterMemoryStore = require('session-memory-store')(session)
const LocalStrategy = require('passport-local').Strategy
const bodyParser = require('body-parser')
const passport = require('passport')


app.use(cors())

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

app.use(express.urlencoded({extended: false}))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(flash());
const store = new BetterMemoryStore({expire: 60*60*1000, debug: true})
app.use(session({
    name: 'YOYOYO',
    secret: 'VERYVERYSECRETYO',
    store: store,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());

authUser = (req, email, password, done) => {
    if (!email || !password) {
        return done(null, false)
    }
    const sql = 'SELECT * FROM users WHERE email = ?'
    connection.query(sql, [email], async function(err, rows) {
        console.log("At login: " + email)
        if (err) {
            return done(null, false)
        }
        if(!rows.length) { 
            return done(null, false) 
        }

        const hashedPasswordDB = rows[0].hashed_password
        bcrypt.compare(password, hashedPasswordDB, function(err, ok) {
            if (err || !ok) {
                console.log('HERE FIRST')
                return done(null, false)
            }
            return done(null, rows[0])
        })
    })
}

passport.use('local', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, authUser))

passport.serializeUser(function(user, done) {
    console.log(user.id)
    done(null, user.id)
});

passport.deserializeUser(function(id, done) {
    console.log("err")
    connection.query("SELECT * FROM users WHERE id = " + id, function (err, rows) {
        console.log("Error at des ", err)
        done(err, rows[0])
    })
})



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
