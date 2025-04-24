'use client'

import { useState } from 'react';
import styles from './Likes.module.scss'
import { IoMdHeart, IoMdHeartEmpty } from "react-icons/io";
import { getApiUrl } from "@/utils/api";

interface LikesProps {
    post_id: string;
    comment_id?: string;
    content_type: 'post' | 'comment';
    initialCount: number;
    hasLiked: boolean;
}

const handleLike = async ({ content_type, post_id, comment_id, hasUserLiked }: { content_type: string, post_id: string, comment_id?: string, hasUserLiked: boolean }) => {
    try {
        let url;

        if (content_type === 'post') {
            url = `posts/${post_id}/likes`;
        } else {
            url = `posts/${post_id}/comments/${comment_id}/likes`;
        }

        const response = await fetch(getApiUrl(`/api/${url}`), {
            method: hasUserLiked === true ? 'DELETE' : 'POST',
            credentials: 'include'
        })

        const data = await response.json();

        console.log(data);
    } catch (err) {
        console.log(err);
    }
}

export default function Likes({ post_id, content_type, initialCount, comment_id, hasLiked }: LikesProps) {
    const [hasUserLiked, setHasUserLiked] = useState(hasLiked);
    const [count, setCount] = useState(initialCount);
    return (
        <div className={`${styles.likesContainer} ${content_type === 'comment' ? styles.commentLikes : ''}`}>
            <button onClick={() => {
                if (hasUserLiked) {
                    setCount(count - 1);
                } else {
                    setCount(count + 1);
                }
                setHasUserLiked(!hasUserLiked);
                handleLike({
                    content_type: content_type,
                    post_id: post_id,
                    comment_id: comment_id,
                    hasUserLiked: hasUserLiked
                })
            }}>
                {hasUserLiked ? <IoMdHeart /> : <IoMdHeartEmpty />}
            </button>
            {count}
        </div>
    )
}
