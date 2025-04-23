import { cookies } from 'next/headers';
import User from '@/types/User';

export default async function getUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const token = await cookieStore.get('token')?.value;

    if (!token) {
      return null;
    }

    const response = await fetch('http://localhost:8000/api/users/me', {
        method: 'GET',
        credentials: 'include',
        headers: {
            Cookie: `token=${token}`
        },
        cache: 'no-store'
    })

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}
