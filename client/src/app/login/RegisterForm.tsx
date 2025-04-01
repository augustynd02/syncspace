'use client'

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import styles from './Form.module.scss';

import { FaLock, FaUser, FaSpinner, FaChevronRight } from "react-icons/fa";
import { useRouter } from 'next/navigation';

type FormData = {
    username: string;
    password: string;
    name: string;
    last_name: string;
}

type FormErrors = {
    username?: string;
    password?: string;
    confirmPassword?: string;
    name?: string;
    last_name?: string;
    general?: string;
}

type FieldName = "username" | "password" | "confirmPassword" | "name" | "last_name";

const defaultFormData: FormData = {
    username: '',
    password: '',
    name: '',
    last_name: '',
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
    const [formData, setFormData] = useState<FormData>(defaultFormData);
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const router = useRouter();

    const mutation = useMutation({
        mutationFn: handleRegister,
        onSuccess: () => {
            router.push('/');
        },
        onError: (err) => {
            setFormErrors({ ...formErrors, general: 'An error occured during register process.'})
        }
    })

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    }

    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setConfirmPassword(e.target.value);
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate(formData);
    }

    const validateField = (field: FieldName) => {
        let error: string | null = null;

        switch(field) {
            case "username":
                if (formData.username.trim().length === 0) {
                    error = "Username is required."
                    break;
                }
                if (formData.username.length < 3 || formData.username.length > 16) {
                    error = "Username must be between 3 and 16 characters long."
                }
                break;
            case "password":
                if (formData.password.trim().length === 0) {
                    error = "Password is required."
                    break;
                }
                if (formData.password.length < 8) {
                    error = "Password must be at least 8 characters long."
                }
                break;
            case "confirmPassword":
                if (formData.password != confirmPassword) {
                    error = "Passwords must match."
                }
                break;
            case "name":
                if (formData.name.trim().length === 0) {
                    error = "Name is required."
                }
                break;
            case "last_name":
                if (formData.name.trim().length === 0) {
                    error = "Last name is required."
                }
                break;
        }
        return error;
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const name = e.target.name as FieldName;
        const error = validateField(name);
        console.log(name, error)

        setFormErrors({ ...formErrors, [name]: error})
    }

    return (
        <section className={styles.loginContainer}>
            <h2>Create an account</h2>
            <form onSubmit={handleSubmit}>
                <div className={styles.inputGroup}>
                    <label htmlFor="register-username">Username</label>
                    <input type="text" name="username" id="register-username" onChange={handleInputChange} onBlur={handleBlur} placeholder=" " />
                    <FaUser />
                    { formErrors.username && <p className={styles.formError}>{formErrors.username}</p> }
                </div>

                <div className={styles.inputGroup}>
                    <label htmlFor="register-password">Password</label>
                    <input type="password" name="password" id="register-password" onChange={handleInputChange} onBlur={handleBlur} placeholder=" " />
                    <FaLock />
                    { formErrors.password && <p className={styles.formError}>{formErrors.password}</p> }
                </div>

                <div className={styles.inputGroup}>
                    <label htmlFor="register-confirm-password">Confirm password</label>
                    <input type="password" name="confirmPassword" id="register-confirm-password" onChange={handleConfirmPasswordChange} onBlur={handleBlur} placeholder=" " />
                    <FaLock />
                    { formErrors.confirmPassword && <p className={styles.formError}>{formErrors.confirmPassword}</p> }
                </div>

                <div className={styles.inputRow}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="register-name">First name</label>
                        <input type="text" name="name" id="register-name" onChange={handleInputChange} onBlur={handleBlur} placeholder=" " />
                        { formErrors.name && <p className={styles.formError}>{formErrors.name}</p> }
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="register-name">Last name</label>
                        <input type="text" name="last_name" id="register-last-name" onChange={handleInputChange} onBlur={handleBlur} placeholder=" " />
                        { formErrors.last_name && <p className={styles.formError}>{formErrors.last_name}</p>  }
                    </div>
                </div>

                <button type="submit" disabled={mutation.isPending}>
                    {mutation.isPending && <FaSpinner />}
                    Register
                </button>

                { formErrors.general && <p>{formErrors.general}</p> }

                {mutation.isError ? 'error' : null}
            </form>
            <p>Already have an account? <span className={styles.formSwitch} onClick={handleFormToggle}>Login <FaChevronRight /> </span></p>
        </section>
    )
}
