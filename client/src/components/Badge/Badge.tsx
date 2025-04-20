import styles from './Badge.module.scss';

export default function Badge({ children, position = 'bottom-right'}: { children: React.ReactNode, position?: 'top-left' | 'top-right' | 'bottom-right' | 'bottom-left'}) {
    return (
        <div className={`${styles.badge} ${styles[position]}`}>
            {children}
        </div>
    )
}
