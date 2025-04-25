import { cookies } from 'next/headers';
import Feed from "@/components/Feed/Feed";
import Post from "@/types/Post";
import styles from "./UserPage.module.scss";
import getUser from "@/utils/getUser";
import UploadImageButton from "@/components/UploadImageButton/UploadImageButton";
import EditProfileButton from "@/components/EditProfileButton/EditProfileButton";
import FriendshipButton from "@/components/FriendshipButton/FriendshipButton";
import FriendList from "@/components/FriendList/FriendList";
import { MdAddPhotoAlternate } from "react-icons/md";
import User from "@/types/User";
import Friendship from "@/types/Friendship";
import { FaLock } from "react-icons/fa";
import DataNotFound from '@/components/DataNotFound/DataNotFound';
import Image from 'next/image';
import { getApiUrl } from '@/utils/api';

const getUserPosts = async (id: string): Promise<Post[] | null> => {
    try {
        const cookieStore = await cookies();
        const token = await cookieStore.get('token')?.value;
        if (!token) {
            return null;
        }

        const response = await fetch(getApiUrl(`/api/users/${id}/posts`), {
            method: 'GET',
            credentials: 'include',
            headers: {
                Cookie: `token=${token}`
            }
        });
        const data = await response.json();

        if (!response.ok) {
            console.error('Error fetching posts: ', data);
            return null;
        }

        return data.posts;
    } catch (err) {
        console.log(err instanceof Error ? err.message : 'An error occured when fetching posts');
        return null;
    }
}

const getUserInfo = async (id: string) => {
    try {
        const cookieStore = await cookies();
        const token = await cookieStore.get('token')?.value;

        const response = await fetch(getApiUrl(`/api/users/${id}`), {
            method: 'GET',
            credentials: 'include',
            headers: {
                Cookie: `token=${token}`
            }
        })

        const data = await response.json();

        if (!response.ok) {
            console.error('Error fetching user: ', data);
            return null;
        }

        return data.user;
    } catch (err) {
        console.log(err instanceof Error ? err.message : 'An error occured when fetching user');
        return null;
    }
}

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

const getFriendshipStatus = async (id1: string, id2: string) => {
    try {
        const cookieStore = await cookies();
        const token = await cookieStore.get('token')?.value;
        if (!token) {
            return null;
        }

        const response = await fetch(getApiUrl(`/api/friendships/status?user1=${id1}&user2=${id2}`), {
            method: 'GET',
            credentials: 'include',
            headers: {
                Cookie: `token=${token}`
            }
        })
        const data = await response.json();
        if (!response.ok) {
            console.error('Error fetching user: ', data);
            return null;
        }

        return data.friendship
    } catch (err) {
        console.log(err instanceof Error ? err.message : 'An error occured when fetching friendship status');
        return null;
    }
}

interface Params {
    params: Promise<{
        id: string;
    }>;
}

export default async function UserPage({ params }: Params) {
    const { id } = await params;
    const posts = await getUserPosts(id);
    const user: User = await getUserInfo(id);
    const friends: User[] = await getFriends(id);
    const currentUser = await getUser();
    let friendship: Friendship | undefined;

    console.log(user, currentUser);
    const isOwner = user.id === currentUser?.id;

    if (!isOwner && currentUser) {
        friendship = await getFriendshipStatus(user.id, currentUser.id);
    }

    return (
        <main className={styles.userMain}>
            <section className={styles.profileContainer}>
                <section className={styles.profileImages}>
                    <div className={styles.backgroundContainer}>
                        <Image
                            src={user.background_url!}
                            alt={`${user.name}'s background image`}
                            fill
                            className={styles.backgroundImage}
                        />
                        {isOwner && (
                            <UploadImageButton type="background_file">
                                <MdAddPhotoAlternate />
                            </UploadImageButton>
                        )}
                    </div>
                    <div className={styles.avatarContainer}>
                        <Image
                            src={user.avatar_url || 'placeholder.jpg'}
                            alt={`${user.name}'s avatar`}
                            fill
                            sizes="192px"
                            className={styles.avatar}
                        />
                        {isOwner && (
                            <UploadImageButton type="avatar_file">
                                <MdAddPhotoAlternate />
                            </UploadImageButton>
                        )}
                    </div>
                </section>
                <section className={styles.profileInfo}>
                    <h2>{user.name} {user.middle_name} {user.last_name}</h2>
                    <p>{user.bio}</p>
                </section>
                {!isOwner && currentUser && <FriendshipButton friendship={friendship} currentUserId={currentUser.id} userId={user.id} />}
                {isOwner && (
                    <EditProfileButton
                        className={styles.editProfileButton}
                        user={user}
                    >
                        Edit profile info
                    </EditProfileButton>
                )}
            </section>
            <section className={styles.profileContent}>
                {!currentUser ? (
                    <DataNotFound fullWidth={true} >
                        <FaLock />
                        <p>You must log in to view {user.name}&#39;s content and information.</p>
                    </DataNotFound>
                ) : (
                    <>
                        {isOwner || (friendship && friendship.status === 'accepted') ? (
                            <FriendList users={friends} />
                        ) : (
                            <DataNotFound>
                                <FaLock />
                                <p>You must be friends with this user to see their friends list.</p>
                            </DataNotFound>
                        )}

                        {posts && <Feed posts={posts} />}
                    </>
                )}
            </section>
        </main>
    )
}
