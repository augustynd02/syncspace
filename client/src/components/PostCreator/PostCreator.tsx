'use client'

import styles from './PostCreator.module.scss';
import { FaUserCircle } from "react-icons/fa";
import { FaImage } from "react-icons/fa6";
import React, { useRef, useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';

const createPost = async (postFormData: FormData) => {
    try {
        const response = await fetch('http://localhost:8000/api/posts/', {
            method: 'POST',
            credentials: 'include',
            body: postFormData
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

interface FormDataType {
    postMessage: string;
    postImage: File | null;
}

export default function PostCreator() {
    const [formData, setFormData] = useState<FormDataType>({
        postMessage: '',
        postImage: null
    })
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    const mutation = useMutation({
        mutationFn: createPost,
        onSuccess: () => {
            console.log('post created');
        },
        onError: (err) => {
            console.log('error creating post:', err)
        }
    })


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const postFormData = new FormData();
        postFormData.append('postMessage', formData.postMessage);
        if (formData.postImage) {
            postFormData.append('postImage', formData.postImage);
        }
        mutation.mutate(postFormData);
    };

    const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            postMessage: e.target.value
        })
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFormData({
                ...formData,
                postImage: e.target.files[0]
            })
        }
    }

    const adjustHeight = (): void => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    };

    useEffect(() => {
        const textarea = textareaRef.current;

        if (textarea) {
            textarea.addEventListener('input', adjustHeight);
            adjustHeight();
            return () => {
                textarea.removeEventListener('input', adjustHeight);
            };
        }
    }, []);

    return (
        <section className={styles.postCreator}>
            <FaUserCircle />
            <form onSubmit={handleSubmit} encType="multipart/form-data">
                <textarea
                    ref={textareaRef}
                    onChange={handleMessageChange}
                    name="postMessage"
                    id="postMessage"
                    rows={1}
                    placeholder="Share something with your space"
                />
                <div className={styles.actions}>
                    <label htmlFor="postImage" title="Add image">
                        <FaImage />
                        <input type="file" name="postImage" id="postImage" onChange={handleFileChange} />
                    </label>
                </div>
                <button type="submit">Sync up</button>
            </form>
        </section>
    );
}
