import Feed from "@/components/Feed/Feed";
import Post from "@/types/Post";
import User from "@/types/User";
import Link from "next/link";

const getPostsByQuery = async (query: string) => {
    const response = await fetch(`http://localhost:8000/api/posts?q=${query}`, {
        method: 'GET'
    })

    const data = await response.json();

    if (!response.ok) {
        return null;
    }

    return data.posts as Post[];
}

const getUsersByQuery = async (query: string) => {
    const response = await fetch(`http://localhost:8000/api/users?q=${query}`, {
        method: 'GET'
    })

    const data = await response.json();

    if (!response.ok) {
        return null;
    }

    return data.users as User[];
}

export default async function SearchPage({
    searchParams
}: {
    searchParams: { q?: string; category?: string }
}) {
    const query = searchParams.q || '';
    const category = searchParams.category || '';

    const data = category === 'posts' ? await getPostsByQuery(query) : await getUsersByQuery(query);

    return (
        <main>
            <div className="categoryButtons">
                <Link href={`/search?q=${query}&category=users`}>Users</Link>
                <Link href={`/search?q=${query}&category=posts`}>Posts</Link>
            </div>

            {!data ? (
                <p>No data found.</p>
            ) : (
                <>
                    <h2>Showing {data.length} result{data.length !== 1 ? 's' : ''} for "{query}":</h2>
                    {category === 'posts' ? (
                        <Feed posts={data as Post[]} />
                    ) : (
                        <ul>
                            {(data as User[]).map((user) => (
                                <li key={user.id}>{user.name}</li>
                            ))}
                        </ul>
                    )}
                </>
            )}
        </main>
    )
}
