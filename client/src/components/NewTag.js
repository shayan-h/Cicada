import React, {useState, useEffect} from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/NewProject.css'
import axios from 'axios'


export default function NewTag() {
    const [tagName, setTagName] = useState('')
    // Project id to send to db and to use in 2nd useffect
    const [project, setProject] = useState('')
    const [tagType, setTagType] = useState('')
    const [severity, setSeverity] = useState('')
    const [tagDescription, setTagDescription] = useState('')
    const [assignedMembers, setAssignedMembers] = useState([''])

    const navigate = useNavigate();
    axios.defaults.withCredentials = true

    // List of projects displayed on form
    const [projects, setProjData] = useState([])

    // List of emails of team members to display on form
    const [projectMembers, setProjectMembers] = useState([])

    const handleAssignedMemberChange = (e) => {
        const selectedMembers = Array.from(e.target.selectedOptions, (option) => option.value)
        setAssignedMembers(selectedMembers)
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get("http://localhost:3002/dashboard")
                if (response.data.authenticated) {
                    console.log("Inside useeffect")
                    setProjData(response.data.projects)
                } else {
                    navigate('/')
                }
            } catch (error) {
                console.log("Error during dashboard fetch", error)
            }
        }
        fetchData()
    }, [])

    const fetchProjectMembers = async (projectId) => {
        try {
            const response = await axios.get("http://localhost:3002/newTag/getTeam", { params: { project: projectId } })
            if (response.data.authenticated) {
                
                setProjectMembers(response.data.team)
            } else {
                navigate('/');
            }
        } catch (error) {
            navigate('/dashboard')
            console.log("Error during team fetch", error)
        }
    }

    const handleProjectSelect = (projectId) => {
        setProject(projectId)
        fetchProjectMembers(projectId)
    }

    const handleSubmitForm = async (event) => {
        event.preventDefault();

        try {
            const response = await axios.post('http://localhost:3002/newTag', { tagName, project, tagType, severity, tagDescription, assignedMembers })
            if (response.data.authenticated && response.data.validation) {
                navigate('/dashboard')
            }
        } catch (error) {
            console.error('Error during form submission:', error)
        }
    }

    return (
        <body>
            <div className="create-project-container">
            <div className="form-box">
                <h1>Create a New Tag</h1>
                <form id="newProjectForm" onSubmit={handleSubmitForm}>
                <label htmlFor="projectName">Tag Name*</label>
                <input
                    type="text"
                    id="projectName"
                    name="projectName"
                    required
                    value={tagName}
                    onChange={(e) => setTagName(e.target.value)}
                />

                <label htmlFor='projectSelect'>Project*</label>
                <select id="projectSelect" value={project} onChange={e => handleProjectSelect(e.target.value)}>
                    <option value="">Select project</option>
                    {projects.map(proj => (
                        <option key={proj.id} value={proj.id}>{proj.projName}</option>
                    ))}
                </select>

                <label htmlFor='typeSelect'>Tag Type*</label>
                <select id="typeSelect" value={tagType} onChange={e => setTagType(e.target.value)}>
                    <option value="">Select tag type</option>
                    <option key={1} value={"Task"}>Task</option>
                    <option key={2} value={"Bug"}>Bug</option>
                </select>

                <label htmlFor='sevSelect'>Tag Severity*</label>
                <select id="sevSelect" value={severity} onChange={e => setSeverity(e.target.value)}>
                    <option value="">Select severity</option>
                    <option key={1} value={"Impaired Functionality"}>Impaired Functionality</option>
                    <option key={2} value={"Non-critical"}>Non-critical</option>
                    <option key={3} value={"Minor"}>Minor</option>
                    <option key={4} value={"Catastrophic"}>Catastrophic</option>
                </select>

                <label htmlFor="projectDescription">Tag Description*</label>
                <textarea
                    id="projectDescription"
                    name="projectDescription"
                    required
                    value={tagDescription}
                    onChange={(e) => setTagDescription(e.target.value)}
                ></textarea>

                <label htmlFor="teamMembers">Assigned Members</label>
                <select id='teamSelect' multiple onChange={handleAssignedMemberChange} value={assignedMembers}>
                    {projectMembers.map((member, index) => (
                        <option key={index} value={member}>{member}</option>
                    ))}
                </select>
                <div>
                    <h3>Selected Members:</h3>
                    <ul>
                        {assignedMembers.map((member, index) => (
                            <li key={index}>{member}</li>
                        ))}
                    </ul>
                </div>

                <button type="submit">Create Tag</button>
                <button onClick={() => navigate('/dashboard')}>Close <span className="las la-times"></span></button>
                </form>
            </div>
            </div>
        </body>
    )
}