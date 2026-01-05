import styles from './Badge.module.css';

type BadgeProps = {
    children: React.ReactNode;
    variant?: 'primary' | 'success' | 'danger' | 'warning';
};

export default function Badge({ children, variant = 'primary' }: BadgeProps) {
    return (
        <span className={`${styles.badge} ${styles[variant]}`}>
            {children}
        </span>
    );
}
