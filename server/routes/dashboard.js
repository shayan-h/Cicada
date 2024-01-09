import express from 'express';
import mysql from 'mysql2';
import config from '../config.js';
import jwt from 'jsonwebtoken'
const router = express.Router();

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
                req.id = decoded.id
                next()
            }
        })
    }
}

router.get('/', isAuthenticated, (req, res) => {
    return res.json({authenticated: true, id: req.id})
})

export default router;
