import React, {useState, useEffect} from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/Dashboard.css'
import axios from 'axios'

export default function Projects() {

    const navigate = useNavigate()
    axios.defaults.withCredentials = true
    const [name, setData] = useState('')
    const [projects, setProjData] = useState([])
    const [tags, setTagData] = useState([])
    const [project, setProjectIdData] = useState('')

    useEffect(() => {
        const fetchData = async () => {
          try {
            const response = await axios.get("http://localhost:3002/dashboard")
            if (response.data.authenticated) {
              setData(response.data.name)
              setProjData(response.data.projects)
              if (response.data.projects.length > 0) {
                handleProjectSelect(response.data.projects[0].id)
              }
            } else {
              navigate('/')
            }
          } catch (error) {
            console.log("Error during dashboard fetch", error)
          }
        }
        fetchData()
      }, [])

    const fetchProjectTags = async (projectId) => {
        try {
            const response = await axios.get("http://localhost:3002/projects", { params: { project: projectId } })
            if (response.data.authenticated) {
                setTagData(response.data.tags)
            } else {
                navigate('/');
            }
        } catch (error) {
            console.log("Error during team fetch", error) 
        }
    }

    const handleProjectSelect = (projectId) => {
        setProjectIdData(projectId)
        fetchProjectTags(projectId)
    } 

    const handleNewTagButtonClick = () => {
        navigate('/NewTag')
    }

    const deleteProject = async () => {
        try {
            const response = await axios.post("http://localhost:3002/newProject/delete", { project: project })
            if (response.data.authenticated) {
                setProjData(projects.filter(proj => proj.id !== project))
                if (projects.length > 0) {
                    handleProjectSelect(projects[0].id)
                }
            } else {
                navigate('/')
            }
        } catch (error) {
            navigate('/dashboard')
        }
    }

    return (
    <body>
        <input type="checkbox" id="nav-toggle" />
        <div className="sidebar">
            <div className="sidebar-brand">
                <h2><span className="las la-bug"></span><span>Cicada</span></h2>
            </div>

            <div className="sidebar-menu">
                <ul>
                    <li>
                        <a href="/dashboard"><span className="las la-stream"></span>
                        <span>Dashboard</span></a>
                    </li>
                    <li>
                        <a href="" className="active"><span className="las la-code-branch"></span>
                        <span>Projects</span></a>
                    </li>
                    <li>
                        <a href="tags"><span className="las la-bug"></span>
                        <span>Tags</span></a>
                    </li>
                    <li>
                        <a href="settings"><span className="las la-cog"></span>
                        <span>Settings</span></a>
                    </li>
                </ul>
            </div>
        </div>

        <div className="main-content">
            <header>
                <h2>
                    <label htmlFor="nav-toggle">
                        <span className="las la-bars"></span>
                    </label>

                    Project Name
                    <select id="projectSelect" value={project} onChange={e => handleProjectSelect(e.target.value)}>
                        <option value="" disabled hidden>Select Project</option>
                        {projects.map(proj => (
                            <option key={proj.id} value={proj.id}>{proj.projName}</option>
                        ))}
                    </select>
                    <button onClick={deleteProject}>Delete Project</button>
                </h2>
                <div className="user-wrapper">
                    <img src={process.env.PUBLIC_URL + '/bug_danger_data_internet_malware_security_virus_icon_127084.ico'} width="40px" height="40px" alt="" />
                    <div>
                    <h4>Hello, {name}</h4>
                    <small>Student</small>
                    </div>
                </div>
            </header>

            <main>
                <div className="projects">
                    <div className="card">
                        <div className="card-header">
                            <h3>Tags</h3>

                            <button id="newProjectButton" onClick={handleNewTagButtonClick}>
                                New Tag <span className="las la-plus"></span>
                            </button>
                        </div>

                        <div className="card-body">
                            <div className="table-responsive">
                                <table width="100%">
                                    <thead>
                                        <tr>
                                            <td>Tag name</td>
                                            <td>Type</td>
                                            <td>Severity</td>
                                            <td>Assigned to</td>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tags.map(tag => (
                                            <tr key={tag.id}>
                                                <td>{tag.tagName}</td>
                                                <td>{tag.tagStatus}</td>
                                                <td>{tag.tagSev}</td>
                                                <td>{tag.tagAssi}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="recent-grid">
                    <div className="projects">
                        <div className="card">
                            <div className="card-header">
                                <h3>Chat</h3>

                                <button>Comment <span className="las la-plus"></span></button>
                            </div>
                        </div>
                    </div>
                    <div className="tags">
                        <div className="card">
                            <div className="card-header">
                                <h3>Cicada.AI</h3>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    </body>
    )
}