import { supabase } from '@/lib/supabaseClient';
import styles from './page.module.css';
import SmartTable from '@/components/ui/SmartTable';
import Badge from '@/components/ui/Badge';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const revalidate = 60; // Revalidate every 60 seconds

type Props = {
    params: { slug: string }
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { data: job } = await supabase
        .from('jobs')
        .select('title, brief_info')
        .eq('slug', params.slug)
        .single();

    if (!job) {
        return { title: 'Job Not Found' };
    }

    return {
        title: `${job.title} - Apply Online`,
        description: job.brief_info || `Details for ${job.title}`,
    };
}

export default async function JobDetailPage({ params }: Props) {
    const { data: job, error } = await supabase
        .from('jobs')
        .select(`
      *,
      job_fees (category_name, fee_amount, display_order),
      job_dates (event_description, event_date, display_order),
      job_vacancies (post_name, total_posts, qualification, display_order),
      job_links (link_title, url, is_active, display_order)
    `)
        .eq('slug', params.slug)
        .single();

    if (error || !job) {
        console.error('Error fetching job:', error);
        notFound();
    }

    // Sort related data
    const fees = job.job_fees?.sort((a: any, b: any) => a.display_order - b.display_order) || [];
    const dates = job.job_dates?.sort((a: any, b: any) => a.display_order - b.display_order) || [];
    const vacancies = job.job_vacancies?.sort((a: any, b: any) => a.display_order - b.display_order) || [];
    const links = job.job_links?.sort((a: any, b: any) => a.display_order - b.display_order) || [];

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>{job.title}</h1>
                <div className={styles.meta}>
                    <span>📅 Posted: {job.post_date}</span>
                    <span>👥 Total Vacancy: {job.total_vacancy}</span>
                    {job.is_featured && <Badge variant="warning">Featured</Badge>}
                </div>
            </header>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Brief Information</h2>
                <p className={styles.brief}>{job.brief_info}</p>
            </div>

            <div className={styles.tableGrid}>
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Application Fee</h2>
                    <SmartTable
                        columns={[
                            { header: "Category", accessor: "category_name" },
                            { header: "Fee", accessor: "fee_amount" }
                        ]}
                        data={fees}
                    />
                </div>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Important Dates</h2>
                    <SmartTable
                        columns={[
                            { header: "Event", accessor: "event_description" },
                            { header: "Date", accessor: "event_date" }
                        ]}
                        data={dates}
                    />
                </div>
            </div>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Vacancy Details</h2>
                <SmartTable
                    columns={[
                        { header: "Post Name", accessor: "post_name" },
                        { header: "Total", accessor: "total_posts" },
                        { header: "Qualification", accessor: "qualification" }
                    ]}
                    data={vacancies}
                />
            </div>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Important Links</h2>
                <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                    {links.map((link: any) => (
                        <a
                            key={link.id}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.linkButton}
                        >
                            {link.link_title}
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}
