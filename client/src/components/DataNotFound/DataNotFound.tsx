import React from "react";
import styles from './DataNotFound.module.scss'

export default function DataNotFound({ children }: { children: React.ReactNode}) {
    return (
        <section className={styles.dataNotFound}>
            {children}
        </section>
    )
}
