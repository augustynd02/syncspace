'use client'

import styles from './PostActions.module.scss'
import { SlOptionsVertical } from "react-icons/sl";
import { MdDelete } from 'react-icons/md';
import Actions from '../Actions/Actions';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

const deletePost = async (id: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${id}`, {
        method: 'DELETE',
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error('Failed to delete post');
    }

    return response.json();
};

export default function PostActions({ id }: { id: string}) {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter()

    const deletePostMutation = useMutation({
        mutationFn: deletePost,
        onSuccess: () => {
            toast.success('Successfully deleted post!')
        },
        onError: (err) => {
            toast.error(err.message || 'Failed to delete the post.');
        }
    })

    return (
        <div className={styles.optionsContainer}>
            <SlOptionsVertical onClick={() => {
                setIsOpen(!isOpen)
            }} />
            <Actions
                position="bottom-left"
                isOpen={isOpen}
                actions={[
                    {
                        icon: <MdDelete />,
                        name: 'Delete post',
                        cb: () => {
                            setIsOpen(false);
                            deletePostMutation.mutate(id);
                            router.refresh();
                        }
                    },
                ]}
            />
        </div>
    )
}
