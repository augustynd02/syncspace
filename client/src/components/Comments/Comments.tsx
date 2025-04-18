'use client'

import Comment from "@/types/Comment";
import { useState, useEffect, useRef } from "react"
import styles from './Comments.module.scss'
import formatDate from "@/utils/formatDate";
import { MdSend } from "react-icons/md";
import { useMutation } from "@tanstack/react-query";
import { toast } from 'react-toastify';

const createComment = async ({ commentMessage, contentType, contentId }: { commentMessage: string, contentType: 'post' | 'comment', contentId: string }) => {
    try {
        const response = await fetch(`http://localhost:8000/api/posts/${contentId}/comments`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                commentMessage,
                contentType,
                contentId
            })
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

export default function Comments({ initialComments, postId }: { initialComments: Comment[], postId: string }) {
    const [comments, setComments] = useState(initialComments);
    const [newComment, setNewComment] = useState('');
    const [expanded, setExpanded] = useState(false);

    const mutation = useMutation({
        mutationFn: createComment,
        onSuccess: () => {
            toast.success('Post successfully created!');
        },
        onError: (err) => {
            toast.error(err.message || 'Could not create post.');
        }
    })

    const handleSubmitComment = () => {
        mutation.mutate({
            commentMessage: newComment,
            contentType: 'post',
            contentId: postId
        })
    }

    return (
        <>
            <button
                onClick={() => setExpanded(!expanded)}
                className={styles.commentsButton}>
                <span>{comments.length === 0 ? `Add comment` : expanded ? `Hide comments` : `Show ${comments.length} ${comments.length === 1 ? 'comment' : 'comments'}`}</span>
            </button>

            {expanded && (
                <div className={`${styles.comments} ${expanded ? styles.open : ""}`} >
                    {comments.map(comment => {
                        return (
                            <article className={styles.comment}>
                                <header className={styles.commentHeader}>
                                    <img src={comment.user.avatar_url} alt="" />
                                    <div className={styles.authorInfo}>
                                        <h3>{`${comment.user.name} ${comment.user.middle_name ? comment.user.middle_name : ''} ${comment.user.last_name}`}</h3>
                                        <time dateTime={comment.created_at.slice(0, 10)}>{formatDate(comment.created_at.slice(0, 10))}</time>
                                    </div>
                                </header>
                                <section className={styles.commentContent}>
                                    <p>{comment.content}</p>
                                </section>
                            </article>
                        )
                    })}
                    <div className={styles.inputContainer}>
                        <input
                            type="text"
                            name="comment"
                            id="comment"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder='Write a new comment'
                        />
                        <button
                            onClick={handleSubmitComment}
                        ><MdSend /></button>
                    </div>
                </div>
            )}
        </>
    )
}
