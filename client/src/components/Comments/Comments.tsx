'use client'

import Comment from "@/types/Comment";
import { useState, useEffect, useRef, useContext } from "react"
import styles from './Comments.module.scss'
import formatDate from "@/utils/formatDate";
import { MdSend } from "react-icons/md";
import { useMutation } from "@tanstack/react-query";
import { toast } from 'react-toastify';
import UserContext from "@/contexts/UserContext";
import Likes from "../Likes/Likes";
import Button from "../Button/Button";
import Modal from "../Modal/Modal";

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

        return data.comment;
    } catch (err) {
        throw err;
    }
}

const deleteComment = async ({ post_id, comment_id }: { post_id: string; comment_id: string;}) => {
    try {
        const response = await fetch(`http://localhost:8000/api/posts/${post_id}/comments/${comment_id}`, {
            method: 'DELETE',
            credentials: 'include'
        })

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Could not create post.");
        }

    } catch (err) {
        throw err;
    }
}

export default function Comments({ initialComments, postId }: { initialComments: Comment[], postId: string }) {
    const [comments, setComments] = useState(initialComments);
    const [newComment, setNewComment] = useState('');
    const [expanded, setExpanded] = useState(false);
    const [openModalCommentId, setOpenModalCommentId] = useState<number | null>(null);

    const { user } = useContext(UserContext);

    const deleteCommentMutation = useMutation({
        mutationFn: deleteComment,
        onSuccess: () => {
            toast.success('Comment deleted');
        },
        onError: (err) => {
            toast.error(err.message || 'Could not delete comment');
        }
    })

    const createCommentMutation = useMutation({
        mutationFn: createComment,
        onSuccess: () => {
            toast.success('Comment successfully added!');
        },
        onError: (err) => {
            toast.error(err.message || 'Could not add the comment.');
        }
    })

    const handleCommentDeletion = (commentId: string) => {
        if (!user) return;

        setComments(prev =>
            prev.filter(comment => comment.id !== parseInt(commentId))
        )

        deleteCommentMutation.mutate({
            post_id: postId,
            comment_id: commentId
        })
    }

    const handleSubmitComment = () => {
        if (!user) return;

        const temporaryId = Date.now();

        // Optimistic UI, id is temporary - on refresh the comment will be replaced with it's DB record.
        setComments([...comments, {
            id: temporaryId,
            content: newComment,
            user_id: parseInt(user.id),
            post_id: parseInt(postId),
            created_at: new Date().toISOString(),
            likes: [],
            user: user,
            hasLiked: false
        }])

        createCommentMutation.mutate({
            commentMessage: newComment,
            contentType: 'post',
            contentId: postId
        }, {
            onSuccess: (data) => {
                setComments(prev =>
                    prev.map(comment =>
                        comment.id === temporaryId
                            ? {...comment, id: data.id}
                            : comment
                    )
                )
            }
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
                            <article className={styles.commentContainer} key={comment.id}>
                                <section className={styles.comment}>
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
                                </section>
                                <div className={styles.commentActions}>
                                    <Likes
                                        post_id={postId}
                                        comment_id={comment.id.toString()}
                                        content_type='comment'
                                        initialCount={comment.likes.length}
                                        hasLiked={comment.hasLiked}
                                    />
                                    {user && comment.user_id === parseInt(user.id)
                                        ? (
                                            <>
                                                <Button
                                                    variant='text'
                                                    size='small'
                                                    onClick={() => setOpenModalCommentId(comment.id)}
                                                >Delete comment</Button>
                                                <Modal
                                                    isOpen={openModalCommentId === comment.id}
                                                    onClose={() => setOpenModalCommentId(null)}
                                                    title="Delete comment"
                                                >
                                                    <p className={styles.modalMessage}>Are you sure you want to delete this comment?</p>
                                                    <div className={styles.modalButtons}>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() => setOpenModalCommentId(null)}
                                                        >
                                                            Cancel
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            onClick={() => handleCommentDeletion(comment.id.toString())}
                                                        >
                                                            Yes, delete
                                                        </Button>
                                                    </div>
                                                </Modal>
                                            </>

                                        )
                                        : null
                                    }
                                </div>
                            </article>
                        )
                    })}
                    <div className={styles.commentCreator}>
                        <div className={styles.avatarContainer}>
                            <img src={user?.avatar_url} />
                        </div>
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
                </div>
            )}
        </>
    )
}
