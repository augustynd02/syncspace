'use client'

import styles from './PostCreator.module.scss';
import { FaImage } from "react-icons/fa6";
import React, { useRef, useEffect, useState, useContext } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import Button from '../Button/Button';
import UserContext from '@/contexts/UserContext';
import Image from 'next/image';
import { getApiUrl } from "@/utils/api";

interface FormDataType {
    postMessage: string;
    postImage: File | null;
}

const createPost = async (postFormData: FormData) => {
    try {
        const response = await fetch(getApiUrl(`/api/posts/`), {
            method: 'POST',
            credentials: 'include',
            body: postFormData
        })

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Could not create post.");
        }
        return data;
    } catch (err) {
        throw err;
    }
}

export default function PostCreator() {
    const [formData, setFormData] = useState<FormDataType>({
        postMessage: '',
        postImage: null
    })

    const { user } = useContext(UserContext);

    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    const mutation = useMutation({
        mutationFn: createPost,
        onSuccess: () => {
            toast.success('Post successfully created!');
        },
        onError: (err) => {
            toast.error(err.message || 'Could not create post.');
        }
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.postMessage === '' && formData.postImage === null) {
            toast.error("Can't submit an empty post.");
            return;
        }
        setFormData({
            postMessage: '',
            postImage: null
        })
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
            const selectedFile = e.target.files[0];
            const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

            if (validImageTypes.includes(selectedFile.type)) {
                setFormData({
                    ...formData,
                    postImage: selectedFile
                });
            } else {
                toast.error('Please upload a valid image file (JPEG, PNG, GIF, WebP).');
                e.target.value = '';
            }
        }
    };

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

    if (!user) return null;

    return (
        <section className={styles.postCreator}>
            <Image
                src={user.avatar_url || 'placeholder.jpg'}
                alt={`${user.name}'s avatar`}
                width={32}
                height={32}
            />
            <form onSubmit={handleSubmit} encType="multipart/form-data">
                <textarea
                    ref={textareaRef}
                    onChange={handleMessageChange}
                    value={formData.postMessage}
                    name="postMessage"
                    id="postMessage"
                    rows={1}
                    placeholder="Share something with your space"
                />
                <div className={styles.actions}>
                    <label htmlFor="postImage" title="Add image">
                        <FaImage />
                        {formData.postImage ? 'Image attached!' : 'Attach image' }
                        <input type="file" name="postImage" id="postImage" onChange={handleFileChange} accept="image/*"/>
                    </label>
                </div>
                <Button
                    type="submit"
                    size="medium"
                >
                    Sync up
                </Button>
            </form>
        </section>
    );
}
