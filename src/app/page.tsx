import Link from 'next/link';
import JobCard from '@/components/ui/JobCard';
import SmartTable from '@/components/ui/SmartTable';
import Badge from '@/components/ui/Badge';
import styles from './page.module.css';

// Mock Data for Design Verification
const FEATURED_JOBS = [
  {
    title: "SBI SCO Recruitment 2025",
    slug: "sbi-sco-2025",
    organization: "State Bank of India (SBI)",
    postDate: "2025-01-05",
    totalVacancy: "150+",
    isFeatured: true
  },
  {
    title: "SSC CGL 2025 Notification",
    slug: "ssc-cgl-2025",
    organization: "Staff Selection Commission",
    postDate: "2025-01-04",
    totalVacancy: "8000+",
    isFeatured: true
  },
  {
    title: "UPSC Civil Services Prelims 2025",
    slug: "upsc-cse-2025",
    organization: "Union Public Service Commission",
    postDate: "2025-01-02",
    totalVacancy: "1056",
    isFeatured: false
  }
];

const ADMIT_CARDS = [
  { exam: "IBPS Po Mains", date: "2025-01-10", link: "Download" },
  { exam: "RRB NTPC CBT-1", date: "2025-01-15", link: "Download" },
  { exam: "GATE 2025", date: "2025-02-01", link: "Download" },
];

export default function Home() {
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
        <div className={styles.jobGrid}>
          {FEATURED_JOBS.map((job) => (
            <JobCard key={job.slug} {...job} />
          ))}
        </div>
      </section>

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
