import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className="container">
                <div className={styles.grid}>
                    <div className={styles.column}>
                        <h3>GovJobAlert</h3>
                        <p style={{ fontSize: '0.9rem', color: 'var(--secondary)' }}>
                            Your specific source for government job updates.
                        </p>
                    </div>

                    <div className={styles.column}>
                        <h3>Job Categories</h3>
                        <ul className={styles.links}>
                            <li><Link href="/all-india">All India Govt Jobs</Link></li>
                            <li><Link href="/state">State Govt Jobs</Link></li>
                            <li><Link href="/bank">Bank Jobs</Link></li>
                            <li><Link href="/teaching">Teaching Jobs</Link></li>
                        </ul>
                    </div>

                    <div className={styles.column}>
                        <h3>Help & Support</h3>
                        <ul className={styles.links}>
                            <li><Link href="/about">About Us</Link></li>
                            <li><Link href="/contact">Contact Us</Link></li>
                            <li><Link href="/privacy">Privacy Policy</Link></li>
                            <li><Link href="/terms">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>

                <div className={styles.copyright}>
                    <p>&copy; {new Date().getFullYear()} GovJobAlert. All rights reserved.</p>
                    <p className={styles.disclaimer}>
                        Disclaimer: We are not a government organization. We are an information portal providing updates on government jobs.
                        Please verify all details from the official notifications/websites.
                    </p>
                </div>
            </div>
        </footer>
    );
}
