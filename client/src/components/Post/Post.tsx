import type PostType from "@/types/Post";
import styles from './Post.module.scss';
import formatDate from "@/utils/formatDate";
import Likes from "../Likes/Likes";
import Comments from "../Comments/Comments";
import getUser from "@/utils/getUser";
import PostActions from "../PostActions/PostActions";
import Image from "next/image";

export default async function Post({ post, initialyExpanded = false }: { post: PostType, initialyExpanded?: boolean }) {
    const user = await getUser();

    const date = post.created_at.slice(0, 10);
    return (
        <article className={styles.post}>
            <header className={styles.postHeader}>
                <Image
                    src={post.user.avatar_url!}
                    alt={`${post.user.name}'s avatar`}
                    width={40}
                    height={40}
                />

                <div className={styles.authorInfo}>
                    <h3>{`${post.user.name} ${post.user.middle_name ? post.user.middle_name : ''} ${post.user.last_name}`}</h3>
                    <time dateTime={date}>{formatDate(date)}</time>
                </div>
                {user && user.id === post.user.id
                    ? (
                        <PostActions id={post.id} />
                    ) : (
                        null
                    )
                }
            </header>

            <section className={styles.postContent}>
                <p>{post.message}</p>
                { post.imageUrl
                    ? (
                        <img src={post.imageUrl} alt={`${post.user.name}'s post image`} />
                    ) : (
                        null
                    )
                }
            </section>

            <footer className={styles.postFooter}>
                <Likes post_id={post.id} content_type="post" initialCount={post.likes.length} hasLiked={post.hasLiked} />
                <Comments initialComments={post.comments} postId={post.id} initialyExpanded={initialyExpanded} />
            </footer>
        </article>
    )
}
