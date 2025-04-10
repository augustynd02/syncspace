'use client'

import React, { ReactNode, useContext, useRef } from "react";
import UserContext from "@/contexts/UserContext";
import Button from "../Button/Button";
import styles from './UploadImageButton.module.scss';
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

interface UploadImageButtonProps {
    children: ReactNode;
    type: 'background_file' | 'avatar_file'
}

export default function UploadImageButton({ children, type }: UploadImageButtonProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { user } = useContext(UserContext)
    const router = useRouter();

    const handleClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !user) {
            return;
        }
        const file = e.target.files[0]

        const formData = new FormData();
        formData.append(type, file);

        try {
            const response = await fetch(`http://localhost:8000/api/users/${user.id}`, {
                method: 'PUT',
                credentials: 'include',
                body: formData
            })

            const data = await response.json();

            if (!response.ok) {
                toast.error('Could not upload image.')
                return;
            }

            toast.success('Image uploaded!');
            router.refresh();
        } catch(err) {
            toast.error('Could not upload image.');
        }
    }

    return (
        <div className={styles.uploadImageButton}>
            <Button onClick={handleClick} size='icon'>
                { children }
            </Button>
            <input
                ref={fileInputRef}
                type="file"
                id="backgroundImage"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
            />
        </div>
    )
}
