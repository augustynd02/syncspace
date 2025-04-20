'use client'

import { IoNotifications } from "react-icons/io5";
import { IoMdNotificationsOff } from "react-icons/io";
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

    const notificationMap = {
        info: {
            title: "New notification",
            icon: <IoMdInformationCircle />,
            getUrl: (notification: Notification) => undefined
        },
        friend_request: {
            title: "New friend request",
            icon: <FaUserFriends />,
            getUrl: (notification: Notification) => `/users/${notification.sender_id}`
        },
        like: {
            title: "New like",
            icon: <IoMdHeart />,
            getUrl: (notification: Notification) => `/posts/${notification.post_id}`
        },
        comment: {
            title: "New comment",
            icon: <FaCommentAlt />,
            getUrl: (notification: Notification) => `/posts/${notification.post_id}`
        },
        message: {
            title: "New message",
            icon: <IoChatbubbleEllipses />,
            getUrl: (notification: Notification) => `/chats/${notification.sender_id}`
        }
    }

    // const getNotificationTitle = (type: 'info' | 'friend_request' | 'like' | 'comment' | 'message') => {
    //     switch (type) {
    //         case 'info':
    //             return 'New notification';
    //         case 'friend_request':
    //             return 'New friend request';
    //         case 'like':
    //             return 'New like';
    //         case 'comment':
    //             return 'New comment';
    //         case 'message':
    //             return 'New message';
    //         default:
    //             return 'New notification';
    //     }
    // }

    // const getNotificationIcon = (type: 'info' | 'friend_request' | 'like' | 'comment' | 'message') => {
    //     switch (type) {
    //         case 'info':
    //             return <IoMdInformationCircle />
    //         case 'friend_request':
    //             return <FaUserFriends />
    //         case 'like':
    //             return <IoMdHeart />
    //         case 'comment':
    //             return <FaCommentAlt />
    //         case 'message':
    //             return <IoChatbubbleEllipses />
    //         default:
    //             return <IoMdInformationCircle />
    //     }
    // }


    // const getNotificationUrl = (notification: Notification) => {
    //     switch (notification.type) {
    //         case 'info':
    //             return undefined
    //         case 'friend_request':
    //             return `/users/${notification.sender_id}`
    //         case 'like':
    //         case 'comment':
    //             return `/posts/${notification.post_id}`
    //         case 'message':
    //             return `/chats/${notification.sender_id}`
    //         default:
    //             return undefined
    //     }
    // }

    const handleNotifClick = (id: string) => {
        /*
            Make a DELETE request to remove the notification after clicking on it and being redirected.
            Do not await the fetch request in order to allow the user to instantly get redirected to the notification source without waiting for a response.
        */
        fetch(`http://localhost:8000/api/notifications/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });
    }

    if (isLoading) return <p>Loading...</p>
    if (error) return <p>Error: {error.message}</p>

    return (
        <>
            <IoNotifications onClick={handleOpenPopover} />

            {isOpen && (
                <article className={styles.notificationsContainer}>
                    <ul className={styles.notifications}>
                        {data?.length === 0 ? (
                            <div className={styles.noNotifications}>
                                <IoMdNotificationsOff />
                                <p>You have no notifications.</p>
                            </div>
                        ) : (
                            data?.map((notification) => {
                                const config = notificationMap[notification.type];

                                return (
                                    <li
                                        key={notification.id}
                                        className={styles.notification}
                                        onClick={() => handleNotifClick(notification.id.toString())}
                                    >
                                        <a href={config.getUrl(notification)}>
                                            <div className={styles.notificationIconContainer}>
                                                {config.icon}
                                            </div>

                                            <div className={styles.notificationContent}>
                                                <div className={styles.notificationHeader}>
                                                    <h3>{config.title}</h3>
                                                    <time dateTime={notification.created_at}>
                                                        {formatDate(notification.created_at)}
                                                    </time>
                                                </div>

                                                <div className={styles.notificationMessage}>
                                                    {notification.message}
                                                </div>
                                            </div>
                                        </a>
                                    </li>
                                );
                            })
                        )}
                    </ul>
                </article>
            )}
        </>
    )
}
