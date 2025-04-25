'use client'

import { IoNotifications } from "react-icons/io5";
import { IoMdNotificationsOff } from "react-icons/io";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import styles from './Notifications.module.scss';
import Notification from "@/types/Notification";
import { IoMdHeart, IoMdInformationCircle } from "react-icons/io";
import { MdModeComment } from "react-icons/md";
import { FaUserFriends } from "react-icons/fa";
import { IoChatbubbleEllipses } from "react-icons/io5";
import formatDate from "@/utils/formatDate";
import Badge from "../Badge/Badge";
import Spinner from "../Spinner/Spinner";
import { SlOptionsVertical } from "react-icons/sl";
import Actions from "../Actions/Actions";
import { useRouter } from "next/navigation";
import { MdDelete } from "react-icons/md";
import { useQueryClient } from '@tanstack/react-query';
import { getApiUrl } from "@/utils/api";
import { toast } from "react-toastify";

const fetchNotifications = async () => {
    try {
        const response = await fetch(getApiUrl(`/api/notifications`), {
            method: 'GET',
            credentials: 'include'
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error('Failed to fetch notifications');
        }

        return data.notifications as Notification[];
    } catch (err) {
        toast(err instanceof Error ? err.message : "Failed to fetch notifications");
    }
}

export default function Notifications() {
    const [isOpen, setIsOpen] = useState(false);
    const [openActionsId, setOpenActionsId] = useState<number | null>(null);
    const queryClient = useQueryClient();
    const router = useRouter();

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['notifications'],
        queryFn: fetchNotifications,
        enabled: true,
        staleTime: 0
    });

    const handleOpenPopover = () => {
        setIsOpen(prev => {
            if (!prev) {
                refetch();
            }
            return !prev;
        });
    }

    const notificationMap = {
        info: {
            title: "New notification",
            icon: <IoMdInformationCircle />,
            getUrl: () => undefined
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
            icon: <MdModeComment />,
            getUrl: (notification: Notification) => `/posts/${notification.post_id}`
        },
        message: {
            title: "New message",
            icon: <IoChatbubbleEllipses />,
            getUrl: (notification: Notification) => `/chats/${notification.sender_id}`
        }
    }

    const handleNotifClick = (id: string, url: string | undefined) => {
        fetch(getApiUrl(`/api/notifications/${id}`), {
            method: 'DELETE',
            credentials: 'include'
        });
        if (url) {
            setIsOpen(false);
            router.push(url)
        }
    }

    const deleteNotification = async (id: string) => {
        // Optimistic UI notification deletion - first delete it from client side, then handle deleting from db in the background
        const previousNotifications = queryClient.getQueryData(['notifications']);
        queryClient.setQueryData(
            ['notifications'],
            (oldNotifications: Notification[] | undefined) =>
                oldNotifications?.filter(notification => notification.id.toString() !== id)
        );

        try {
            const response = await fetch(getApiUrl(`/api/notifications/${id}`), {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                console.log('Notification deleted successfully');
                setOpenActionsId(null);
            } else {
                console.error('Failed to delete notification');
                queryClient.setQueryData(['notifications'], previousNotifications);
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
            queryClient.setQueryData(['notifications'], previousNotifications);
        }
    };

    return (
        <>
            <IoNotifications onClick={handleOpenPopover} />
                {data && data.length > 0
                    ? (
                        <Badge>
                            {data.length}
                        </Badge>
                    )
                    : (
                        null
                    )
                }

            {isOpen && (
                <article className={styles.notificationsContainer}>
                    {isLoading ? (
                        <div className={styles.loading}>
                            <Spinner size='large' />
                            <p>Loading notifications...</p>
                        </div>
                    ) : (
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
                                            onClick={() => handleNotifClick(notification.id.toString(), config.getUrl(notification))}
                                        >
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

                                            <div className={styles.optionsContainer}>
                                                <SlOptionsVertical onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (openActionsId === notification.id) {
                                                        setOpenActionsId(null)
                                                    } else {
                                                        setOpenActionsId(notification.id);
                                                    }
                                                }} />
                                                <Actions
                                                    position="bottom-left"
                                                    isOpen={openActionsId === notification.id}
                                                    actions={[
                                                        {
                                                            icon: <MdDelete />,
                                                            name: 'Delete notification',
                                                            cb: () => deleteNotification(notification.id.toString()),
                                                        },
                                                    ]}
                                                />
                                            </div>
                                        </li>
                                    );
                                })
                            )}
                        </ul>
                    )}
                </article>
            )}
        </>
    );
}
