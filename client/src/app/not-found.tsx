import Link from 'next/link'
import styles from './NotFound.module.scss'

export default function NotFound() {
    return (
        <main className={styles.notFoundMain}>
            <h1>syncspace</h1>
            <h2>404 Not Found</h2>
            <p>Could not find the requested page.</p>
            <Link href="/">Back to homepage</Link>
        </main>
    )
}
