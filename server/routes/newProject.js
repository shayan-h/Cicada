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

    teamMembers = teamMembers.filter((member) => member.trim() !== '')

    const teamMembersJson = {}
    teamMembers.forEach((member, index) => {
        teamMembersJson[`Mem${index + 1}`] = member
    })

    // Add current user's email to teamMembersJson
    const queryEmail = "SELECT email FROM users WHERE id = ?"
    connection.query(queryEmail, [req.id],
        (err, results) => {
            if (err) {
                console.error(err)
                return
            }
            const currentUserEmail = results[0].email
            teamMembersJson[`Mem${teamMembers.length + 1}`] = currentUserEmail
    
    const teamMembersJsonToString = JSON.stringify(teamMembersJson) 
    const statusString = "In Progress"

    // SEND team members email to join project through API && Check if team member email even exists in user database

    // Add new project into projects table
    const query = "INSERT INTO projects (project_name, team_members, stat, des) VALUES (?, ?, ?, ?)"
    connection.query(query, [projectName, teamMembersJsonToString, statusString, projectDescription],
        (err, results) => {
            if (err) {
                console.error(err)
                return
            }
            console.log('Project created successfully')
        }
    )

    // Get project ID of the project that was just added so that it can be added to the user's projects column (Duplicate project name bug!)
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

            const updateProjNum = "UPDATE users SET project_count = project_count + 1 WHERE id = ?"
            connection.query(updateProjNum, [req.id],
                (err, results) => {
                    if (err) {
                        console.err(err)
                        return
                    }
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
                        if (!updateTeamMemberRes || updateTeamMemberRes.length === 0) {
                            console.log("User DNE")
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

                const updateProjNum2 = "UPDATE users SET project_count = project_count + 1 WHERE email = ?"
                connection.query(updateProjNum2, [teamMemberEmail],
                    (err, results2) => {
                        if (err) {
                            console.err(err)
                            return
                        }
                    })
            })
        })
        return res.json({validation: true, authenticated: true})
    })
})

router.post('/delete', isAuthenticated, (req, res) => {
    const projectId = req.body.project

    // Get the team members of the project
    const query = "SELECT team_members FROM projects WHERE id = ?"
    connection.query(query, [projectId],
        (err, results) => {
            if (err) {
                console.error(err)
                return
            }
            const teamMembersJson = results[0].team_members ? results[0].team_members : {}
            const teamMembers = Object.values(teamMembersJson)

            // Create a hashset of tag ids to delete from the tags table using projectId
            const query2 = "SELECT bugs FROM projects WHERE id = ?"
            connection.query(query2, [projectId],
                (err, results2) => {
                    if (err) {
                        console.error(err)
                        return
                    }
                    console.log("TagsJson: " + results2[0] + "Projectid: " + projectId)
                    const tagsJson = results[0].bugs ? JSON.parse(results[0].bugs) : {}
                    const tagIds = Object.values(tagsJson)
                    let tagIdsSet = new Set(tagIds)

                    // Delete tags from the tags table
                    tagIds.forEach((tagId) => {
                        const deleteTagQuery = "DELETE FROM tags WHERE id = ?"
                        connection.query(deleteTagQuery, [tagId],
                            (err, results3) => {
                                if (err) {
                                    console.error(err)
                                    return
                                }
                                console.log('Tag deleted successfully')
                            })
                    })
                

            // Remove the project from the user's projects column
            teamMembers.forEach((teamMemberEmail) => {
                const updateTeamMemberQuery = "SELECT projects FROM users WHERE email = ?"
                connection.query(updateTeamMemberQuery, [teamMemberEmail],
                    (err, updateTeamMemberRes) => {
                        if (err) {
                            console.log(err)
                            return
                        }
                        if (!updateTeamMemberRes || updateTeamMemberRes.length === 0) {
                            console.log("User DNE")
                            return 
                        }
                        let teamMemberProjectsJson = updateTeamMemberRes[0].projects ? updateTeamMemberRes[0].projects : {}
                        // Loop through teamMemberProjectsJson to find the project to delete
                        for (const key in teamMemberProjectsJson) {
                            if (teamMemberProjectsJson[key] === projectId) {
                                delete teamMemberProjectsJson[key]
                                break
                            }
                        }
                        console.log("Deleted json: " + JSON.stringify(teamMemberProjectsJson))

                        // Update the team member's projects column
                        const updateTeamMemberProjectsQuery = "UPDATE users SET projects = ? WHERE email = ?"
                        connection.query(updateTeamMemberProjectsQuery, [JSON.stringify(teamMemberProjectsJson), teamMemberEmail],
                            (err, updateTeamMemberResults) => {
                                if (err) {
                                    console.error(err)
                                    return
                                }
                                console.log(`Project removed from team member: ${teamMemberEmail}`)
                            })
                    })

                // Traverse the user's tags column and delete the tags associated with the ids in the tagIdsSet
                const updateTeamMemberQuery2 = "SELECT tags FROM users WHERE email = ?"
                connection.query(updateTeamMemberQuery2, [teamMemberEmail],
                    (err, updateTeamMemberRes) => {
                        if (err) {
                            console.log(err)
                            return
                        }
                        if (!updateTeamMemberRes || updateTeamMemberRes.length === 0) {
                            console.log("User DNE")
                            return 
                        }
                        let count = 0
                        let teamMemberTagsJson = updateTeamMemberRes[0].tags ? updateTeamMemberRes[0].tags : {}
                        for (const key in teamMemberTagsJson) {
                            if (tagIdsSet.has(teamMemberTagsJson[key])) {
                                count++
                                delete teamMemberTagsJson[key]
                            }
                        }

                        // Update the team member's tags column
                        const updateTeamMemberTagsQuery = "UPDATE users SET tags = ? WHERE email = ?"
                        connection.query(updateTeamMemberTagsQuery, [JSON.stringify(teamMemberTagsJson), teamMemberEmail],
                            (err, updateTeamMemberResults) => {
                                if (err) {
                                    console.error(err)
                                    return
                                }
                                console.log(`Tags removed from team member: ${teamMemberEmail}`)
                            })
                    })
                

                const updateProjNum2 = "UPDATE users SET project_count = project_count - 1 WHERE email = ?"
                connection.query(updateProjNum2, [teamMemberEmail],
                    (err, results2) => {
                        if (err) {
                            console.err(err)
                            return
                        }
                    })
                // Update tag_count by subtracting count
                const updateTagNum = "UPDATE users SET tags_count = tags_count - ? WHERE email = ?"
                connection.query(updateTagNum, [count, teamMemberEmail],
                    (err, results) => {
                        if (err) {
                            console.err(err)
                            return
                        }
                    })

            })
        })
    })

    // Remove the project from the projects table
    const deleteQuery = "DELETE FROM projects WHERE id = ?"
    connection.query(deleteQuery, [projectId],
        (err, results) => {
            if (err) {
                console.error(err)
                return
            }
            console.log('Project deleted successfully')
        })

    return res.json({validation: true, authenticated: true})
})

export default router
