import type PostType from "@/types/Post";
import styles from './Feed.module.scss';
import Post from '@/components/Post/Post';

export default function Feed({ posts }: { posts: PostType[] }) {
    return (
        <section className={styles.feed}>
            { posts.map(post => {
                return <Post key={post.id} post={post} />
            }) }

        </section>
    )
}
