'use client'

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import styles from './Form.module.scss';

import { FaLock , FaUser, FaSpinner, FaChevronRight } from "react-icons/fa";
import { useRouter } from 'next/navigation';

type FormData = {
    username: string;
    password: string;
    name: string;
    last_name: string;
}

const handleRegister = async (credentials: FormData) => {
    // TODO: remove artificial delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
        const response = await fetch("http://localhost:8000/api/users", {
            method: 'POST',
            headers: { 'Content-type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(credentials),
        })

        const data = await response.json();

        if (!response.ok) {
            throw new Error('Login failed');
        }
        return data;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

export default function RegisterForm({ handleFormToggle }: { handleFormToggle: () => void }) {
    const [formData, setFormData] = useState<FormData>({ username: '', password: '', name: '', last_name: '' });
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const router = useRouter();

    const mutation = useMutation({
        mutationFn: handleRegister,
        onSuccess: () => {
            console.log('registered');
        },
        onError: (err) => {
            console.error('Login failed: ', err);
        }
    })

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate(formData);
    }

    return (
        <section className={styles.loginContainer}>
            <h2>Create an account</h2>
            <form onSubmit={handleSubmit}>
                <div className={styles.inputGroup}>
                    <label htmlFor="register-username">Username</label>
                    <input type="text" name="username" id="register-username" onChange={handleInputChange} placeholder=" " />
                    <FaUser />
                </div>

                <div className={styles.inputGroup}>
                    <label htmlFor="register-password">Password</label>
                    <input type="password" name="password" id="register-password" onChange={handleInputChange} placeholder=" " />
                    <FaLock />
                </div>

                <div className={styles.inputGroup}>
                    <label htmlFor="register-confirm-password">Confirm password</label>
                    <input type="password" name="confirm-password" id="register-confirm-password" onChange={handleInputChange} placeholder=" " />
                    <FaLock />
                </div>

                <div className={styles.inputRow}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="register-name">First name</label>
                        <input type="text" name="name" id="register-name" onChange={handleInputChange} placeholder=" " />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="register-name">Last name</label>
                        <input type="text" name="last_name" id="register-last-name" onChange={handleInputChange} placeholder=" " />
                    </div>
                </div>

                <button type="submit" disabled={mutation.isPending}>
                    { mutation.isPending ? <FaSpinner /> : null }
                    Register
                </button>

                { mutation.isError ? 'error' : null}
            </form>
            <p>Already have an account? <span className={styles.formSwitch} onClick={handleFormToggle}>Login <FaChevronRight /> </span></p>
        </section>
    )
}
