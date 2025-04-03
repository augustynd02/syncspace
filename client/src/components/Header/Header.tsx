import { IoChatbubbleEllipses, IoNotifications, IoSearch } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import styles from './Header.module.scss'

export default function Header() {
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
                    <input type="text" name="search" id="search" />
                </label>
            </div>
            <div className={styles.actionsContainer}>
                <nav>
                    <ul>
                        <li><IoChatbubbleEllipses /></li>
                        <li><IoNotifications /></li>
                        <li><FaUser /></li>
                    </ul>
                </nav>
            </div>
        </header>
    )
}
