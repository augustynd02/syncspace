'use client'

import Comment from "@/types/Comment";
import { useState, useEffect, useRef } from "react"
import styles from './Comments.module.scss'
import formatDate from "@/utils/formatDate";

export default function Comments({ initialComments }: { initialComments: Comment[] }) {
    const [comments, setComments] = useState(initialComments);
    const [expanded, setExpanded] = useState(false);

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
                </div>
            )}
        </>
    )
}
