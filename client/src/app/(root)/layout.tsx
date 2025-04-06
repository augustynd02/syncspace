import Header from "@/components/Header/Header"
import Footer from "@/components/Footer/Footer"

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Header />
            {children}
            <Footer />
        </>
    )
}
