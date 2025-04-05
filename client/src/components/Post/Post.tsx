import type PostType from "@/types/Post";
import styles from './Post.module.scss';
import { FaUserCircle } from "react-icons/fa";
import formatDate from "@/utils/formatDate";

export default function Post({ post }: { post: PostType }) {
    const date = post.created_at.slice(0, 10);
    return (
        <article className={styles.post}>
            <header className={styles.postHeader}>
                <FaUserCircle />
                <div className={styles.authorInfo}>
                    <h3>{`${post.user.name} ${post.user.middle_name ? post.user.middle_name : ''} ${post.user.last_name}`}</h3>
                    <time dateTime={date}>{formatDate(date)}</time>
                </div>
            </header>

            <section className={styles.postContent}>
                <p>{post.message}</p>
            </section>

            <footer className={styles.postFooter}>

            </footer>
        </article>
    )
}
