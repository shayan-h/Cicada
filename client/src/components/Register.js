import React, { useState, useEffect } from 'react'
import { Button, Checkbox, Form, Input } from 'antd';
import { useNavigate } from 'react-router-dom'
import '../styles/Register.css'
import axios from 'axios'

const useRegister = () => {
    const navigate = useNavigate()
    const onFinish = async (values) => {
        const { fName, lName, email, password } = values
        try {
            const response = await axios.post('http://localhost:3002/register', { fName, lName, email, password })
            if (response.data.validation) {
                navigate('/')
            } else {
                alert('Incorrect email or password')
            }
        } catch (error) {
            console.error('Error during sign-up:', error)
        }
    }
    return { onFinish }
}

export default function Register() {

    const { onFinish } = useRegister()
    const navigate = useNavigate()
    axios.defaults.withCredentials = true
    const [authenticated, setAuthenticated] = useState(false)

    useEffect(() => {
        const checkAuthentication = async () => {
          try {
            const response = await axios.get('http://localhost:3002/register/auth')
            setAuthenticated(response.data.authenticated)
            if (response.data.authenticated) {
              navigate('/dashboard')
            }
          } catch (error) {
            console.error('Error checking authentication:', error)
          }
        }
        checkAuthentication()
      }, [navigate])


    return (
            <div className="registration-container">
    <div className="registration-box">
        <h1 className="registration-title" style={{fontSize: '2em'}}>Sign-up</h1>

        <Form
        name="basic"
        labelCol={{
            span: 8,
        }}
        wrapperCol={{
            span: 16,
        }}
        style={{
            maxWidth: 600,
        }}
        initialValues={{
            remember: true,
        }}
        onFinish={onFinish}
        autoComplete="off"
        >
        <Form.Item
            label="First Name"
            name="fName"
            rules={[
            {
                required: true,
                message: 'Please input your first name!',
            },
            ]}
        >
            <Input placeholder="Enter your first name" />
        </Form.Item>

        <Form.Item
            label="Last Name"
            name="lName"
            rules={[
            {
                required: true,
                message: 'Please input your last name!',
            },
            ]}
        >
            <Input placeholder="Enter your last name" />
        </Form.Item>

        <Form.Item
            label="Email"
            name="email"
            rules={[
            {
                type: 'email',
                message: 'Invalid email address',
            },
            {
                required: true,
                message: 'Please input your email!',
            },
            ]}
        >
            <Input placeholder="Enter your email address" />
        </Form.Item>

        <Form.Item
            label="Password"
            name="password"
            rules={[
            {
                required: true,
                message: 'Please input your password!',
            },
            ]}
        >
            <Input.Password placeholder="Enter your password" />
        </Form.Item>

        <Form.Item
            label="Confirm Password"
            name="confirmPassword"
            dependencies={['password']}
            hasFeedback
            rules={[
            {
                required: true,
                message: 'Please confirm your password!',
            },
            ({ getFieldValue }) => ({
                validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                }
                return Promise.reject(new Error('The two passwords do not match!'));
                },
            }),
            ]}
        >
            <Input.Password placeholder="Confirm your password" />
        </Form.Item>

        

        <Form.Item class="form-item-sub"
            wrapperCol={{
            offset: 8,
            span: 16,
            }}
        >
            <Button className= "registration-form-button"type="primary" htmlType="submit">
            Submit
            </Button>
            Or <a href="/">Login</a>
        </Form.Item>
        </Form>
    </div>
    </div>

  )
}
