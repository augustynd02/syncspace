import React from "react";
import styles from './DataNotFound.module.scss'

export default function DataNotFound({ children, fullWidth = false }: { children: React.ReactNode, fullWidth?: boolean}) {
    return (
        <section className={`${styles.dataNotFound} ${fullWidth ? styles.fullWidth : ''}`}>
            {children}
        </section>
    )
}
