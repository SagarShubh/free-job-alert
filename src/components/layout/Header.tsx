import Link from 'next/link';
import styles from './Header.module.css';
import SearchBar from '../ui/SearchBar';

const NAV_ITEMS = [
    { label: 'Home', href: '/' },
    { label: 'All India', href: '/all-india' },
    { label: 'State Jobs', href: '/state' },
    { label: 'Bank', href: '/bank' },
    { label: 'Teaching', href: '/teaching' },
    { label: 'Engineering', href: '/engineering' },
];

export default function Header() {
    return (
        <header className={styles.header}>
            <div className={`container ${styles.navContainer}`}>
                <Link href="/" className={styles.logo}>
                    GovJob<span>Alert</span>
                </Link>

                <nav>
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
                    <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>
                        App
                    </button>
                </div>
            </div>
        </header>
    );
}
