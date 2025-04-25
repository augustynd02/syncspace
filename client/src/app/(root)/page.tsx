export const dynamic = 'force-dynamic';

import { redirect } from "next/navigation";
import { cookies } from 'next/headers';
import getUser from "@/utils/getUser";
import Feed from "@/components/Feed/Feed";
import PostCreator from "@/components/PostCreator/PostCreator";
import FriendSuggestions from "@/components/FriendSuggestions/FriendSuggestions";
import styles from "./Root.module.scss"
import { getApiUrl } from "@/utils/api";

async function getFeed() {
	try {
		const cookieStore = await cookies();
		const token = await cookieStore.get('token')?.value;

		if (!token) {
			return null;
		}

		const response = await fetch(getApiUrl(`/api/posts/feed`), {
			method: 'GET',
			credentials: 'include',
			headers: {
				Cookie: `token=${token}`
			}
		});
		const data = await response.json();
		if (!response.ok) {
			console.error(data)
		}

		return data.feed;
	} catch (err) {
		console.log(err instanceof Error ? err.message : 'An error occured when fetching feed');
        return null;
	}
}

export default async function Home() {
	const user = await getUser();
	const feed = await getFeed();

	if (!user) {
		redirect('/login');
	}
	return (
		<main className={styles.mainContainer}>
			<aside className={styles.sidebar}>
				<PostCreator />
				<FriendSuggestions />
			</aside>
			<Feed posts={feed} />
		</main>
	);
}
