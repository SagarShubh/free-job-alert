import React from 'react';
import Skeleton from './Skeleton';
import styles from '../JobCard.module.css'; // Reusing layout styles if possible, or define locally

// Since we are using CSS modules for JobCard, we might want to replicate the 'container' structure 
// or import the class names if they were global. Assuming generic card structure for now to match Premium look.

export default function JobCardSkeleton() {
    return (
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
            {/* Header: Badge & Title */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                    <Skeleton width={80} height={24} style={{ marginBottom: '0.75rem', borderRadius: '99px' }} />
                    <Skeleton width="90%" height={28} style={{ marginBottom: '0.5rem' }} />
                    <Skeleton width="60%" height={20} />
                </div>
            </div>

            {/* Info Grid */}
            <div style={{ display: 'flex', gap: '2rem', marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <Skeleton width={60} height={16} />
                    <Skeleton width={80} height={20} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <Skeleton width={60} height={16} />
                    <Skeleton width={80} height={20} />
                </div>
            </div>

            {/* Footer / Actions */}
            <div style={{ marginTop: 'auto', paddingTop: '1rem', display: 'flex', gap: '0.75rem' }}>
                <Skeleton width={100} height={36} style={{ borderRadius: '0.5rem' }} />
                <Skeleton width={100} height={36} style={{ borderRadius: '0.5rem' }} />
            </div>
        </div>
    );
}
