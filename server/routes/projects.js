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
    const query = "SELECT first_name, projects FROM users WHERE id = ?"
    connection.query(query, [req.id], async (err, rows) => {
        if (err) {
            console.log("Error in dashboard: mysql")
            return ;
        }
        const user = rows[0]
        const userProjects = user.projects 
        const projectsArray = []
        const tagsArray = []

        for (const projectId in userProjects) {
            const projectDetails = await getProjectDetails(userProjects[projectId])
            projectsArray.push({
                id: userProjects[projectId],
                projName: projectDetails.project_name,
                teamMembers: projectDetails.teamMembers,
                status: projectDetails.stat,
                description: projectDetails.des,
                updated: projectDetails.updated_at
            })
        }
        return res.json({authenticated: true, name: user.first_name, projects: projectsArray, tags: proj})
    })
})


function getProjectDetails(projectId) {
const query = "SELECT project_name, team_members, bugs, stat, des, updated_at FROM projects WHERE id = ?";
    return new Promise((resolve,reject) => {
        connection.query(query, [projectId], (err, results) => {
        if (err) {
            reject(err);
        } else {
            resolve(results[0]);
        }
        })
    })
}