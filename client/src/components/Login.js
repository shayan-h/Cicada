import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, Checkbox } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import axios from 'axios'

const useLogin = () => {
    const navigate = useNavigate()
    const onFinish = async (values) => {
        const { email, password } = values
        try {
            const response = await axios.post('http://localhost:3002/validatePassword', { email, password })
            if (response.data.validation) {
                navigate('/home')
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

    return (
        <div style={{display:'flex', justifyContent:'center', alignItems:'center'}}>

            <div style={{width:400}}>

                <h1 style={{textAlign:'center'}}>Login</h1> 


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
                Forgot password
                </a>
            </Form.Item>

            <Form.Item>
                <Button type="primary" htmlType="submit" className="login-form-button">
                Log in
                </Button>
                Or <a href="/Register">register now!</a>
            </Form.Item>
            </Form>


            </div>
            
        </div>
    )
}
