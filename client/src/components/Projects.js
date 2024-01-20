import React, {useState, useEffect} from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/Dashboard.css'
import axios from 'axios'

export default function Projects() {

    const navigate = useNavigate()
    axios.defaults.withCredentials = true
    const [name, setData] = useState('')
    const [projects, setProjData] = useState([])

    useEffect(() => {
        const fetchData = async () => {
          try {
            const response = await axios.get("http://localhost:3002/dashboard")
            if (response.data.authenticated) {
              setData(response.data.name)
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
                </h2>
                <div className="search-wrapper">
                    <span className="las la-search"></span>
                    <input type="search" placeholder="Search projects" />
                </div>
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

                            <button>New tag <span className="las la-plus"></span></button>
                        </div>

                        <div className="card-body">
                            <div className="table-responsive">
                                <table width="100%">
                                    <thead>
                                        <tr>
                                            <td>Tag</td>
                                            <td>Severity</td>
                                            <td>Status</td>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    
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