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
	const cookieStore = await cookies();
	const token = await cookieStore.get('token')?.value;

	console.log("Token in getFeed:", token ? "Found token" : "No token found");

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
}

export default async function Home() {
	const cookieStore = await cookies();
	console.log("Available cookies:", cookieStore.getAll().map(c => c.name));
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
