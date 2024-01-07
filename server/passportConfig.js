// passportConfig.js
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const config = require('./config');
const bcrypt = require('bcrypt');
const mysql = require('mysql2')

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
    console.log('Passport config connected as id ' + connection.threadId)
})

// Test SQL query ------------------------------------------------------------------------------
connection.query('SELECT * FROM users', function(err, rows) {
    if (err) {
        console.error(err)
        return 
    }
    console.log(rows)
})


function initializePassport(connection) {
    passport.use('local', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    }, authUser));

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        connection.query("SELECT * FROM users WHERE id = " + id, function (err, rows) {
            done(err, rows[0]);
        });
    });
}

function authUser(req, email, password, done) {
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

module.exports = initializePassport;
