import Feed from "@/components/Feed/Feed";
import Post from "@/types/Post";
import styles from "./UserPage.module.scss";
import getUser from "@/utils/getUser";
import UploadImageButton from "@/components/UploadImageButton/UploadImageButton";
import { MdAddPhotoAlternate } from "react-icons/md";

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
    const user = await getUserInfo(params.id);
    const currentUser = await getUser();

    return (
        <main className={styles.userMain}>
            <section className={styles.profileContainer}>
                <section className={styles.profileImages}>
                    <div className={styles.backgroundContainer}>
                        <img src={user.background_url} className={styles.backgroundImage} />
                        { user.id === currentUser?.id ? <UploadImageButton type="background_file"> <MdAddPhotoAlternate /> </UploadImageButton> : null }
                    </div>
                    <div className={styles.avatarContainer}>
                        <img src={user.avatar_url} className={styles.avatar} />
                        { user.id === currentUser?.id ? <UploadImageButton type="avatar_file"> <MdAddPhotoAlternate /> </UploadImageButton> : null }
                    </div>
                </section>
                <section className={styles.profileInfo}>
                    <h2>{user.name} {user.middle_name} {user.last_name}</h2>
                </section>
            </section>
            { posts && <Feed posts={posts} />}
        </main>
    )
}
