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
    const query = "SELECT id, first_name, projects, tags, project_count, tags_count FROM users WHERE id = ?"
    connection.query(query, [req.id], async (err, rows) => {
        if (err) {
            console.log("Error in dashboard: mysql")
            return ;
        }
        const user = rows[0]
        const userProjects = user.projects
        const userTags = user.tags
        const numProj = user.project_count
        const numTag = user.tags_count
        const projectsArray = []
        const tagsArray = []

        for (const projectId in userProjects) {
            const projectDetails = await getProjectDetails(userProjects[projectId])
            projectsArray.push({
                id: userProjects[projectId],
                projName: projectDetails.project_name,
                teamMembers: projectDetails.teamMembers,
                status: projectDetails.stat
            })
        }
        for (const tagId in userTags) {
            const tagDetails = await getTagDetails(userTags[tagId])
            tagsArray.push({
                id: userTags[tagId],
                tagName: tagDetails.tag_title,
                tagStatus: tagDetails.tag_status,
                tagDes: tagDetails.tag_des,
                tagSev: tagDetails.tag_severity
            })
        }

        return res.json({
            authenticated: true, 
            userID: user.id, 
            name: user.first_name, 
            projects: projectsArray,
            tags: tagsArray,
            nProj: numProj,
            nTag: numTag
        })
    })
})

function getProjectDetails(projectId) {
  const query = "SELECT project_name, team_members, stat FROM projects WHERE id = ?";
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

export default router;
