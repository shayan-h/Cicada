import React, {useState, useEffect} from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/NewProject.css'
import axios from 'axios'


export default function NewTag() {
    const [tagName, setTagName] = useState('')
    const [project, setProject] = useState('')
    const [tagDescription, setTagDescription] = useState('')
    const [assignedMembers, setAssignedMembers] = useState([''])

    const navigate = useNavigate();
    axios.defaults.withCredentials = true

    const [projects, setProjData] = useState([])

    const addAssignedMember = () => {
        setAssignedMembers([...assignedMembers, ''])
    }

    const handleAssignedMemberChange = (index, value) => {
        const updatedAssignedMembers = [...assignedMembers]
        updatedAssignedMembers[index] = value
        setAssignedMembers(updatedAssignedMembers)
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

        </body>
    )
}