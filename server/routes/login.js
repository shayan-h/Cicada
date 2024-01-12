import express from 'express'
import mysql from 'mysql2'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import config from '../config.js'
const router = express.Router()

router.use(express.json())

const connection = mysql.createConnection({
    host: config.database.host,
    user: config.database.user,
    password: config.database.password,
    database: config.database.database
})

const isAuthenticated = (req, res, next) => {
    const token = req.cookies.token
    if (!token) {
        return res.json({authenticated: false})
    } else {
        jwt.verify(token, config.token.key, (err, decoded) => {
            if (err) {
                return res.json({authenticated: false})
            } else {
                next()
            }
        })
    }
}

router.post('/', (req, res) => {
    const sql = 'SELECT * FROM users WHERE email = ?'
    connection.query(sql, [req.body.email], async (err, rows) => {
        if (err) {
            res.json({validation: false})
            return ;
        }
        if (!rows.length) {
            res.json({validation: false})
            return ;
        }

        const hashedPasswordDB = rows[0].hashed_password
        bcrypt.compare(req.body.password, hashedPasswordDB, (err, ok) => {
            if (err || !ok) {
                res.json({validation: false})
                return ;
            }
            const id = rows[0].id
            const token = jwt.sign({id}, config.token.key, {expiresIn: '1d'})
            res.cookie('token', token)
            res.json({validation: true})
        })
    })
})

router.get('/auth', isAuthenticated, (req, res) => {
    return res.json({authenticated: true})
})

router.get('/logout', (req, res) => {
    res.clearCookie('token')
    return res.json({validation: true})
})

export default router
