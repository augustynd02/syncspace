import { redirect } from "next/navigation";
import { cookies } from "next/headers";

async function verifyAuth(): Promise<Boolean> {
	try {
		const cookieStore = await cookies();
		const token = await cookieStore.get('token')?.value;

		const response = await fetch('http://localhost:8000/api/auth', {
			method: 'GET',
			credentials: 'include',
			headers: {
				Cookie: `token=${token}`
			}
		})

		if (!response.ok) {
			return false;
		}

		const data = await response.json();
		if (data.user_id) {
			return true;
		} else {
			return false;
		}

	} catch (err) {
		console.error('Error verifying authentication:', err);
		return false;
	}
}

export default async function Home() {
	const isAuthenticated = await verifyAuth();
	if (!isAuthenticated) {
		redirect('/login');
	}
	return (
		<>
			<div>test</div>
			{isAuthenticated ? 'authenticated' : 'not authenticated'}
		</>
	);
}
