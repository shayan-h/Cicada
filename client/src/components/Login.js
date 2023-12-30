import React from 'react'
import { Form, Input, Button, Checkbox } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import axios from 'axios'

export default function Login() {

    const onFinish = values => {
        const {email, password} = values
        axios.post('http://localhost:3002/validatePassword', {email, password})
        .then(res => {
            if (res.data.validation) {
                alert('Login succesful!')
            } else {
                alert('Incorrect email or password')
            }
        })
    }

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
                ]}
            >
                <Input
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
                Or <a href="">register now!</a>
            </Form.Item>
            </Form>


            </div>
            
        </div>
    )
}
