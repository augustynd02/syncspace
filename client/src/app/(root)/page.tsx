import { redirect } from "next/navigation";
import { cookies } from 'next/headers';
import getUser from "@/utils/getUser";
import Feed from "@/components/Feed/Feed";

async function getFeed() {
	const cookieStore = await cookies();
	const token = await cookieStore.get('token')?.value;

	if (!token) {
		return null;
	}

	const response = await fetch('http://localhost:8000/api/posts/feed', {
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
	const user = await getUser();
	const feed = await getFeed();

	if (!user) {
		redirect('/login');
	}
	return (
		<Feed posts={feed} />
	);
}
