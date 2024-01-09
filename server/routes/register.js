import express from 'express'
const router = express.Router()
import mysql from 'mysql2'
import bcrypt from 'bcrypt'
import config from '../config.js'

const connection = mysql.createConnection({
    host: config.database.host,
    user: config.database.user,
    password: config.database.password,
    database: config.database.database
})

function emailExists(email) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT email FROM users WHERE email = ?'
        connection.query(sql, [email], (err, rows) => {
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
        });
    });
}

router.post('/', async (req, res) => {
    try {
        const emailRes = await emailExists(req.body.email)
        if (emailRes) {
            console.log('Email already exists')
            res.send({ validation: false })
        } else {
            const hashedPassword = await bcrypt.hash(req.body.password, 10)
            await connection.promise().query(
                'INSERT INTO users (email, first_name, last_name, hashed_password) VALUES (?, ?, ?, ?)',
                [req.body.email, req.body.fName, req.body.lName, hashedPassword],
                (err, results) => {
                    if (err) {
                        console.log('This is the error: ' + error)
                    } else {
                        console.log('Success query')
                    }
                }
            )
            res.send({ validation: true })
            console.log('Registration successful')
        }
    } catch (error) {
        res.send({ validation: false })
        console.log('In catch.')
    }
});

export default router
