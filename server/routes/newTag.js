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
    const tagName = req.body.tagName
    const projectID = req.body.project
    const tagType = req.body.tagType
    const severity = req.body.severity
    const userID = req.body.userID
    const tagDescription = req.body.tagDescription
    let assignedMembers = req.body.assignedMembers || []

    // If assignedMembers is a string, convert it to an array
    if (typeof assignedMembers === 'string') {
        assignedMembers = JSON.parse(assignedMembers)
    }

    const assiMembersJson = {}
    assignedMembers.forEach((member, index) => {
        assiMembersJson[`Mem${index + 1}`] = member
    })

    const assiMembersJsonToString = JSON.stringify(assiMembersJson)

    // Add new tag to tags table
    const query = "INSERT INTO tags (project_id, tag_title, assigned_members, tag_status, tag_des, tag_severity, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)"
    connection.query(query, [projectID, tagName, assiMembersJsonToString, tagType, tagDescription, severity, userID],
        (err, row) => {
            if (err) {
                console.error(err)
                return
            }
            console.log('Tag created successfully')
        }
    )

    // Get tag id to add to user's and assigned members tags column
    const query2 = "SELECT id FROM tags WHERE tag_title = ?"
    let tag_id
    connection.query(query2, [tagName],
        (err, results) => {
            if (err) {
                console.error(err)
                return
            }
            console.log('Tag id fetched successfully')
            tag_id = results[0].id

            // Get the user's tags column to update it with the latest tag
            const query3 = "SELECT tags FROM users WHERE id = ?"
            connection.query(query3, [userID],
                (err, results) => {
                    if (err) {
                        console.error(err)
                        return
                    }
                    let tagsJson = results[0].tags ? results[0].tags : {}
                    const tagKey = `tag${Object.keys(tagsJson).length + 1}`

                    tagsJson[tagKey] = `${tag_id}`

                    // Update the user's tags column
                    const updateQuery = "UPDATE users SET tags = ? WHERE id = ?"
                    connection.query(updateQuery, [JSON.stringify(tagsJson), userID],
                        (err, updateResults) => {
                            if (err) {
                                console.error(err)
                                return
                            }
                            console.log('Tag added to user')
                        })
                })

            // Update the assigned member's tag column
            assignedMembers.forEach((assiMemberEmail) => {
                const updateAssiMemberQuery = "SELECT tags FROM users WHERE email = ?"
                connection.query(updateAssiMemberQuery, [assiMemberEmail],
                    (err, updateTeamMemberRes) => {
                        if (err) {
                            console.log(err)
                            return
                        }
                        if (!updateTeamMemberRes || updateTeamMemberRes.length === 0) {
                            console.log("User DNE")
                            return 
                        }

                        let assiMemberTagsJson = updateTeamMemberRes[0].tags ? updateTeamMemberRes[0].tags : {}
                        const assiMemberTagKey = `tag${Object.keys(assiMemberTagsJson).length + 1}`
                        assiMemberTagsJson[assiMemberTagKey] = `${tag_id}`

                        // Update the assigned member's tags column
                        const updateAssiMemberTagsQuery = "UPDATE users SET tags = ? WHERE email = ?"
                        connection.query(updateAssiMemberTagsQuery, [JSON.stringify(assiMemberTagsJson), assiMemberEmail],
                            (err, updateAssiMemberResults) => {
                                if (err) {
                                    console.error(err)
                                    return
                                }
                                console.log(`Tag added to team member: ${assiMemberEmail}`)
                            })
                    })
            })

            // Update the bugs column in this projects row with new tag
            const query4 = "SELECT bugs FROM projects WHERE id = ?"
            connection.query(query4, [projectID],
                (err, results) => {
                    if (err) {
                        console.error(err)
                        return
                    }
                    let tagsJson = results[0].bugs ? results[0].bugs : {}
                    const tagKey = `tag${Object.keys(tagsJson).length + 1}`

                    tagsJson[tagKey] = `${tag_id}`

                    // Update the project's bugs column
                    const updateQuery = "UPDATE projects SET bugs = ? WHERE id = ?"
                    connection.query(updateQuery, [JSON.stringify(tagsJson), projectID],
                        (err, updateResults) => {
                            if (err) {
                                console.error(err)
                                return
                            }
                            console.log('Tag added to project')
                        }
                    )
                }
            )
        })
    return res.json({validation: true, authenticated: true})
    
})

router.get('/getTeam', isAuthenticated, (req, res) => {
    const projectId = req.query.project
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
            const emails = Object.values(team_members_json);
            return res.json({authenticated: true, team: emails});
        } catch (parseError) {
            console.log("Error parsing team members JSON:", parseError);
            return res.status(500).json({ error: "Error parsing team members JSON" });
        }
    })
})

export default router
