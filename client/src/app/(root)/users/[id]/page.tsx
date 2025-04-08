import Feed from "@/components/Feed/Feed";
import Post from "@/types/Post";

const getUserPosts = async (id: string): Promise<Post[] | null> => {
    const response = await fetch(`http://localhost:8000/api/users/${id}/posts`, {
        method: 'GET',
        credentials: 'include',
    });
    const data = await response.json();

    if (!response.ok) {
        console.error('Errpr fetching posts: ', data);
        return null;
    }

    return data.posts;
}

const getUserInfo = async (id: string) => {
    const response = await fetch(`http://localhost:8000/api/users/${id}`, {
        method: 'GET',
        credentials: 'include'
    })
    const data = await response.json();

    if (!response.ok) {
        console.error('Error fetching user: ', data);
        return null;
    }

    return data.user;
}

interface Params {
    params: {
        id: string;
    }
}

export default async function userPage({ params }: Params) {
    const posts = await getUserPosts(params.id);
    const user = await getUserInfo(params.id);
    console.log(user);

    return (
        <>
            { posts && <Feed posts={posts} />}
        </>
    )
}
