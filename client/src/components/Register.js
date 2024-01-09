import React, { useState } from 'react'
import { Button, Checkbox, Form, Input } from 'antd';
import { useNavigate } from 'react-router-dom'
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


    return (
        <div style={{display:'flex', justifyContent:'center', alignItems:'center'}}>
            <div style={{width:400}}>
            
            <h1 style={{textAlign:'center'}}>Sign-up</h1>


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
                    <Input />
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
                    <Input />
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
                    <Input />
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
                    <Input.Password />
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
                    <Input.Password />
                </Form.Item>

                <Form.Item
                    name="remember"
                    valuePropName="checked"
                    wrapperCol={{
                    offset: 8,
                    span: 16,
                    }}
                >
                    <Checkbox>Remember me</Checkbox>
                </Form.Item>

                <Form.Item
                    wrapperCol={{
                    offset: 8,
                    span: 16,
                    }}
                >
                    <Button type="primary" htmlType="submit">
                    Submit
                    </Button>
                    Or <a href="/">Login</a>
                </Form.Item>
                </Form>
            </div>
        </div>
  )
}
