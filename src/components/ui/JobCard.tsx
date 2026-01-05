import Link from 'next/link';
import styles from './JobCard.module.css';
import Badge from './Badge';

type JobCardProps = {
    title: string;
    slug: string;
    organization: string;
    postDate: string;
    totalVacancy: string;
    isFeatured?: boolean;
};

export default function JobCard({
    title,
    slug,
    organization,
    postDate,
    totalVacancy,
    isFeatured
}: JobCardProps) {
    return (
        <article className={styles.card}>
            <div className={styles.header}>
                <div>
                    <div className={styles.organization}>{organization}</div>
                    <h3 className={styles.title}>
                        <Link href={`/jobs/${slug}`}>
                            {title}
                        </Link>
                    </h3>
                </div>
                {isFeatured && <Badge variant="warning">New</Badge>}
            </div>

            <div className={styles.meta}>
                <div className={styles.metaItem}>
                    <span>📅 {postDate}</span>
                </div>
                <div className={styles.metaItem}>
                    <span>👥 {totalVacancy} Vacancies</span>
                </div>
            </div>
        </article>
    );
}
