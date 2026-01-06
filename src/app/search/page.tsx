import { supabase } from '@/lib/supabaseClient';
import JobCard from '@/components/ui/JobCard';
import styles from '@/app/page.module.css';

interface DBJob {
    title: string;
    slug: string;
    organization: string;
    post_date: string;
    total_vacancy: string;
    is_featured: boolean;
}

export const revalidate = 0; // Search results should be fresh

type Props = {
    searchParams: Promise<{ q: string }>
};

export async function generateMetadata({ searchParams }: Props) {
    const { q } = await searchParams;
    return {
        title: `Search Results for "${q || ''}" - GovJobAlert`,
        description: `Search results for ${q} government jobs recruitment.`
    };
}

export default async function SearchPage({ searchParams }: Props) {
    const { q } = await searchParams;
    const query = q || '';

    let jobs: DBJob[] = [];

    if (query) {
        const { data } = await supabase
            .from('jobs')
            .select('title, slug, organization, post_date, total_vacancy, is_featured')
            .or(`title.ilike.%${query}%,organization.ilike.%${query}%`)
            .order('post_date', { ascending: false });

        if (data) {
            jobs = data as DBJob[];
        }
    }

    return (
        <div className="container" style={{ padding: '3rem 0' }}>
            <header className={styles.sectionHeader} style={{ marginBottom: '2rem', flexDirection: 'column', alignItems: 'flex-start' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Search Results</h1>
                <p style={{ color: 'var(--secondary)' }}>
                    Showing results for &quot;<span style={{ color: 'var(--primary)', fontWeight: 600 }}>{query}</span>&quot;
                </p>
            </header>

            {jobs.length > 0 ? (
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
                <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '1.2rem', color: 'var(--secondary)' }}>
                        No jobs found matching &quot;{query}&quot;.
                    </p>
                    <p style={{ marginTop: '0.5rem', fontSize: '0.95rem', color: '#666' }}>
                        Try searching for &quot;Bank&quot;, &quot;SSC&quot;, &quot;Police&quot;, or specific keywords.
                    </p>
                </div>
            )}
        </div>
    );
}

