import styles from './Spinner.module.scss';
import { FaSpinner } from "react-icons/fa";

interface SpinnerProps {
    size?: 'icon' | 'small' | 'medium' | 'large';
}

export default function Spinner({ size = 'medium'} : SpinnerProps) {
    const classes = `${styles.spinner} ${styles[size]}`;
    return <FaSpinner className={classes} />
}
