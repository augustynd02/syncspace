'use client'

import React, { useState } from 'react';
import styles from './LoginForm.module.scss';

type FormData = {
    username: string;
    password: string;
}

export default function LoginForm() {
    const [formData, setFormData] = useState<FormData>({ username: '', password: '' });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    }

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        try {
            e.preventDefault();

            const response = await fetch("http://localhost:8000/api/auth/login", {
                method: 'POST',
                headers: { 'Content-type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData),
            })

            const data = await response.json();

            if (response.ok) {
                console.log('Logged with id: ', data.user.id);
            }
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <section className={styles.loginContainer}>
            <h2>Login to syncspace</h2>
            <form onSubmit={handleLogin}>
                <div className={styles.inputGroup}>
                    <label htmlFor="username">Username</label>
                    <input type="text" name="username" id="username" onChange={handleInputChange} placeholder=" " />
                </div>

                <div className={styles.inputGroup}>
                    <label htmlFor="password">Password</label>
                    <input type="password" name="password" id="password" onChange={handleInputChange} placeholder=" " />
                </div>

                <button type="submit">Login</button>
            </form>
        </section>
    )
}
