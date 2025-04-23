
'use client'

import { IoChatbubbleEllipses, IoNotifications, IoSearch } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import styles from './Header.module.scss'
import UserContext from "@/contexts/UserContext";
import { useRouter } from 'next/navigation'
import { useContext } from "react";
import Notifications from "./Notifications";
import Search from "./Search";

export default function Header() {
    const router = useRouter();

    const { user } = useContext(UserContext);

    return (
        <header className={styles.headerWrapper}>
            <div className={styles.mainHeader}>
                <div className={styles.logoContainer}>
                    <a href="/">
                        <h1>syncspace</h1>
                    </a>
                </div>
                <div className={styles.searchDesktop}>
                    <Search />
                </div>
                <div className={styles.actionsContainer}>
                    <nav>
                        <ul>
                            <li><IoChatbubbleEllipses /></li>
                            <li>
                                <Notifications />
                            </li>
                            <li onClick={() => { router.push(`/users/${user?.id}`)}}>
                                {user && user.avatar_url ?
                                    <img src={user.avatar_url} alt="User profile" /> :
                                    <FaUser />
                                }
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
            <div className={styles.searchMobile}>
                <Search />
            </div>
        </header>
    )
}
