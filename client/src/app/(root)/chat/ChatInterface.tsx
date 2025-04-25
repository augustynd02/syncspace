'use client'

import { useState } from 'react'
import styles from './ChatInterface.module.scss'
import User from "@/types/User"
import Image from 'next/image'

export default function ChatInterface({ friends }: { friends: User[] }) {
    const [currentChatUser, setCurrentChatUser] = useState<User | null>(null)

    return (
        <section className={styles.chatContainer}>
            <aside className={styles.friendsList}>
                <ul>
                    {friends.map((friend) => (
                        <li
                            key={friend.id}
                            onClick={() => setCurrentChatUser(friend)}
                            className={currentChatUser?.id === friend.id ? styles.activeChat : undefined}
                        >
                            <div className={styles.avatarContainer}>
                                <Image
                                    src={friend.avatar_url || 'placeholder.jpg'}
                                    alt={`${friend.name}'s avatar`}
                                    width={32}
                                    height={32}
                                />
                            </div>
                            <div className={styles.nameContainer}>
                                {`${friend.name} ${friend.middle_name || ''} ${friend.last_name}`}
                            </div>
                        </li>
                    ))}
                </ul>
            </aside>
            <section className={styles.chat}>
                <header>
                    {currentChatUser?.name}
                </header>
            </section>
        </section>
    )
}
