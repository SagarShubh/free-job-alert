import JobCardSkeleton from "@/components/ui/JobCardSkeleton";

export default function Loading() {
    return (
        <div className="container">
            {/* Hero Skeleton */}
            <div style={{ padding: '6rem 0', textAlign: 'center' }}>
                <div style={{ width: '120px', height: '32px', background: 'var(--secondary)', borderRadius: '99px', margin: '0 auto 1.5rem auto' }} />
                <div style={{ width: '60%', height: '64px', background: 'var(--secondary)', borderRadius: '12px', margin: '0 auto 1rem auto' }} />
                <div style={{ width: '40%', height: '24px', background: 'var(--secondary)', borderRadius: '8px', margin: '0 auto' }} />
            </div>

            {/* Featured Grid Skeleton */}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <div style={{ width: '200px', height: '32px', background: 'var(--secondary)', borderRadius: '8px' }} />
                    <div style={{ width: '80px', height: '20px', background: 'var(--secondary)', borderRadius: '4px' }} />
                </div>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '1.5rem'
                }}>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} style={{ height: '300px' }}>
                            <JobCardSkeleton />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
