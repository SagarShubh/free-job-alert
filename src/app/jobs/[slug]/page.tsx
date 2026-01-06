import { supabase } from '@/lib/supabaseClient';
import styles from './page.module.css';
import SmartTable from '@/components/ui/SmartTable';
import Badge from '@/components/ui/Badge';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const revalidate = 60; // Revalidate every 60 seconds

type Props = {
    params: Promise<{ slug: string }>
};

interface JobFee {
    category_name: string;
    fee_amount: string;
    display_order: number;
}

interface JobDate {
    event_description: string;
    event_date: string;
    display_order: number;
}

interface JobVacancy {
    post_name: string;
    total_posts: string;
    qualification: string;
    display_order: number;
}

interface JobLink {
    id: string; // Needed for key
    link_title: string;
    url: string;
    is_active: boolean;
    display_order: number;
}

interface JobDetail {
    id: string; // Needed if we use it, otherwise optional
    title: string;
    brief_info: string;
    slug: string;
    post_date: string;
    total_vacancy: string;
    organization: string;
    is_featured: boolean;
    state_code: string;
    job_fees: JobFee[];
    job_dates: JobDate[];
    job_vacancies: JobVacancy[];
    job_links: JobLink[];
}

function safeParseDate(dateStr: string | undefined | null): string | undefined {
    if (!dateStr) return undefined;
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return undefined;
        return d.toISOString().split('T')[0];
    } catch {
        return undefined;
    }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const { data } = await supabase
        .from('jobs')
        .select('title, brief_info')
        .eq('slug', slug)
        .single();

    const job = data as { title: string; brief_info: string } | null;

    if (!job) {
        return { title: 'Job Not Found' };
    }

    return {
        title: `${job.title} - Apply Online`,
        description: job.brief_info || `Details for ${job.title}`,
    };
}

export default async function JobDetailPage({ params }: Props) {
    const { slug } = await params;
    const { data, error } = await supabase
        .from('jobs')
        .select(`
      *,
      job_fees (category_name, fee_amount, display_order),
      job_dates (event_description, event_date, display_order),
      job_vacancies (post_name, total_posts, qualification, display_order),
      job_links (link_title, url, is_active, display_order)
    `)
        .eq('slug', slug)
        .single();

    if (error || !data) {
        console.error('Error fetching job:', error);
        notFound();
    }

    const job = data as unknown as JobDetail;

    // Sort related data
    const fees = job.job_fees?.sort((a, b) => a.display_order - b.display_order) || [];
    const dates = job.job_dates?.sort((a, b) => a.display_order - b.display_order) || [];
    const vacancies = job.job_vacancies?.sort((a, b) => a.display_order - b.display_order) || [];
    const links = job.job_links?.sort((a, b) => a.display_order - b.display_order) || [];

    // Safe date for schema
    const lastDateEntry = dates.find(d => d.event_description.toLowerCase().includes('last date'));
    const validThroughDate = lastDateEntry ? safeParseDate(lastDateEntry.event_date) : undefined;

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
                    {links.map((link) => (
                        <a
                            key={link.url} // fallback key since id might be missing in select if not asked
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

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'JobPosting',
                        title: job.title,
                        description: `<p>${job.brief_info}</p><p>Total Vacancy: ${job.total_vacancy}</p>`,
                        identifier: {
                            '@type': 'PropertyValue',
                            name: job.organization,
                            value: job.slug,
                        },
                        datePosted: job.post_date,
                        validThrough: validThroughDate,
                        hiringOrganization: {
                            '@type': 'Organization',
                            name: job.organization,
                            logo: 'https://free-job-alert-ten.vercel.app/logo.png', // Placeholder
                        },
                        jobLocation: {
                            '@type': 'Place',
                            address: {
                                '@type': 'PostalAddress',
                                addressCountry: 'IN',
                                addressRegion: job.state_code === 'ALL' ? undefined : job.state_code,
                            },
                        },
                        employmentType: 'FULL_TIME',
                        baseSalary: {
                            '@type': 'MonetaryAmount',
                            currency: 'INR',
                            value: {
                                '@type': 'QuantitativeValue',
                                unitText: 'MONTH',
                            },
                        },
                    }),
                }}
            />
        </div>
    );
}
import styles from './page.module.css';
import SmartTable from '@/components/ui/SmartTable';
import Badge from '@/components/ui/Badge';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const revalidate = 60; // Revalidate every 60 seconds

type Props = {
    params: Promise<{ slug: string }>
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const { data: job } = await supabase
        .from('jobs')
        .select('title, brief_info')
        .eq('slug', slug)
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
    const { slug } = await params;
    const { data: job, error } = await supabase
        .from('jobs')
        .select(`
      *,
      job_fees (category_name, fee_amount, display_order),
      job_dates (event_description, event_date, display_order),
      job_vacancies (post_name, total_posts, qualification, display_order),
      job_links (link_title, url, is_active, display_order)
    `)
        .eq('slug', slug)
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

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'JobPosting',
                        title: job.title,
                        description: `<p>${job.brief_info}</p><p>Total Vacancy: ${job.total_vacancy}</p>`,
                        identifier: {
                            '@type': 'PropertyValue',
                            name: job.organization,
                            value: job.slug,
                        },
                        datePosted: job.post_date,
                        validThrough: dates.find((d: any) => d.event_description.toLowerCase().includes('last date'))?.event_date
                            ? new Date(dates.find((d: any) => d.event_description.toLowerCase().includes('last date')).event_date).toISOString().split('T')[0]
                            : undefined,
                        hiringOrganization: {
                            '@type': 'Organization',
                            name: job.organization,
                            logo: 'https://free-job-alert-ten.vercel.app/logo.png', // Placeholder
                        },
                        jobLocation: {
                            '@type': 'Place',
                            address: {
                                '@type': 'PostalAddress',
                                addressCountry: 'IN',
                                addressRegion: job.state_code === 'ALL' ? undefined : job.state_code,
                            },
                        },
                        employmentType: 'FULL_TIME',
                        baseSalary: {
                            '@type': 'MonetaryAmount',
                            currency: 'INR',
                            value: {
                                '@type': 'QuantitativeValue',
                                unitText: 'MONTH',
                            },
                        },
                    }),
                }}
            />
        </div>
    );
}
