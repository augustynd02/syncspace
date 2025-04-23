import styles from './Modal.module.scss'
import { IoMdClose } from "react-icons/io";

interface ModalProps {
    children: React.ReactNode
    isOpen: boolean;
    title: string;
    onClose: () => void;
}

export default function Modal({ children, isOpen, title, onClose }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContainer}>
                <div className={styles.modalHeader}>
                    {title}
                    <button onClick={onClose}>
                        <IoMdClose />
                    </button>
                </div>
                <div className={styles.modalContent}>
                    {children}
                </div>
            </div>
        </div>
    )
}
