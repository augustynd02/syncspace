import type PostType from "@/types/Post";
import styles from './Post.module.scss';
import formatDate from "@/utils/formatDate";
import Likes from "../Likes/Likes";

export default function Post({ post }: { post: PostType }) {
    const date = post.created_at.slice(0, 10);
    return (
        <article className={styles.post}>
            <header className={styles.postHeader}>
                <img src={post.user.avatar_url} />
                <div className={styles.authorInfo}>
                    <h3>{`${post.user.name} ${post.user.middle_name ? post.user.middle_name : ''} ${post.user.last_name}`}</h3>
                    <time dateTime={date}>{formatDate(date)}</time>
                </div>
            </header>

            <section className={styles.postContent}>
                <p>{post.message}</p>
                <img src={post.imageUrl} />
            </section>

            <footer className={styles.postFooter}>
                <Likes post_id={post.id} content_type="post" initialCount={post.likes.length} hasLiked={post.hasLiked} />
            </footer>
        </article>
    )
}
