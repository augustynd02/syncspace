import Header from "@/components/Header/Header"
import Footer from "@/components/Footer/Footer"
import styles from "./Root.module.scss"

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Header />
            <main className={styles.mainContainer}>
                {children}
            </main>
            <Footer />
        </>
    )
}
