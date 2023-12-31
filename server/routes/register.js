const express = require('express')
const router = express.Router()
const mysql = require('mysql2')
const bcrypt = require('bcrypt')
const config = require('../config');

const connection = mysql.createConnection({
    host: config.database.host,
    user: config.database.user,
    password: config.database.password,
    database: config.database.database
  })
connection.connect(function(err) {
    if (err) {
        console.error('Error connecting: ' + err.stack)
        return
    }
    console.log('Register connected as id ' + connection.threadId)
})


function emailExists(email) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT email FROM users WHERE email = ?'
        connection.query(sql, [email], function(err, rows) {
            if (err) {
                console.log(err)
                reject(err)
            }
            if (rows.length == 0) {
                console.log(rows)
                resolve(false)
            } else {
                console.log(rows)
                resolve(true)
            }
        })
    })
}


router.post('/registerUser', async (req, res) => {
    try {
        const emailRes = await emailExists(req.body.email)
        if (emailRes) {
            console.log('Email already exists') 
            res.send({validation: false})
        } else {
            const hashedPassword = await bcrypt.hash(req.body.password, 10)
            await connection.promise().query(
            'INSERT INTO users (email, first_name, last_name, hashed_password) VALUES (?, ?, ?, ?)', 
            [req.body.email, req.body.fName, req.body.lName, hashedPassword], (err, results) => {
                if (err) {
                    console.log('This is the error: ' + error)
                } else {
                    console.log('Success query')
                }
            })
            const { fName, lName, email, password } = req.body
            res.send({validation: true})
            console.log('Registeration successful')
        }
    } catch {
        res.send({validation: false})
        console.log('In catch.')
    }
})

module.exports = router // exports router