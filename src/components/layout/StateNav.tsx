import Link from 'next/link';
import styles from './StateNav.module.css';
import { STATE_CODES } from '@/lib/states';

export default function StateNav() {
    return (
        <nav className={styles.stateNav}>
            <div className={styles.container}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Quick States:</span>
                {STATE_CODES.map((state) => (
                    <Link key={state.code} href={`/${state.code}`} className={styles.link} title={state.name}>
                        {state.code}
                    </Link>
                ))}
            </div>
        </nav>
    );
}
