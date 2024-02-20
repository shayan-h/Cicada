import express from 'express'
import mysql from 'mysql2'
import config from '../config.js'
import jwt from 'jsonwebtoken'

const router = express.Router()

const connection = mysql.createConnection({
    host: config.database.host,
    user: config.database.user,
    password: config.database.password,
    database: config.database.database
})

const isAuthenticated = (req, res, next) => {
    const token = req.cookies.token
    if (!token) {
        return res.json({validation: false, authenticated: false})
    } else {
        jwt.verify(token, config.token.key, (err, decoded) => {
            if (err) {
                return res.json({validation: false, authenticated: false})
            } else {
                req.id = decoded.id
                next()
            }
        })
    }
}

router.get('/getTeam', isAuthenticated, (req, res) => {
    const projectId = req.body.project
    const query = "SELECT team_members FROM projects WHERE id = ?"
    connection.query(query, [projectId], async (err, rows) => {
        if (err) {
            console.log("Error in newTag: mysql")
            return ;
        }

        if (rows.length === 0 || !rows[0].team_members) {
            return res.status(404).json({ error: "Project not found or team members not defined" })
        }
    
        const team_members_json = rows[0].team_members;
        try {
            const team_members = JSON.parse(team_members_json);
            const emails = Object.values(team_members);
    
            return res.json({authenticated: true, team: emails});
        } catch (parseError) {
            console.log("Error parsing team members JSON:", parseError);
            return res.status(500).json({ error: "Error parsing team members JSON" });
        }
    })
})

export default router
