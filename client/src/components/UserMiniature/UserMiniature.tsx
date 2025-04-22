import React from 'react';
import styles from './UserMiniature.module.scss';
import User from '@/types/User';
import Link from 'next/link';

interface UserMiniatureProps {
  user: User;
}

const UserMiniature: React.FC<UserMiniatureProps> = ({ user }) => {
  const fullName = user.middle_name
    ? `${user.name} ${user.middle_name} ${user.last_name}`
    : `${user.name} ${user.last_name}`;

  return (
    <Link href={`/users/${user.id}`} className={styles.miniature}>
      <div className={styles.avatarContainer}>
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.avatar_name}
            className={styles.avatar}
          />
        ) : (
          <div className={styles.avatarPlaceholder}>
            {user.name.charAt(0)}{user.last_name.charAt(0)}
          </div>
        )}
      </div>
      <div className={styles.userInfo}>
        <h3 className={styles.fullName}>{fullName}</h3>
        {user.bio && <p className={styles.bio}>{user.bio.length > 60 ? `${user.bio.substring(0, 60)}...` : user.bio}</p>}
      </div>
    </Link>
  );
};

export default UserMiniature;
