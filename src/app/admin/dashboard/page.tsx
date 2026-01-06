'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import styles from './dashboard.module.css';
import { User } from '@supabase/supabase-js';

interface Source {
    id: string;
    name: string;
    status: string;
    last_checked_at: string | null;
    error_log: string | null;
}

interface DraftJob {
    id: string;
    title: string;
    post_type: string;
    organization: string;
    ai_confidence: number;
    created_at: string;
}

export default function Dashboard() {
    const [user, setUser] = useState<User | null>(null);
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
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={() => router.push('/admin/dashboard/post')}
                        className="btn btn-primary"
                    >
                        ➕ Manual Post
                    </button>
                    <button
                        onClick={() => supabase.auth.signOut().then(() => router.push('/admin'))}
                        className="btn"
                        style={{ background: 'var(--secondary)', color: 'white' }}
                    >
                        Logout
                    </button>
                </div>
            </header>

            {/* Crawler Sources Status */}
            <SourcesSection />

            {/* Important Drafts Section */}
            <DraftsSection />
        </div>
    );
}

function SourcesSection() {
    const [sources, setSources] = useState<Source[]>([]);

    useEffect(() => {
        supabase.from('sources').select('*').order('last_checked_at', { ascending: false })
            .then(({ data }) => setSources(data as Source[] || []));
    }, []);

    return (
        <section className={styles.section} style={{ marginBottom: '2rem' }}>
            <h3>📡 Crawler Sources</h3>
            <div className={styles.grid}>
                {sources.map(source => (
                    <div key={source.id} className={styles.miniCard} style={{
                        borderLeft: `4px solid ${source.status === 'error' ? 'red' : 'green'}`,
                        padding: '1rem',
                        background: 'white',
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <strong>{source.name}</strong>
                            <span style={{
                                fontSize: '0.8rem',
                                color: source.status === 'active' ? 'green' : 'red',
                                textTransform: 'uppercase',
                                fontWeight: 'bold'
                            }}>{source.status}</span>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: '#666', margin: '0.5rem 0' }}>
                            Last Checked: {source.last_checked_at ? new Date(source.last_checked_at).toLocaleTimeString() : 'Never'}
                        </p>
                        {source.error_log && (
                            <p style={{ color: 'red', fontSize: '0.7rem' }}>⚠️ {source.error_log.substring(0, 50)}...</p>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}

function DraftsSection() {
    const [drafts, setDrafts] = useState<DraftJob[]>([]);
    const router = useRouter();

    useEffect(() => {
        supabase.from('jobs')
            .select('*')
            .eq('status', 'draft')
            .order('created_at', { ascending: false })
            .then(({ data }) => setDrafts(data as unknown as DraftJob[] || []));
    }, []);

    if (drafts.length === 0) return (
        <div style={{ padding: '2rem', textAlign: 'center', background: '#f5f5f5', borderRadius: '8px' }}>
            <h3>✅ All Caught Up!</h3>
            <p>No pending drafts to review.</p>
        </div>
    );

    return (
        <section className={styles.section}>
            <h3>📝 Pending Drafts ({drafts.length})</h3>
            <div className={styles.list}>
                {drafts.map(draft => (
                    <div key={draft.id} className={styles.row} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '1rem',
                        background: 'white',
                        borderBottom: '1px solid #eee'
                    }}>
                        <div>
                            <span style={{
                                background: '#e3f2fd',
                                color: '#1976d2',
                                padding: '0.2rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                marginRight: '0.5rem'
                            }}>
                                {draft.post_type?.toUpperCase() || 'JOB'}
                            </span>
                            <strong>{draft.title}</strong>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>
                                {draft.organization} • Confidence: {Math.round((draft.ai_confidence || 0) * 100)}%
                            </p>
                        </div>
                        <button
                            className="btn btn-sm"
                            style={{ background: 'var(--primary)', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
                            onClick={() => router.push(`/admin/dashboard/edit/${draft.id}`)}
                        >
                            Review & Publish
                        </button>
                    </div>
                ))}
            </div>
        </section>
    );
}
