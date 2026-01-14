import Link from 'next/link';
import JobCard from '@/components/ui/JobCard';
import SmartTable from '@/components/ui/SmartTable';
import Badge from '@/components/ui/Badge';
import styles from './page.module.css';
import { supabase } from '@/lib/supabaseClient';

export const revalidate = 60; // Revalidate every 60 seconds

export default async function Home() {
  // 1. Fetch Featured Jobs
  const { data: featuredJobs } = await supabase
    .from('jobs')
    .select('title, slug, organization, post_date, total_vacancy, is_featured')
    // .eq('is_featured', true) // Showing all for now
    .order('post_date', { ascending: false })
    .limit(9); // Increased limit

  // 2. Fetch Latest Updates (All Jobs)
  // 2. Fetch Latest Updates (All Jobs)
  // const { data: latestJobs } = await supabase... (Unused)
  await supabase
    .from('jobs')
    .select('title, slug, organization, post_date, total_vacancy, is_featured')
    .order('post_date', { ascending: false })
    .limit(9);

  // Mock data for Admit Cards (since we don't have a table for it yet, or we can use a new table later)
  const ADMIT_CARDS = [
    { exam: "IBPS PO Mains", date: "2025-01-10", link: "Download" },
    { exam: "RRB NTPC CBT-1", date: "2025-01-15", link: "Download" },
  ];

  return (
    <div className="container">
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <Badge variant="primary">Updated Real-time</Badge>
          <h1 className={styles.heroTitle}>
            Find Your Dream <br />
            <span style={{ color: 'var(--primary)' }}>Government Job</span>
          </h1>
          <p className={styles.heroSubtitle}>
            The most reliable source for Sarkari Naukri, Admit Cards, and Results.
            No clutter, just results.
          </p>
        </div>
      </section>

      {/* Featured Jobs Grid */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Latest Notifications</h2>
          <Link href="/all-india" style={{ color: 'var(--primary)', fontWeight: 500 }}>
            View All &rarr;
          </Link>
        </div>

        {featuredJobs && featuredJobs.length > 0 ? (
          <div className={styles.jobGrid}>
            {featuredJobs.map((job) => (
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
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--secondary)' }}>
            No featured jobs yet. Check back soon!
          </div>
        )}
      </section>

      {/* Latest Jobs (if different from featured) - Optional additional section */}

      {/* Tables Section */}
      <section className={styles.section}>
        <h2>Admit Cards Released</h2>
        <div style={{ marginTop: '1rem' }}>
          <SmartTable
            columns={[
              { header: "Exam Name", accessor: "exam" },
              { header: "Release Date", accessor: "date" },
              { header: "Action", accessor: "link" }
            ]}
            data={ADMIT_CARDS}
          />
        </div>
      </section>
    </div>
  );
}
