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

const getUserPosts = async (id: string): Promise<Post[] | null> => {
    const response = await fetch(`http://localhost:8000/api/users/${id}/posts`, {
        method: 'GET',
        credentials: 'include',
    });
    const data = await response.json();

    if (!response.ok) {
        console.error('Errpr fetching posts: ', data);
        return null;
    }

    return data.posts;
}

const getUserInfo = async (id: string) => {
    const response = await fetch(`http://localhost:8000/api/users/${id}`, {
        method: 'GET',
        credentials: 'include'
    })
    const data = await response.json();

    if (!response.ok) {
        console.error('Error fetching user: ', data);
        return null;
    }

    return data.user;
}

const getFriends = async (id: string) => {
    const response = await fetch(`http://localhost:8000/api/users/${id}/friends`, {
        method: 'GET',
        credentials: 'include'
    })
    const data = await response.json();

    if (!response.ok) {
        console.error('Error fetching user: ', data);
        return null;
    }

    return data.friends;
}

const getFriendshipStatus = async (id1: string, id2: string) => {
    const response = await fetch(`http://localhost:8000/api/friendships/status?user1=${id1}&user2=${id2}`, {
        method: 'GET',
        credentials: 'include'
    })
    const data = await response.json();
    if (!response.ok) {
        console.error('Error fetching user: ', data);
        return null;
    }
    console.log(data)
    return data.friendship
}

interface Params {
    params: {
        id: string;
    }
}

export default async function UserPage({ params }: Params) {
    const posts = await getUserPosts(params.id);
    const user: User = await getUserInfo(params.id);
    const friends: User[] = await getFriends(params.id);
    const currentUser = await getUser();
    let friendship: Friendship | undefined;

    const isOwner = user.id === currentUser?.id;

    if (!isOwner && currentUser) {
        friendship = await getFriendshipStatus(user.id, currentUser.id);
    }

    return (
        <main className={styles.userMain}>
            <section className={styles.profileContainer}>
                <section className={styles.profileImages}>
                    <div className={styles.backgroundContainer}>
                        <img
                            src={user.background_url}
                            className={styles.backgroundImage}
                        />
                        {isOwner && (
                            <UploadImageButton type="background_file">
                                <MdAddPhotoAlternate />
                            </UploadImageButton>
                        )}
                    </div>
                    <div className={styles.avatarContainer}>
                        <img
                            src={user.avatar_url}
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
                {friends && <FriendList users={friends} />}
                {posts && <Feed posts={posts} />}
            </section>
        </main>
    )
}
