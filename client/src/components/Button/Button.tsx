import { ReactNode } from "react"
import styles from './Button.module.scss'
import Spinner from "../Spinner/Spinner";

interface ButtonProps {
    children: ReactNode;
    onClick?: () => void;
    type?: 'button' | 'submit';
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'icon' | 'small' | 'medium' | 'large';
    disabled?: boolean;
    isLoading?: boolean;
    className?: string;
}

export default function Button({
    children,
    onClick,
    type = 'button',
    variant = 'primary',
    size = 'medium',
    disabled = false,
    isLoading = false,
    className = ''
} : ButtonProps) {
    const classes = `${styles.button} ${styles[variant]} ${styles[size]} ${className}`
    return (
        <button
            className={classes}
            onClick={isLoading ? undefined : onClick}
            disabled={disabled || isLoading}
            type={type}
        >
            { isLoading ? <Spinner size={size} /> : children }
        </button>
    )
}
