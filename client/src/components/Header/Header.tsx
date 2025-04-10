'use client'

import { IoChatbubbleEllipses, IoNotifications, IoSearch } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import styles from './Header.module.scss'
import UserContext from "@/contexts/UserContext";
import { useRouter } from 'next/navigation'
import { useContext } from "react";

export default function Header() {
    const router = useRouter();

    const { user } = useContext(UserContext);

    return (
        <header className={styles.mainHeader}>
            <div className={styles.logoContainer}>
                <a href="/">
                    <h1>syncspace</h1>
                </a>
            </div>
            <div className={styles.searchContainer}>
                <label htmlFor="search">
                    <IoSearch />
                    <input type="text" name="search" id="search" placeholder="Search syncspace..." />
                </label>
            </div>
            <div className={styles.actionsContainer}>
                <nav>
                    <ul>
                        <li><IoChatbubbleEllipses /></li>
                        <li><IoNotifications /></li>
                        <li onClick={() => { router.push(`/users/${user?.id}`)}}>
                            <img src={user ? user.avatar_url : <FaUser /> } />
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    )
}
