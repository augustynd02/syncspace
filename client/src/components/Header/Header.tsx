'use client'

import { IoChatbubbleEllipses } from "react-icons/io5";
import styles from './Header.module.scss'
import UserContext from "@/contexts/UserContext";
import { useRouter } from 'next/navigation'
import { useContext, useState } from "react";
import Notifications from "./Notifications";
import Search from "./Search";
import Image from "next/image";
import Link from "next/link";
import Actions from "../Actions/Actions";
import Badge from "../Badge/Badge";
import { FaUser } from "react-icons/fa";
import { MdExpandMore, MdLogout } from "react-icons/md";
import { toast } from "react-toastify";
import { getApiUrl } from "@/utils/api";

export default function Header() {
    const [userActionsOpen, setUserActionsOpen] = useState(false);
    const router = useRouter();

    const { user } = useContext(UserContext);

    return (
        <header className={styles.headerWrapper}>
            <div className={styles.mainHeader}>
                <div className={styles.logoContainer}>
                    <Link href="/">
                        <h1>syncspace</h1>
                    </Link>
                </div>
                <div className={styles.searchDesktop}>
                    <Search />
                </div>
                <div className={styles.actionsContainer}>
                    {user
                        ? (
                            <nav>
                                <ul>
                                    <li onClick={() => router.push('/chat')}>
                                        <IoChatbubbleEllipses />
                                    </li>
                                    <li>
                                        <Notifications />
                                    </li>
                                    <li onClick={() => setUserActionsOpen(!userActionsOpen)}>
                                        <Image
                                            src={user.avatar_url || 'placeholder.jpg'}
                                            alt={`${user!.name}'s avatar`}
                                            fill
                                            sizes="36px"
                                        />
                                        <Actions
                                            position="bottom-left"
                                            isOpen={userActionsOpen}
                                            setIsOpen={setUserActionsOpen}
                                            actions={[
                                                {
                                                    icon: <FaUser />,
                                                    name: 'View profile',
                                                    cb: () => router.push(`/users/${user?.id}`)
                                                },
                                                {
                                                    icon: <MdLogout />,
                                                    name: "Logout",
                                                    cb: async () => {
                                                        try {
                                                            await fetch(getApiUrl(`/api/auth/logout`), {
                                                                method: 'POST',
                                                                credentials: 'include',
                                                            });
                                                            toast.success("Succesfully logged out!")
                                                            router.push('/login');
                                                        } catch (err) {
                                                            toast.error((err instanceof Error ? err.message : "There was an error during logout..."));
                                                        }
                                                    },
                                                }
                                            ]}
                                        />
                                        <Badge className={styles.profileBadge}>
                                            <MdExpandMore />
                                        </Badge>
                                    </li>
                                </ul>
                            </nav>
                        ) : (
                            <Link href="/login">Login to access more</Link>
                        )
                    }
                </div>
            </div>
            <div className={styles.searchMobile}>
                <Search />
            </div>
        </header>
    )
}
