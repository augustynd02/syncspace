import UserMiniature from '../UserMiniature/UserMiniature';
import styles from './FriendSuggestions.module.scss'
import { cookies } from 'next/headers';
import User from '@/types/User';

const getRandomUsers = async () => {
    const cookieStore = await cookies();
	const token = await cookieStore.get('token')?.value;

	if (!token) {
		return null;
	}

	const response = await fetch('http://localhost:8000/api/users/random', {
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

	return data.users as User[];
}

export default async function FriendSuggestions() {
    const users = await getRandomUsers();
    return (
        <section className={styles.friendSuggestions}>
            <h2>Friend suggestions</h2>
            {users && users.map(user =>
                <UserMiniature key={user.id} user={user} className={styles.userMiniature} />
            )}
        </section>
    )
}
