export type JobStatus = 'draft' | 'published' | 'archived';

export type PostType = 'job' | 'admit_card' | 'result';

export interface JobPost {
    id?: string; // Optional for new drafts
    title: string;
    slug?: string; // Generated on publish
    organization: string;
    postDate: string; // ISO Date string
    totalVacancy: string;
    description: string;

    // Detailed fields
    applicationFee?: string;
    ageLimit?: string;
    qualification?: string;
    importantDates?: string[];
    importantLinks?: {
        label: string;
        url: string;
    }[];

    // Phase 12: Insight Detection
    pattern_change_detected?: boolean;
    pattern_change_summary?: string;

    // Phase 10: State Navigation
    state_code?: string; // ISO Code (AP, TS, etc.)

    // Metadata for Phase 5 automation
    status: JobStatus;
    sourceUrl?: string; // Where this was scraped from
    aiConfidence?: number; // 0-1 score
    postType?: PostType;
    createdAt?: string;
}

export interface ScrapedData {
    title: string;
    rawText: string;
    sourceUrl: string;
}

export interface Source {
    id: string;
    name: string;
    url: string;
    target_type: PostType;
    status: 'active' | 'blocked' | 'error';
    pattern?: string;
    last_checked_at?: string;
    error_log?: string;
    region?: string;
}
