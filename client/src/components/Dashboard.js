import React, {useState, useEffect} from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/Dashboard.css'
import axios from 'axios'


export default function Dashboard() {

  const navigate = useNavigate()
  axios.defaults.withCredentials = true
  // The following line of code can be changed set to different types of data from the server
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

  const handleDelete = () => {
    axios.get('http://localhost:3002/login/logout')
    .then(res => {
      window.location.reload(true)
    }).catch(err => console.log(err))
  }

  const handleNewProjectButtonClick = () => {
    navigate('/NewProject')
  }

  const handleNewTagButtonClick = () => {
    navigate('/NewTag')
  }

  return (
    <body>
      <input type="checkbox" id="nav-toggle" />
      <div className="sidebar">
        <div className="sidebar-brand">
          <h2>
            <span className="las la-bug"></span>
            <span>Cicada</span>
          </h2>
        </div>

        <div className="sidebar-menu">
          <ul>
            <li>
              <a href="" className="active">
                <span className="las la-stream"></span>
                <span>Dashboard</span>
              </a>
            </li>
            <li>
              <a href="/projects">
                <span className="las la-code-branch"></span>
                <span>Projects</span>
              </a>
            </li>
            <li>
              <a href="tags">
                <span className="las la-bug"></span>
                <span>Tags</span>
              </a>
            </li>
            <li>
              <a href="settings">
                <span className="las la-cog"></span>
                <span>Settings</span>
              </a>
            </li>
            <button className="btn btn-danger" onClick={handleDelete}>Logout</button>
          </ul>
        </div>
      </div>

      <div className="main-content">
        <header>
          <h2>
            <label htmlFor="nav-toggle">
              <span className="las la-bars"></span>
            </label>
            Dashboard
          </h2>
          <div className="search-wrapper">
            <span className="las la-search"></span>
            <input type="search" placeholder="Looking for something?" />
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
          <div className="cards">
          <div class="card-single">
                    <div>
                        <h1>612</h1>
                        <span>Projects</span>
                    </div>
                    <div>
                        <span class="las la-code-branch"></span>
                    </div>
                </div>
                <div class="card-single">
                    <div>
                        <h1>612</h1>
                        <span>Tags</span>
                    </div>
                    <div>
                        <span class="las la-bug"></span>
                    </div>
                </div>
                <div class="card-single">
                    <div>
                        <h1>612</h1>
                        <span>Team</span>
                    </div>
                    <div>
                        <span class="las la-clone"></span>
                    </div>
                </div>
                <div class="card-single">
                    <div>
                        <h1>612</h1>
                        <span>Cicada.AI</span>
                    </div>
                    <div>
                        <span class="las la-robot"></span>
                    </div>
                </div>
          </div>
          <div className="recent-grid">
            <div className="projects">
              <div className="card">
                <div className="card-header">
                  <h3>Projects</h3>
                  <button id="newProjectButton" onClick={handleNewProjectButtonClick}>
                    New Project <span className="las la-plus"></span>
                  </button>
                  {/* Your script for newProjectButton click event here */}
                </div>

                <div className="card-body">
                  <div className="table-responsive">
                    <table width="100%">
                      <thead>
                        <tr>
                          <td>Project name</td>
                          <td>Status</td>
                        </tr>
                      </thead>
                      <tbody>
                        {projects.map(project => (
                          <tr key={project.id}>
                            <td>{project.projName}</td>
                            <td>
                              <span className={`status ${project.status === 'Complete' ? 'green' : 'red'}`}></span>
                              {project.status}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="tags">
              <div className="card">
                <div className="card-header">
                  <h3>Your Tags</h3>
                  <button id="newProjectButton" onClick={handleNewTagButtonClick}>
                    New Tag <span className="las la-plus"></span>
                  </button>
                </div>

                <div className="card-body">
                  {/* Your tag components here */}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </body>
  )
}
