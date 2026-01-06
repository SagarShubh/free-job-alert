export type JobStatus = 'draft' | 'published' | 'archived';

export type PostType = 'job_notification' | 'admit_card' | 'result';

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
