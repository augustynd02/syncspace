'use client'

import { IoNotifications } from "react-icons/io5";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import styles from './Notifications.module.scss';
import Notification from "@/types/Notification";
import { IoMdHeart, IoMdInformationCircle } from "react-icons/io";
import { FaCommentAlt } from "react-icons/fa";
import { FaUserFriends } from "react-icons/fa";
import { AiFillMessage } from "react-icons/ai";
import { IoChatbubbleEllipses } from "react-icons/io5";
import formatDate from "@/utils/formatDate";

const fetchNotifications = async () => {
    const response = await fetch('http://localhost:8000/api/notifications', {
        method: 'GET',
        credentials: 'include'
    })

    const data = await response.json();

    if (!response.ok) {
        throw new Error('Failed to fetch notifications');
    }

    console.log(data.notifications);
    return data.notifications as Notification[];
}

export default function Notifications() {
    const [isOpen, setIsOpen] = useState(false);
    const { data, isLoading, error, refetch, isFetched } = useQuery({
        queryKey: ['notifications'],
        queryFn: fetchNotifications,
        enabled: false
    })

    const handleOpenPopover = () => {
        setIsOpen(prev => {
            if (!prev && !isFetched) {
                refetch()
            }
            return !prev;
        });
    }

    const getNotificationTitle = (type: 'info' | 'friend_request' | 'like' | 'comment' | 'message') => {
        switch(type) {
            case 'info':
                return 'New notification';
            case 'friend_request':
                return 'New friend request';
            case 'like':
                return 'New like';
            case 'comment':
                return 'New comment';
            case 'message':
                return 'New message';
            default:
                return 'New notification';
        }
    }

    const getNotificationIcon = (type: 'info' | 'friend_request' | 'like' | 'comment' | 'message') => {
        switch(type) {
            case 'info':
                return <IoMdInformationCircle />
            case 'friend_request':
                return <FaUserFriends />
            case 'like':
                return <IoMdHeart />
            case 'comment':
                return <FaCommentAlt />
            case 'message':
                return <IoChatbubbleEllipses />
            default:
                return <IoMdInformationCircle />
        }
    }

    if (isLoading) return <p>Loading...</p>
    if (error) return <p>Error: {error.message}</p>

    return (
        <>
            <IoNotifications onClick={handleOpenPopover} />
            {isOpen && (
                <article className={styles.notificationsContainer}>
                    {data && (
                        <ul className={styles.notifications}>
                            {data.map((notification) => (
                                <li key={notification.id} className={styles.notification}>
                                    <div className={styles.notificationIconContainer}>
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                    <div className={styles.notificationContent}>
                                        <div className={styles.notificationHeader}>
                                            <h3>{getNotificationTitle(notification.type)}</h3>
                                            <time dateTime={notification.created_at}>
                                                {formatDate(notification.created_at)}
                                            </time>
                                        </div>
                                        <div className={styles.notificationMessage}>
                                            {notification.message}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </article>
            )}
        </>
    )
}
