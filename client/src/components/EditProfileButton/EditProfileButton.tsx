'use client';

import React, {
    ReactNode,
    useState,
    useEffect,
    useRef,
    ChangeEvent,
    FormEvent,
} from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button/Button';
import Modal from '@/components/Modal/Modal';
import User from '@/types/User';
import styles from './EditProfileButton.module.scss';

interface EditProfileButtonProps {
    children: ReactNode;
    className?: string;
    user: User;
}

type FormData = {
    name: string;
    middle_name?: string;
    last_name: string;
    bio?: string;
};

const handleEdit = async ({
    id,
    formData,
}: {
    id: string;
    formData: FormData;
}) => {
    try {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Profile edition failed');
        }
    } catch (err) {
        throw err;
    }
};

export default function EditProfileButton({
    children,
    className = '',
    user,
}: EditProfileButtonProps) {
    const [formData, setFormData] = useState<FormData>({
        name: user.name,
        middle_name: user.middle_name || '',
        last_name: user.last_name,
        bio: user.bio || '',
    });
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    const mutation = useMutation({
        mutationFn: handleEdit,
        onSuccess: () => {
            toast.success('User profile successfully edited!');
            setIsModalOpen(false);
            router.refresh();
        },
        onError: (err) => {
            toast.error(err.message || 'Something went wrong while editing profile.');
        },
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        mutation.mutate({ id: user.id, formData });
    };

    const adjustHeight = () => {
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
    }, [isModalOpen]);

    return (
        <div className={className}>
            <Button onClick={() => setIsModalOpen(true)}>{children}</Button>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Edit profile"
            >
                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="name">Name</label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder=""
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="middle_name">Middle name</label>
                        <input
                            type="text"
                            name="middle_name"
                            id="middle_name"
                            value={formData.middle_name}
                            onChange={handleChange}
                            placeholder=""
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="last_name">Last name</label>
                        <input
                            type="text"
                            name="last_name"
                            id="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            placeholder=""
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="bio">Bio</label>
                        <textarea
                            name="bio"
                            id="bio"
                            ref={textareaRef}
                            rows={1}
                            value={formData.bio}
                            onChange={handleChange}
                            placeholder=""
                        />
                    </div>

                    <div className={styles.buttons}>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={mutation.isPending}>
                            Edit
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
