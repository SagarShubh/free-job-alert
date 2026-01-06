import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import JobCard from '@/components/ui/JobCard';
import styles from '@/app/page.module.css';
import { notFound } from 'next/navigation';

export const revalidate = 60;

type Props = {
    params: Promise<{ category: string }>
};

interface DBJob {
    title: string;
    slug: string;
    organization: string;
    post_date: string;
    total_vacancy: string;
    is_featured: boolean;
}

const CATEGORY_MAP: Record<string, string> = {
    'bank': 'bank',
    'teaching': 'teaching',
    'engineering': 'engineering',
    'police': 'police',
    'railway': 'railway', // Assuming we add this later
    'all-india': 'central', // Mapping /all-india to 'central' type
    'state': 'state',
};

const CATEGORY_TITLES: Record<string, string> = {
    'bank': 'Bank Jobs',
    'teaching': 'Teaching Jobs',
    'engineering': 'Engineering Jobs',
    'police': 'Police & Defence Jobs',
    'railway': 'Railway Jobs',
    'all-india': 'All India Government Jobs',
    'state': 'State Government Jobs'
};

export async function generateMetadata({ params }: Props) {
    const { category } = await params;
    const title = CATEGORY_TITLES[category] || 'Government Jobs';
    return {
        title: `${title} 2025 - Apply Online`,
        description: `Latest ${title} notifications, vacancies, and exam results.`
    };
}

export default async function CategoryPage({ params }: Props) {
    const { category } = await params;
    const dbCategory = CATEGORY_MAP[category];

    if (!dbCategory) {
        notFound();
    }

    const { data } = await supabase
        .from('jobs')
        .select('title, slug, organization, post_date, total_vacancy, is_featured')
        .eq('job_type', dbCategory)
        .order('post_date', { ascending: false });

    const jobs = (data as unknown as DBJob[]) || [];

    // Special handling for State jobs if we want to show a state selector later, 
    // but for now just listing them is fine.

    return (
        <div className="container" style={{ padding: '3rem 0' }}>
            <header className={styles.sectionHeader} style={{ marginBottom: '3rem', flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>{CATEGORY_TITLES[category]}</h1>
                <p style={{ color: 'var(--secondary)' }}>
                    Find the latest recruitment notifications for {CATEGORY_TITLES[category]}.
                </p>
            </header>

            {jobs && jobs.length > 0 ? (
                <div className={styles.jobGrid}>
                    {jobs.map((job) => (
                        <JobCard
                            key={job.slug}
                            title={job.title}
                            slug={job.slug}
                            organization={job.organization}
                            postDate={job.post_date}
                            totalVacancy={job.total_vacancy}
                            isFeatured={job.is_featured}
                        />
                    ))}
                </div>
            ) : (
                <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '1.2rem', color: 'var(--secondary)' }}>
                        No active jobs found in this category right now.
                    </p>
                    <p style={{ marginTop: '1rem' }}>
                        <Link href="/" style={{ color: 'var(--primary)', fontWeight: 600 }}>&larr; Back to Home</Link>
                    </p>
                </div>
            )}
        </div>
    );
}

