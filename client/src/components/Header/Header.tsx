
'use client'

import { IoChatbubbleEllipses } from "react-icons/io5";
import styles from './Header.module.scss'
import UserContext from "@/contexts/UserContext";
import { useRouter } from 'next/navigation'
import { useContext } from "react";
import Notifications from "./Notifications";
import Search from "./Search";
import Image from "next/image";
import Link from "next/link";

export default function Header() {
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
                                    <li><IoChatbubbleEllipses /></li>
                                    <li>
                                        <Notifications />
                                    </li>
                                    <li onClick={() => { router.push(`/users/${user?.id}`) }}>
                                        <Image
                                            src={user.avatar_url || 'placeholder.jpg'}
                                            alt={`${user!.name}'s avatar`}
                                            fill
                                            sizes="36px"
                                        />
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
