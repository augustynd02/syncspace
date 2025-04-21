import Post from "@/components/Post/Post";
import styles from './PostPage.module.scss';

const getPost = async (id: string) => {
    const response = await fetch(`http://localhost:8000/api/posts/${id}`, {
        method: 'GET',
    })

    const data = await response.json();

    if (!response.ok) {
        return null;
    }

    return data.post;
}

interface Params {
    params: {
        id: string;
    }
}

export default async function PostPage({ params }: Params) {
    const { id } = await params;
    const post = await getPost(id);

    return (
        <main className={styles.postMain}>
            <Post post={post} initialyExpanded={true} />
        </main>
    )
}
