import User from "@/types/User";
import styles from './FriendList.module.scss';
import { PiSmileySadLight } from "react-icons/pi";
import Image from "next/image";
import DataNotFound from "../DataNotFound/DataNotFound";

export default function FriendList({ users }: { users: User[] }) {
    return (
        <>
            {users.length === 0 ? (
                <DataNotFound fullWidth>
                    <PiSmileySadLight />
                    <p>No friends... yet!</p>
                </DataNotFound>
            ) : (
                <div className={styles.friendListContainer}>
                <h3>Friends ({users.length})</h3>
                <div className={styles.friendList}>
                    { users.map(user => {
                        return <UserMiniature key={user.id} user={user} />
                    })}
                </div>
            </div>
            )}
        </>
    )
}

function UserMiniature({ user }: { user: User }) {
    return (
        <a href={`/users/${user.id}`} className={styles.userMiniature}>
            <div className={styles.avatarContainer}>
                <Image
                    src={user.avatar_url  || 'placeholder.jpg'}
                    alt={`${user.name}s avatar`}
                    fill
                    sizes="(max-width: 480px) 64px, 96px"
                />
            </div>
            <span>{user.name} {user.middle_name} {user.last_name}</span>
        </a>
    )
}
