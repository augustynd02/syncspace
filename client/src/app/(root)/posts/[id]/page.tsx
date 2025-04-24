import Post from "@/components/Post/Post";
import styles from './PostPage.module.scss';
import { getApiUrl } from "@/utils/api";

const getPost = async (id: string) => {
    const response = await fetch(getApiUrl(`/api/posts/${id}`), {
        method: 'GET',
    })

    const data = await response.json();

    if (!response.ok) {
        return null;
    }

    return data.post;
}

interface Params {
    params: Promise<{
        id: string;
    }>;
}

export default async function PostPage({ params }: Params) {
    const { id } =  await params;
    const post = await getPost(id);

    return (
        <main className={styles.postMain}>
            <Post post={post} initialyExpanded={true} />
        </main>
    )
}
