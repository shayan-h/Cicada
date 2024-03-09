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
    const projectId = req.query.project
    const query = "SELECT first_name, projects, tags FROM users WHERE id = ?"
    connection.query(query, [req.id], async (err, rows) => {
        if (err) {
            console.log("Error in dashboard: mysql")
            return ;
        }
        const user = rows[0]
        const userProjects = user.projects
        const projectsArray = []
        const tagsArray = []
        
        const projectDetails = await getProjectDetails(projectId)
        const projectTags = projectDetails.bugs
        projectsArray.push({
            id: userProjects[projectId],
            projName: projectDetails.project_name,
            teamMembers: projectDetails.teamMembers, 
            status: projectDetails.stat,
            description: projectDetails.des,
            updated: projectDetails.updated_at
        })
        for (const tagKey in projectTags) {
            const tagValue = projectTags[tagKey]
            const tagDetails = await getTagDetails(tagValue)
            tagsArray.push({
                id: tagValue,
                tagName: tagDetails.tag_title,
                tagStatus: tagDetails.tag_status,
                tagDes: tagDetails.tag_des,
                tagSev: tagDetails.tag_severity
            })
        }
        
        return res.json({
            authenticated: true, 
            name: user.first_name, 
            projects: projectsArray, 
            tags: tagsArray
        })
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

function getTagDetails(tagId) {
    const query = "SELECT tag_title, tag_status, tag_des, tag_severity FROM tags WHERE id = ?";
    return new Promise((resolve,reject) => {
      connection.query(query, [tagId], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results[0]);
        }
      })
    })
}

export default router
