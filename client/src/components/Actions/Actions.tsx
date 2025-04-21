import React, { ReactNode } from 'react';
import styles from './Actions.module.scss';

interface Action {
    icon?: ReactNode
    name: string;
    cb: () => void;
}

export default function Actions({ position = 'bottom-left', actions, isOpen }: { position?: 'top-left' | 'top-right' | 'bottom-right' | 'bottom-left', actions: Action[], isOpen: boolean}) {
    if (actions.length === 0) return null;
    if (!isOpen) return null;

    const handleActionClick = (e: React.MouseEvent<HTMLLIElement>, cb: () => void) => {
        e.stopPropagation();
        cb();
    }

    return (
        <section className={`${styles.actionsContainer} ${styles[position]}`}>
            <ul>
                {actions.map(action =>
                    <li key={action.name} onClick={(e) => handleActionClick(e, action.cb)} className={styles.action}>
                        <div className={styles.actionIcon}>
                            {action.icon}
                        </div>
                        <div className={styles.actionName}>
                            {action.name}
                        </div>
                    </li>
                )}
            </ul>
        </section>
    )
}
