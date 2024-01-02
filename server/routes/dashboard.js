const express = require('express')
const router = express.Router()
const mysql = require('mysql2')
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
    console.log('Dashboard connected as id ' + connection.threadId)
})

router.get('/', (req, res) => {
    try {
        const email = "shayanwork612@gmail.com"
        const query = "SELECT first_name, projects FROM users WHERE email = ?"
        connection.query(query, [email], async (err, results) => {
            if (err) {
                // Handle any errors
                console.error(err);
                return;
            }
            const uzer = results[0]
            const userProjects = uzer.projects
            const projectsArray = []

            /*
            for (const projectId in userProjects) {
                const projectDetails = await getProjectDetails(userProjects[projectId]);
                // console.log('Project Details:', projectDetails);
                projectsArray.push({
                id: userProjects[projectId],
                projName: projectDetails.project_name,
                teamMembers: projectDetails.team_members,
                status: projectDetails.stat
                })
            }
            */
            res.send(uzer.first_name)
        })
    } catch {
        res.send("")
        console.log("In catch.")
    }
})

module.exports = router