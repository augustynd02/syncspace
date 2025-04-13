import User from "@/types/User";
import styles from './FriendList.module.scss';
import { PiSmileySadLight } from "react-icons/pi";

export default function FriendList({ users }: { users: User[] }) {
    return (
        <>
            {users.length === 0 ? (
                <div className={styles.noFriends}>
                    <PiSmileySadLight />
                    <p>No friends... yet!</p>
                </div>
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
            <img src={user.avatar_url} alt="" />
            <span>{user.name} {user.middle_name} {user.last_name}</span>
        </a>
    )
}
