"use client"

import { useState } from "react";

export default function Login() {
    const [loginFormData, setLoginFormData] = useState({ username: '', password: '' });
    const [registerFormData, setRegisterFormData] = useState({ username: '', password: '', name: '', last_name: ''})

    const handleLoginChange = (e) => {
        const { name, value } = e.target;
        setLoginFormData({ ...loginFormData, [name]: value })
    }

    const handleRegisterChange = (e) => {
        const { name, value } = e.target;;
        setRegisterFormData({ ...registerFormData, [name]: value });
    }

    const handleLoginSubmit = async (e) => {
        try {
            e.preventDefault();

            const response = await fetch("http://localhost:8000/api/auth/login", {
                method: 'POST',
                headers: { 'Content-type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(loginFormData),
            })

            const data = await response.json();

            if (response.ok) {
                console.log('logged: ', data.user.id);
            }
        } catch (err) {
            console.error(err);
        }
    }

    const handleRegisterSubmit= async (e) => {
        try {
            e.preventDefault();

            const response = await fetch("http://localhost:8000/api/users", {
                method: 'POST',
                headers: { 'Content-type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(registerFormData),
            })

            const data = await response.json();

            if (response.ok) {
                console.log(data);
            }
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <>
            <form action="" onSubmit={handleLoginSubmit}>
                <input type="text" name="username" id="username" onChange={handleLoginChange} />
                <input type="password" name="password" id="password" onChange={handleLoginChange} />
                <button type="submit">submit</button>
            </form>

            <h2>register</h2>
            <form action="" onSubmit={handleRegisterSubmit}>
                <input type="text" name="username" id="username" onChange={handleRegisterChange} />
                <input type="password" name="password" id="password" onChange={handleRegisterChange} />
                <input type="text" name="name" id="name" onChange={handleRegisterChange} />
                <input type="text" name="last_name" id="last_name" onChange={handleRegisterChange} />
                <button type="submit">submit</button>
            </form>
        </>
    )
}
