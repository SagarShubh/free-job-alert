import Link from 'next/link';
import styles from './Header.module.css';
import SearchBar from '../ui/SearchBar';
import StateNav from './StateNav';
import ThemeToggle from '../ui/ThemeToggle';

// Enhanced Nav Items with "Pill" feel logic to be improved in CSS
const NAV_ITEMS = [
    { label: 'Home', href: '/' },
    { label: 'All India', href: '/all-india' },
    { label: 'State Jobs', href: '/state' },
    { label: 'Bank', href: '/bank' },
    { label: 'Teaching', href: '/teaching' },
    { label: 'Engineering', href: '/engineering' },
    { label: 'Police', href: '/police' },
];

export default function Header() {
    return (
        <header className={styles.header}>
            <div className={`container ${styles.mainRow}`}>
                <div className={styles.logoSection}>
                    <Link href="/" className={styles.logo}>
                        GovJob<span>Alert</span>
                    </Link>
                </div>

                <nav className={styles.navSection}>
                    <ul className={styles.navLinks}>
                        {NAV_ITEMS.map((item) => (
                            <li key={item.label}>
                                <Link href={item.href} className={styles.navLink}>
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className={styles.actions}>
                    <SearchBar />
                    <ThemeToggle />
                    <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem', borderRadius: '20px' }}>
                        Get App
                    </button>
                </div>
            </div>

            {/* Second Row: State Navigation */}
            <StateNav />
        </header>
    );
}

