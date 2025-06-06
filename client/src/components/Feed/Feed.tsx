import type PostType from "@/types/Post";
import styles from './Feed.module.scss';
import Post from '@/components/Post/Post';
import { PiEmpty } from "react-icons/pi";
import DataNotFound from "../DataNotFound/DataNotFound";

export default function Feed({ posts }: { posts: PostType[] }) {
    return (
        <section className={styles.feed}>
            {posts.length === 0 && (
                <DataNotFound>
                    <PiEmpty />
                    <p>No posts found...</p>
                </DataNotFound>
            )}
            {posts.map(post => {
                return <Post key={post.id} post={post} />
            })}

        </section>
    )
}
