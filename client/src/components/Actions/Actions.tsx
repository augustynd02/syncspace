import React, { ReactNode, useEffect, useRef } from 'react';
import styles from './Actions.module.scss';

interface Action {
    icon?: ReactNode;
    name: string;
    cb: () => void;
}

export default function Actions({ position = 'bottom-left', actions, isOpen, setIsOpen }: {
    position?: 'top-left' | 'top-right' | 'bottom-right' | 'bottom-left';
    actions: Action[];
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}) {
    const containerRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (isOpen) {
            const handleClickOutside = (event: MouseEvent) => {
                if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                    setIsOpen(false);
                }
            };

            document.addEventListener('mousedown', handleClickOutside);

            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [isOpen, setIsOpen]);

    if (actions.length === 0) return null;
    if (!isOpen) return null;

    const handleActionClick = (e: React.MouseEvent<HTMLLIElement>, cb: () => void) => {
        e.stopPropagation();
        cb();
        setIsOpen(false);
    };

    return (
        <section className={`${styles.actionsContainer} ${styles[position]}`} ref={containerRef}>
            <ul>
                {actions.map(action => (
                    <li key={action.name} onClick={(e) => handleActionClick(e, action.cb)} className={styles.action}>
                        <div className={styles.actionIcon}>
                            {action.icon}
                        </div>
                        <div className={styles.actionName}>
                            {action.name}
                        </div>
                    </li>
                ))}
            </ul>
        </section>
    );
}
