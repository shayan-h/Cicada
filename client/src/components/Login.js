import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, Checkbox } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import '../styles/Login.css'
import axios from 'axios'

const useLogin = () => {
    const navigate = useNavigate()
    axios.defaults.withCredentials = true
    const onFinish = async (values) => {
        const { email, password } = values
        try {
            const response = await axios.post('http://localhost:3002/login', { email, password })
            if (response.data.validation) {
                navigate('/dashboard')
                // alert('Login succesful')
            } else {
                alert('Incorrect email or password')
            }
        } catch (error) {
            console.error('Error during login:', error)
        }
    }
    return { onFinish }
}

export default function Login() {

    const { onFinish } = useLogin()
    const navigate = useNavigate()
    axios.defaults.withCredentials = true
    const [authenticated, setAuthenticated] = useState(false)

    useEffect(() => {
        const checkAuthentication = async () => {
          try {
            const response = await axios.get('http://localhost:3002/login/auth')
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
        <div className="login-page" style={{display:'flex', justifyContent:'center', alignItems:'center'}}>

            <div style={{width:400}}>

            <h1 style={{ textAlign: 'center', fontSize: '2em', color: '#fff' }}>Login</h1> 


            <Form
            name="normal_login"
            className="login-form"
            initialValues={{remember: true,}}
            onFinish={onFinish}
            >
            <Form.Item
                name="email"
                rules={[
                {
                    required: true,
                    message: 'Please input your email!',
                },
                ]}
            >
                <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Email" />
            </Form.Item>
            <Form.Item
                name="password"
                rules={[
                {
                    required: true,
                    message: 'Please input your Password!',
                },
                ]}>
                <Input.Password
                prefix={<LockOutlined className="site-form-item-icon" />}
                type="password"
                placeholder="Password"
                />
            </Form.Item>
            <Form.Item>
                <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>Remember me</Checkbox>
                </Form.Item>

                <a className="login-form-forgot" href="">
                Forgot password?
                </a>
            </Form.Item>

            <Form.Item class="form-item-register">
                <Button type="primary" htmlType="submit" className="login-form-button">
                Log in
                </Button>
                Or <a href="/register">register now!</a>
            </Form.Item>
            </Form>


            </div>
            
        </div>
    )
}
