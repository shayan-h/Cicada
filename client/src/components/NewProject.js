import React, {useState, useEffect} from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'


export default function NewProject() {
  const [projectName, setProjectName] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [teamMembers, setTeamMembers] = useState([''])

  const navigate = useNavigate();

  const addTeamMember = () => {
    setTeamMembers([...teamMembers, ''])
  }

  const handleTeamMemberChange = (index, value) => {
    const updatedTeamMembers = [...teamMembers]
    updatedTeamMembers[index] = value
    setTeamMembers(updatedTeamMembers)
  }

  const handleSubmitForm = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post('http://localhost:3002/newProject', { projectName, projectDescription, teamMembers })
      if (response.data.authenticated && response.data.validation) {
        navigate('/dashboard')
      }
    } catch (error) {
      console.error('Error during form submission:', error)
    }
  }

  return (
    <div className="container">
      <h2>Create a New Project</h2>
      <form id="newProjectForm" onSubmit={handleSubmitForm}>
        <label htmlFor="projectName">Project Name*</label>
        <input
          type="text"
          id="projectName"
          name="projectName"
          required
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
        />

        <label htmlFor="projectDescription">Project Description</label>
        <textarea
          id="projectDescription"
          name="projectDescription"
          required
          value={projectDescription}
          onChange={(e) => setProjectDescription(e.target.value)}
        ></textarea>

        <label htmlFor="teamMembers">Team Members</label>
        <div id="teamMembersContainer">
          {teamMembers.map((value, index) => (
            <input
              key={index}
              type="text"
              name={`teamMembers[${index}]`}
              placeholder="Add team member"
              value={value}
              onChange={(e) => handleTeamMemberChange(index, e.target.value)}
            />
          ))}
        </div>
        <button type="button" onClick={addTeamMember}>
          Add Team Member
        </button>

        <button type="submit">Create Project</button>
      </form>
    </div>
  )
}