'use client'

import { useState, useEffect, useRef, useContext } from 'react'
import styles from './ChatInterface.module.scss'
import User from "@/types/User"
import Image from 'next/image'
import { MdSend } from 'react-icons/md'
import { toast } from 'react-toastify'
import { getApiUrl } from '@/utils/api'
import Message from '@/types/Message'
import UserContext from '@/contexts/UserContext'
import { getWsUrl } from '@/utils/api';
import DataNotFound from '@/components/DataNotFound/DataNotFound'

export default function ChatInterface({ friends }: { friends: User[] }) {
    const [currentChatUser, setCurrentChatUser] = useState<User | null>(null)
    const [newMessage, setNewMessage] = useState('')
    const [messages, setMessages] = useState<Message[] | null>(null)
    const messagesEnd = useRef<HTMLDivElement>(null)
    const ws = useRef<WebSocket | null>(null)
    const { user } = useContext(UserContext);

    const handleSendMessage = async () => {
        try {
            if (!user) return;
            if (newMessage === '') return;
            if (!currentChatUser) return;

            const messageToSend = newMessage
            setNewMessage('');

            if (ws.current && ws.current.readyState === WebSocket.OPEN) {
                ws.current.send(JSON.stringify({
                    type: 'message',
                    toUserId: currentChatUser.id,
                    content: messageToSend
                }));

                const newMessage: Message = {
                    id: Date.now(),
                    sender_id: parseInt(user.id),
                    receiver_id: parseInt(currentChatUser.id),
                    content: messageToSend,
                    created_at: new Date().toISOString(),
                };

                setMessages((prevMessages) => [
                    ...(prevMessages || []),
                    newMessage,
                ]);
            } else {
                const response = await fetch(getApiUrl(`/api/messages/${currentChatUser.id}`), {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ message: messageToSend })
                })

                if (!response.ok) {
                    toast.error("Failed to send message")
                    return;
                }

                const data = await response.json();
                setMessages([...(messages || []), data.message]);
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to send message");
        }
    }

    useEffect(() => {
        const connectToWebSocket = async () => {
            const response = await fetch(getApiUrl('/api/auth/ws-token'), {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to get WebSocket token');
            }

            const { token } = await response.json();
            const wsUrl = getWsUrl(token);
            if (!wsUrl) return;

            ws.current = new WebSocket(wsUrl);

            ws.current.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === 'new_message') {
                        const message: Message = data.message;

                        if (currentChatUser &&
                            (message.sender_id === parseInt(currentChatUser.id))) {
                            setMessages(prev => [...(prev || []), message]);
                        }
                    }
                } catch (err) {
                    console.error('Failed to parse WS message', err);
                }
            };

            ws.current.onerror = (err) => {
                console.error('WebSocket error', err);
                toast.error(err instanceof Error ? err.message : 'Could not connect in real-time. Please refresh the page!');
            };
        }

        connectToWebSocket();

        return () => {
            ws.current?.close();
        }
    }, [currentChatUser]);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
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
                {currentChatUser ? (
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
                            {messages && messages.length > 0 ? (
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
                                <div className={styles.info}>
                                    <p>No messages found. Send a message first!</p>
                                </div>
                            )}
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
                    <div className={styles.info}>
                        <p>Select a conversation to view messages.</p>
                    </div>
                )}
            </section>
        </section>
    )
}
