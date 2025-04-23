export const dynamic = 'force-dynamic';

import { AuthWrapper } from "./AuthWrapper";
import styles from "./page.module.scss";

export default function Login() {
    return (
        <main className={styles.loginPageContainer}>
            <div className={styles.welcomeContainer}>
                <h1>syncspace</h1>
                <p>Synchronize with those who matter and connect in a shared digital space, designed to make collaboration, interaction, and sharing a breeze.</p>
            </div>
            <div className={styles.loginContainer}>
                <AuthWrapper />
            </div>
        </main>
    )
}
