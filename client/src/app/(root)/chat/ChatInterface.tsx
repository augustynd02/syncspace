'use client'

import { useState, useEffect, useRef } from 'react'
import styles from './ChatInterface.module.scss'
import User from "@/types/User"
import Image from 'next/image'
import { MdSend } from 'react-icons/md'
import { toast } from 'react-toastify'
import { getApiUrl } from '@/utils/api'
import Message from '@/types/Message'

export default function ChatInterface({ friends }: { friends: User[] }) {
    const [currentChatUser, setCurrentChatUser] = useState<User | null>(null)
    const [newMessage, setNewMessage] = useState('');
    const [messages, setMessages] = useState<Message[] | null>(null);
    const messagesEnd = useRef<HTMLDivElement>(null);

    const handleSendMessage = async () => {
        try {
            if (newMessage === '') return;
            setNewMessage('');
            if (!currentChatUser) return;
            const response = await fetch(getApiUrl(`/api/messages/${currentChatUser.id}`), {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: newMessage })
            })

            if (!response.ok) {
                toast.error("Failed to send message")
                return;
            }

            const data = await response.json();

            setMessages([...(messages || []), data.message]);
            return data.message;
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to send message");
        }
    }

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                console.log('requesting')
                if (!currentChatUser) return;

                const response = await fetch(getApiUrl(`/api/messages/${currentChatUser.id}`), {
                    method: 'GET',
                    credentials: 'include'
                })

                if (!response.ok) {
                    toast.error('Failed to fetch messages');
                    return;
                }

                const data = await response.json();
                console.log(data);

                console.log(data.messages);
                setMessages(data.messages);
            } catch (err) {
                toast.error(err instanceof Error ? err.message : "Failed to fetch messages")
            }
        }
        fetchMessages();
    }, [currentChatUser])

    useEffect(() => {
        if (messagesEnd.current) {
            messagesEnd.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

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
                {currentChatUser
                    ? (
                        <>
                            <header>
                                <div className={styles.avatarContainer}>
                                    <Image
                                        src={currentChatUser.avatar_url || 'placeholder.jpg'}
                                        alt={`${currentChatUser.name}'s avatar`}
                                        width={32}
                                        height={32}
                                    />
                                </div>
                                <div className={styles.nameContainer}>
                                    {`${currentChatUser.name} ${currentChatUser.middle_name || ''} ${currentChatUser.last_name}`}
                                </div>
                            </header>
                            <section className={styles.messages}>
                                {messages && messages.length > 0
                                    ? (
                                        messages.map((message, i) => {
                                            const prevMessage = messages[i - 1];
                                            const nextMessage = messages[i + 1];

                                            const isFirst = !prevMessage || prevMessage.sender_id !== message.sender_id;
                                            const isLast = !nextMessage || nextMessage.sender_id !== message.sender_id;

                                            return (
                                                <div
                                                    key={message.id}
                                                    className={
                                                        `${styles.message}
                                                         ${message.sender_id === parseInt(currentChatUser.id) ? styles.left : styles.right}
                                                         ${isFirst ? styles.first : ''}
                                                         ${isLast ? styles.last : ''}
                                                        `
                                                    }

                                                >
                                                    {message.content}
                                                </div>

                                            )
                                        })
                                    ) : (
                                        <p>No messages found</p>
                                    )
                                }
                                <div ref={messagesEnd}></div>
                            </section>
                            <div className="inputContainer">
                                <div className={styles.inputContainer}>
                                    <input
                                        type="text"
                                        name="message"
                                        id="message"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder='Write a new message'
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                    >
                                        <MdSend />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <p>Pick a user to view the chat!</p>
                    )
                }
            </section>
        </section>
    )
}
