import { NextRequest, NextResponse } from 'next/server';
import { scrapeJobPage } from '@/lib/discovery/scraper';
import { draftJobFromText } from '@/lib/ai/drafter';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: NextRequest) {
    try {
        const { url } = await req.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        // 1. Scrape
        console.log(`Scraping: ${url}`);
        const scrapeResult = await scrapeJobPage(url);

        if (!scrapeResult.success || !scrapeResult.data) {
            return NextResponse.json({ error: scrapeResult.error || 'Scraping failed' }, { status: 500 });
        }

        // 2. Draft with AI
        console.log('Drafting with AI...');
        let jobDraft;
        try {
            jobDraft = await draftJobFromText(scrapeResult.data.content, url);
        } catch (aiError: unknown) {
            const errorMessage = aiError instanceof Error ? aiError.message : 'Unknown AI error';
            console.error('AI Service Failed, using fallback:', errorMessage);
            // Fallback: Create a crude draft so we can still test the DB flow
            jobDraft = {
                title: scrapeResult.data.title || 'Unknown Job',
                organization: 'Unknown Organization',
                postDate: new Date().toISOString().split('T')[0],
                totalVacancy: 'Not Specified',
                description: scrapeResult.data.content.substring(0, 200) + '...',
                applicationFee: 'Not Specified',
                ageLimit: 'Not Specified',
                qualification: 'Not Specified',
                importantDates: [],
                importantLinks: [],
                // Metadata
                status: 'draft' as const,
                sourceUrl: url,
                aiConfidence: 0.1
            };
        }

        // 3. Save to Supabase
        console.log('Saving to Supabase...');

        // Check for duplicate source_url to avoid re-scraping/spamming
        const { data: existing } = await supabaseAdmin
            .from('jobs')
            .select('id, status')
            .eq('source_url', url)
            .single();

        if (existing) {
            return NextResponse.json({
                error: `Job already exists with status: ${existing.status}`,
                existingId: existing.id
            }, { status: 409 });
        }

        // Generate Slug
        const slugBase = jobDraft.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
        const uniqueSlug = `${slugBase}-${Date.now()}`;

        const { data: savedJob, error: saveError } = await supabaseAdmin
            .from('jobs')
            .insert({
                title: jobDraft.title,
                slug: uniqueSlug,
                organization: jobDraft.organization,
                total_vacancy: jobDraft.totalVacancy,
                post_date: jobDraft.postDate,
                description: jobDraft.description,
                application_fee: jobDraft.applicationFee,
                age_limit: jobDraft.ageLimit,
                qualification: jobDraft.qualification,
                important_dates: jobDraft.importantDates,
                important_links: jobDraft.importantLinks,

                // Metadata
                status: 'draft',
                source_url: url,
                ai_confidence: jobDraft.aiConfidence || 0.8
            })
            .select()
            .single();

        if (saveError) {
            console.error('Supabase Save Error:', saveError);
            throw new Error(`Failed to save job: ${saveError.message}`);
        }

        return NextResponse.json({
            success: true,
            data: savedJob,
            warning: jobDraft.aiConfidence === 0.1 ? 'AI Failed, using fallback draft' : undefined
        });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Discovery Error:', errorMessage);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}


