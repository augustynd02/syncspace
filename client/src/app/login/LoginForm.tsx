'use client'

import React, { useState, useContext } from 'react';
import UserContext from '@/contexts/UserContext';
import { useMutation } from '@tanstack/react-query';
import styles from './Form.module.scss';

import { FaLock, FaUser, FaChevronRight } from "react-icons/fa";
import { useRouter } from 'next/navigation';
import Button from '@/components/Button/Button';
import { toast } from 'react-toastify';

type FormData = {
    username: string;
    password: string;
}

const handleLogin = async (credentials: FormData) => {
    // TODO: remove artificial delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(credentials),
        })

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Login failed");
        }
        return data.user;
    } catch (err) {
        throw err;
    }
}

export default function LoginForm({ handleFormToggle }: { handleFormToggle: () => void }) {
    const [formData, setFormData] = useState<FormData>({ username: '', password: '' });
    const { setUser } = useContext(UserContext);
    const router = useRouter();

    const mutation = useMutation({
        mutationFn: handleLogin,
        onSuccess: (user) => {
            setUser(user);
            toast.success('Successfully logged in!');
            router.push('/');
        },
        onError: (err) => {
            toast.error(err.message || 'Could not log you in.');
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

                <Button type="submit" disabled={mutation.isPending} isLoading={mutation.isPending} size="medium">
                    Login
                </Button>
            </form>
            <p>Don&#39;t have an account? <span className={styles.formSwitch} onClick={handleFormToggle}>Register <FaChevronRight /> </span></p>
        </section>
    )
}
