import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import JobCard from '@/components/ui/JobCard';
import styles from '@/app/page.module.css';
import { notFound } from 'next/navigation';
import { isStateCode, STATE_CODES } from '@/lib/states';

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
    'railway': 'railway',
    'all-india': 'central',
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

    // Check for State Code
    if (isStateCode(category)) {
        const stateName = STATE_CODES.find(s => s.code === category.toUpperCase())?.name || category;
        return {
            title: `${stateName} Govt Jobs 2025 - Apply Online`,
            description: `Latest Government Jobs in ${stateName}. Find vacancies, notifications, and results for ${stateName}.`
        };
    }

    const title = CATEGORY_TITLES[category] || 'Government Jobs';
    return {
        title: `${title} 2025 - Apply Online`,
        description: `Latest ${title} notifications, vacancies, and exam results.`
    };
}

export default async function CategoryPage({ params }: Props) {
    const { category } = await params;

    // Logic 1: Check if it's a known Job Category
    const dbCategory = CATEGORY_MAP[category];

    // Logic 2: Check if it's a State Code
    const isState = isStateCode(category);

    if (!dbCategory && !isState) {
        notFound();
    }

    let query = supabase
        .from('jobs')
        .select('title, slug, organization, post_date, total_vacancy, is_featured')
        .order('post_date', { ascending: false });

    if (isState) {
        // Query by state_code
        // Note: We need to ensure capitalization matches (usually uppercase 'AP')
        query = query.eq('state_code', category.toUpperCase());
    } else {
        // Query by job_type
        query = query.eq('job_type', dbCategory);
    }

    const { data } = await query;
    const title = isState
        ? `${STATE_CODES.find(s => s.code === category.toUpperCase())?.name} Government Jobs`
        : CATEGORY_TITLES[category]; // Fallback to map title

    const jobs = (data as unknown as DBJob[]) || [];

    // Special handling for State jobs if we want to show a state selector later, 
    // but for now just listing them is fine.

    return (
        <div className="container" style={{ padding: '3rem 0' }}>
            <header className={styles.sectionHeader} style={{ marginBottom: '3rem', flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>{title}</h1>
                <p style={{ color: 'var(--secondary)' }}>
                    Find the latest recruitment notifications for {title}.
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

