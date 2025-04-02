import { IoChatbubbleEllipses, IoNotifications } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import styles from './Header.module.scss'

export default function Header() {
    return (
        <header className={styles.mainHeader}>
            <div className={styles.logoContainer}>
                <h1>syncspace</h1>
            </div>
            <div className={styles.searchContainer}>
                <input type="text" name="search" id="search" />
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
