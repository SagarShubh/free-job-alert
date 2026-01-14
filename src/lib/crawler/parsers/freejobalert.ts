import * as cheerio from 'cheerio';
import { JobPost } from '../../../types';

// Define JobPost interface if import fails (fallback)
interface JobPostFallback {
    title: string;
    organization: string;
    postDate: string;
    totalVacancy: string;
    description: string;
    applicationFee: string;
    ageLimit: string;
    qualification: string;
    importantDates: string[];
    importantLinks: { label: string; url: string }[];
    status: 'draft';
    sourceUrl: string;
    postType: 'job_notification' | 'admit_card' | 'result';
    aiConfidence: number;
    pattern_change_detected: boolean;
    pattern_change_summary: string | null;
}

export async function manualDraftFreeJobAlert(html: string, sourceUrl: string): Promise<JobPostFallback> {
    const $ = cheerio.load(html);
    const postType: 'job_notification' | 'admit_card' | 'result' = 'job_notification';

    // 1. Title
    const title = $('h1.entry-title').text().trim() || 'Untitled Job';

    // 2. Post Date & Organization
    // Meta tag is most reliable for date
    let postDate = $('meta[property="article:published_time"]').attr('content') || '';
    if (postDate) {
        postDate = postDate.split('T')[0]; // Extract YYYY-MM-DD
    } else {
        // Fallback to text
        const metaText = $('.entry-meta').text();
        const updatedMatch = $('.entry-meta').text().match(/(\d{2}-\d{2}-\d{4})/);
        if (updatedMatch) postDate = updatedMatch[0];
    }

    // Organization is often the first cell in the overview table
    let organization = 'FreeJobAlert'; // Default
    $('.table-container table tr').each((i, el) => {
        const key = $(el).find('td').eq(0).text().trim().toLowerCase();
        const val = $(el).find('td').eq(1).text().trim();
        if (key.includes('company name')) {
            organization = val;
        }
    });

    // 3. Description
    const description = $('.entry-content > p').first().text().trim();

    // 4. Tables Extraction (Vacancy, Age, Fee, Dates)
    let totalVacancy = 'Not Specified';
    let applicationFee = 'Not Specified';
    let ageLimit = 'Not Specified';
    let qualification = 'Not Specified';
    let importantDates: string[] = [];
    let importantLinks: { label: string; url: string }[] = [];

    // Helper to clean text
    const clean = (text: string) => text.replace(/\s+/g, ' ').trim();

    // Strategy: Iterate over H2 headers and look at the *next* element (table or ul)
    $('.entry-content h2').each((i, el) => {
        const headerText = $(el).text().toLowerCase();
        const nextElem = $(el).next();

        if (headerText.includes('vacancy')) {
            // Usually a table
            if (nextElem.is('.table-container') || nextElem.is('table')) {
                const table = nextElem.is('table') ? nextElem : nextElem.find('table');
                // Try to find "Total" row
                table.find('tr').each((j, row) => {
                    const cells = $(row).find('td');
                    if (cells.length >= 2) {
                        const cell0 = $(cells[0]).text().toLowerCase();
                        if (cell0.includes('total')) {
                            totalVacancy = $(cells[cells.length - 1]).text().trim();
                        }
                    }
                });
            }
        }

        // Sometimes Vacancy is in the Overview table (first table usually)
        if (totalVacancy === 'Not Specified') {
            $('.table-container table tr').each((j, row) => {
                const key = $(row).find('td').eq(0).text().trim().toLowerCase();
                const val = $(row).find('td').eq(1).text().trim();
                if (key.includes('no of posts') || key.includes('total vacancy')) {
                    totalVacancy = val;
                }
            });
        }

        if (headerText.includes('application fee')) {
            if (nextElem.is('ul')) {
                applicationFee = nextElem.find('li').map((i, li) => clean($(li).text())).get().join('; ');
            } else if (nextElem.is('p')) {
                applicationFee = clean(nextElem.text());
            }
        }

        if (headerText.includes('age limit')) {
            if (nextElem.is('ul')) {
                ageLimit = nextElem.find('li').map((i, li) => clean($(li).text())).get().join('; ');
            }
        }

        if (headerText.includes('qualification') || headerText.includes('eligibility')) {
            if (nextElem.is('ul')) {
                qualification = nextElem.find('li').map((i, li) => clean($(li).text())).get().join('; ');
            }
        }

        if (headerText.includes('important dates')) {
            if (nextElem.is('ul')) {
                importantDates = nextElem.find('li').map((i, li) => clean($(li).text())).get();
            } else if (nextElem.is('.table-container') || nextElem.is('table')) {
                // Date table
                const table = nextElem.is('table') ? nextElem : nextElem.find('table');
                table.find('tr').each((j, row) => {
                    const cells = $(row).find('td');
                    if (cells.length >= 2) {
                        importantDates.push(`${clean($(cells[0]).text())}: ${clean($(cells[1]).text())}`);
                    }
                });
            }
        }

        if (headerText.includes('important links')) {
            // Usually a UL where each LI has strong text + 'click here' link
            // But structure varies slightly
            if (nextElem.is('ul') || nextElem.is('.table-container')) { // handle both list and table
                const container = nextElem.is('.table-container') ? nextElem.find('table') : nextElem;

                // If it is UL
                if (nextElem.is('ul')) {
                    nextElem.find('li').each((j, li) => {
                        const link = $(li).find('a');
                        if (link.length > 0) {
                            const label = clean($(li).text().replace('Click Here', '').replace('Click here', '').trim());
                            const url = link.attr('href') || '';
                            if (url && !url.includes('google_vignette')) { // Filter basic ad links if any
                                importantLinks.push({ label, url });
                            }
                        }
                    });
                }

                // If it is Table
                if (nextElem.is('.table-container') || nextElem.is('table')) {
                    const table = nextElem.is('table') ? nextElem : nextElem.find('table');
                    table.find('tr').each((j, row) => {
                        const cells = $(row).find('td');
                        const link = $(row).find('a');
                        if (link.length > 0) {
                            const label = clean($(cells[0]).text().trim());
                            const url = link.attr('href') || '';
                            if (url) importantLinks.push({ label, url });
                        }
                    });
                }
            }
        }
    });

    // Overview table fallback for Qualification/Age if missing
    if (qualification === 'Not Specified') {
        $('.table-container table tr').each((j, row) => {
            const key = $(row).find('td').eq(0).text().trim().toLowerCase();
            const val = $(row).find('td').eq(1).text().trim();
            if (key.includes('qualification')) qualification = val;
        });
    }
    if (ageLimit === 'Not Specified') {
        $('.table-container table tr').each((j, row) => {
            const key = $(row).find('td').eq(0).text().trim().toLowerCase();
            const val = $(row).find('td').eq(1).text().trim();
            if (key.includes('age limit')) ageLimit = val;
        });
    }


    return {
        title,
        organization,
        postDate,
        totalVacancy,
        description,
        applicationFee,
        ageLimit,
        qualification,
        importantDates,
        importantLinks,
        status: 'published',
        sourceUrl,
        postType,
        aiConfidence: 1.0, // High confidence since it's manual
        pattern_change_detected: false,
        pattern_change_summary: null
    };
}
