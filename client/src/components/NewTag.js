import React, {useState, useEffect} from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/NewProject.css'
import axios from 'axios'


export default function NewTag() {
    const [tagName, setTagName] = useState('')
    const [project, setProject] = useState('')
    const [severity, setSeverity] = useState('')
    const [tagDescription, setTagDescription] = useState('')
    const [assignedMembers, setAssignedMembers] = useState([''])

    const navigate = useNavigate();
    axios.defaults.withCredentials = true

    const [projects, setProjData] = useState([])
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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get("http://localhost:3002/newTag/getTeam", {project})
                if (response.data.authenticated) {
                    console.log("Project members set")
                    setProjectMembers(response.data.team)
                } else {
                    navigate('/')
                }
            } catch (error) {
                console.log("Error during team fetch", error)
            }
        }
        fetchData()
    }, [])

    const handleSubmitForm = async (event) => {
        event.preventDefault();

        try {
            const response = await axios.post('http://localhost:3002/newTag', { tagName, tagDescription, assignedMembers })
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
                <select id="projectSelect" value={project} onChange={e => setProject(e.target.value)}>
                    <option value="">Select project</option>
                    {projects.map(proj => (
                        <option key={proj.id} value={proj.id}>{proj.projName}</option>
                    ))}
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
                    {projectMembers.map((member, index) => {
                        <option key={index} value={member}>{member}</option>
                    })}
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