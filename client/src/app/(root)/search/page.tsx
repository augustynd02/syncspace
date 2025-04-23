import Feed from "@/components/Feed/Feed";
import Post from "@/types/Post";
import User from "@/types/User";
import Link from "next/link";
import styles from './SearchPage.module.scss'
import { FaUser } from "react-icons/fa";
import { MdArticle } from "react-icons/md";
import UserMiniature from "@/components/UserMiniature/UserMiniature";

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
    searchParams: Promise<{ q?: string; category?: string }>;
}) {
    const params = await searchParams;
    const query = params.q || '';
    const category = params.category || '';

    const data = category === 'posts' ? await getPostsByQuery(query) : await getUsersByQuery(query);

    return (
        <main className={styles.searchMain}>
            <div className={styles.categoryButtons}>
                <Link href={`/search?q=${query}&category=users`} className={category === 'users' ? styles.active : ''}><FaUser /></Link>
                <Link href={`/search?q=${query}&category=posts`} className={category === 'posts' ? styles.active : ''}><MdArticle /></Link>
            </div>

            {!data ? (
                <p>No data found.</p>
            ) : (
                <section className={styles.searchResults}>
                    <h2>Showing {data.length} result{data.length !== 1 ? 's' : ''} for &#34;{query}&#34;:</h2>
                    {category === 'posts' ? (
                        <Feed posts={data as Post[]} />
                    ) : (
                        <ul className={styles.usersList}>
                            {(data as User[]).map((user) => (
                                <li key={user.id}>
                                    <UserMiniature user={user} className={styles.userMiniature} />
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            )}
        </main>
    )
}
