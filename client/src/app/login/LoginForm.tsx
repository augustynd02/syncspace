'use client'

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import styles from './Form.module.scss';

import { FaLock , FaUser, FaSpinner, FaChevronRight } from "react-icons/fa";
import { useRouter } from 'next/navigation';

type FormData = {
    username: string;
    password: string;
}

type FormErrors = {
    username?: string;
    password?: string;
    general?: string;
}

const handleLogin = async (credentials: FormData) => {
    // TODO: remove artificial delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
        const response = await fetch("http://localhost:8000/api/auth/login", {
            method: 'POST',
            headers: { 'Content-type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(credentials),
        })

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Login failed");
        }
        return data;
    } catch (err) {
        throw err;
    }
}

export default function LoginForm({ handleFormToggle }: { handleFormToggle: () => void }) {
    const [formData, setFormData] = useState<FormData>({ username: '', password: '' });
    const [formError, setFormError] = useState<string | undefined>();
    const router = useRouter();

    const mutation = useMutation({
        mutationFn: handleLogin,
        onSuccess: () => {
            router.push('/');
        },
        onError: (err) => {
            setFormError(err.message);
        }
    })

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormError(undefined);
        setFormData({ ...formData, [name]: value });
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate(formData);
    }

    return (
        <section className={styles.loginContainer}>
            <h2>Login to syncspace</h2>
            <form onSubmit={handleSubmit}>
                <div className={styles.inputGroup}>
                    <label htmlFor="login-username">Username</label>
                    <input type="text" name="username" id="login-username" onChange={handleInputChange} placeholder=" " />
                    <FaUser />
                </div>

                <div className={styles.inputGroup}>
                    <label htmlFor="login-password">Password</label>
                    <input type="password" name="password" id="login-password" onChange={handleInputChange} placeholder=" " />
                    <FaLock />
                </div>

                <button type="submit" disabled={mutation.isPending}>
                    { mutation.isPending ? <FaSpinner /> : null }
                    Login
                </button>

                { formError && <p className={styles.generalError} key={Date.now()}>{formError}</p> }
            </form>
            <p>Don't have an account? <span className={styles.formSwitch} onClick={handleFormToggle}>Register <FaChevronRight /> </span></p>
        </section>
    )
}
