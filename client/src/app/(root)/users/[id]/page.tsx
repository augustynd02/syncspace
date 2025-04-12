import Feed from "@/components/Feed/Feed";
import Post from "@/types/Post";
import styles from "./UserPage.module.scss";
import getUser from "@/utils/getUser";
import UploadImageButton from "@/components/UploadImageButton/UploadImageButton";
import EditProfileButton from "@/components/UpdateInfoButton/EditProfileButton";
import { MdAddPhotoAlternate } from "react-icons/md";
import User from "@/types/User";

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

interface Params {
    params: {
        id: string;
    }
}

export default async function userPage({ params }: Params) {
    const posts = await getUserPosts(params.id);
    const user: User = await getUserInfo(params.id);
    const currentUser = await getUser();

    const isOwner = user.id === currentUser?.id;

    return (
        <main className={styles.userMain}>
            <section className={styles.profileContainer}>
                <section className={styles.profileImages}>
                    <div className={styles.backgroundContainer}>
                        <img src={user.background_url} className={styles.backgroundImage} />
                        { isOwner && <UploadImageButton type="background_file"> <MdAddPhotoAlternate /> </UploadImageButton>}
                    </div>
                    <div className={styles.avatarContainer}>
                        <img src={user.avatar_url} className={styles.avatar} />
                        { isOwner && <UploadImageButton type="avatar_file"> <MdAddPhotoAlternate /> </UploadImageButton>}
                    </div>
                </section>
                <section className={styles.profileInfo}>
                    <h2>{user.name} {user.middle_name} {user.last_name}</h2>
                    <p>{user.bio} </p>
                </section>
                { isOwner && <EditProfileButton className={styles.editProfileButton} user={user}>Edit profile info</EditProfileButton> }
            </section>
            { posts && <Feed posts={posts} />}
        </main>
    )
}
