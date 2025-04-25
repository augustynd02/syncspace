import styles from './ChatPage.module.scss';
import { cookies } from 'next/headers';
import { getApiUrl } from '@/utils/api';
import getUser from '@/utils/getUser';
import { redirect } from 'next/navigation';
import ChatInterface from './ChatInterface';

const getFriends = async (id: string) => {
    try {
        const cookieStore = await cookies();
        const token = await cookieStore.get('token')?.value;
        if (!token) {
            return null;
        }

        const response = await fetch(getApiUrl(`/api/users/${id}/friends`), {
            method: 'GET',
            credentials: 'include',
            headers: {
                Cookie: `token=${token}`
            }
        })
        const data = await response.json();

        if (!response.ok) {
            console.error('Error fetching friends: ', data);
            return null;
        }

        return data.friends;
    } catch (err) {
        console.log(err instanceof Error ? err.message : 'An error occured when fetching friends');
        return null;
    }
}

export default async function ChatPage() {
    const currentUser = await getUser();

    if (!currentUser) {
        redirect('/login')
    }

    const friends = await getFriends(currentUser.id);
    return (
        <main className={styles.chatMain}>
            <ChatInterface friends={friends} />
        </main>
    )
}
