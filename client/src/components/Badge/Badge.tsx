import styles from './Badge.module.scss';

export default function Badge({ children, position = 'bottom-right', className}: { children: React.ReactNode, position?: 'top-left' | 'top-right' | 'bottom-right' | 'bottom-left', className?: string}) {
    return (
        <div className={`${styles.badge} ${styles[position]} ${className}`}>
            {children}
        </div>
    )
}
