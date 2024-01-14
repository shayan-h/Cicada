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

router.post('/', isAuthenticated, (req, res) => {
    const projectName = req.body.projectName
    const projectDescription = req.body.projectDescription
    let teamMembers = req.body.teamMembers || []

    // If teamMembers is a string, convert it to an array
    if (typeof teamMembers === 'string') {
        teamMembers = JSON.parse(teamMembers)
    }
    console.log(teamMembers)

    teamMembers = teamMembers.filter((member) => member.trim() !== '')

    const teamMembersJson = {}
    teamMembers.forEach((member, index) => {
        teamMembersJson[`Mem${index + 1}`] = member
    })

    const teamMembersJsonToString = JSON.stringify(teamMembersJson) 
    const statusString = "In Progress"

    // SEND team members email to join project through API

    // Add new project into projects table
    const query = "INSERT INTO projects (project_name, team_members, stat, des) VALUES (?, ?, ?, ?)"
    connection.query(query, [projectName, teamMembersJsonToString, statusString, projectDescription],
        (err, results) => {
            if (err) {
                console.error(err)
                return
            }
            console.log('Project created successfully')
        })

    // Get project ID of the project that was just added so that it can be added to the user's projects column
    const query2 = "SELECT id FROM projects WHERE project_name = ?"
    let project_id
    connection.query(query2, [projectName],
        (err, results) => {
            if (err) {
                console.error(err)
                return
            }
            console.log('Project id fetched successfully')
            project_id = results[0].id

            // Get the user's projects column to update it with the latest project
            const query3 = "SELECT projects FROM users WHERE id = ?"
            connection.query(query3, [req.id],
                (err, results) => {
                    if (err) {
                        console.error(err)
                        return
                    }
                    let projectsJson = results[0].projects ? results[0].projects : {}
                    const projKey = `proj${Object.keys(projectsJson).length + 1}`

                    projectsJson[projKey] = `${project_id}`

                    // Update the user's project column
                    const updateQuery = "UPDATE users SET projects = ? WHERE id = ?"
                    connection.query(updateQuery, [JSON.stringify(projectsJson), req.id],
                        (err, updateResults) => {
                            if (err) {
                                console.error(err)
                                return
                            }
                            console.log('Project added to user')
                        })
                })

            // Update the team member's project column
            teamMembers.forEach((teamMemberEmail) => {
                const updateTeamMemberQuery = "SELECT projects FROM users WHERE email = ?"
                connection.query(updateTeamMemberQuery, [teamMemberEmail],
                    (err, updateTeamMemberRes) => {
                        if (err) {
                            console.log(err)
                            return
                        }
                        console.log(updateTeamMemberRes)
                        let teamMemberProjectsJson = updateTeamMemberRes[0].projects ? updateTeamMemberRes[0].projects : {}
                        const teamMemberProjKey = `proj${Object.keys(teamMemberProjectsJson).length + 1}`
                        teamMemberProjectsJson[teamMemberProjKey] = `${project_id}`

                        // Update the team member's projects column
                        const updateTeamMemberProjectsQuery = "UPDATE users SET projects = ? WHERE email = ?"
                        connection.query(updateTeamMemberProjectsQuery, [JSON.stringify(teamMemberProjectsJson), teamMemberEmail],
                            (err, updateTeamMemberResults) => {
                                if (err) {
                                    console.error(err)
                                    return
                                }
                                console.log(`Project added to team member: ${teamMemberEmail}`)
                            })
                    })
            })
        })
        return res.json({validation: true, authenticated: true})
})

export default router
