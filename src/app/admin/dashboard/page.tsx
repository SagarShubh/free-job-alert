'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import styles from './dashboard.module.css';

export default function Dashboard() {
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/admin');
            } else {
                setUser(user);
            }
        };
        checkUser();
    }, [router]);

    if (!user) return <div className="container" style={{ padding: '2rem' }}>Loading...</div>;

    return (
        <div className="container" style={{ padding: '2rem 0' }}>
            <header className={styles.header}>
                <h1>Admin Dashboard</h1>
                <button
                    onClick={() => supabase.auth.signOut().then(() => router.push('/admin'))}
                    className="btn"
                    style={{ background: 'var(--secondary)', color: 'white' }}
                >
                    Logout
                </button>
            </header>

            <div className={styles.grid}>
                <div className={styles.card} onClick={() => router.push('/admin/dashboard/post')}>
                    <h3>➕ Post New Job</h3>
                    <p>Create a new vacancy notification</p>
                </div>
                <div className={styles.card}>
                    <h3>📄 Manage Jobs</h3>
                    <p>Edit or delete existing jobs</p>
                </div>
            </div>
        </div>
    );
}
