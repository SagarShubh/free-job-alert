import { supabaseAdmin } from '../supabaseAdmin';
import { draftJobFromText } from '../ai/drafter';
import * as cheerio from 'cheerio';
import { Source } from '../../types';

export async function processSource(source: Source) {
    console.log(`Checking source: ${source.url} (${source.target_type})`);

    try {
        // 1. Fetch Page
        const response = await fetch(source.url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html'
            },
            // next: { revalidate: 0 } // 'next' is not valid in standard fetch, removing it to satisfy tsx/node
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status} - ${response.statusText}`);
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // 2. Extract Links
        const links: string[] = [];
        $('a').each((_, el) => {
            const href = $(el).attr('href');
            if (href) {
                try {
                    const absoluteUrl = new URL(href, source.url).toString();
                    links.push(absoluteUrl);
                } catch {
                    // Invalid URL, ignore
                }
            }
        });

        // 3. Filter Links
        // Basic keywords to identify relevant notifications
        const keywords = ['notification', 'advertisement', 'vacancy', 'recruitment', 'result', 'admit', 'card', 'hall', 'ticket'];
        const candidates = links.filter(link => {
            const lowerLink = link.toLowerCase();
            const matchesKeyword = keywords.some(k => lowerLink.includes(k));
            const matchesPattern = source.pattern ? new RegExp(source.pattern).test(link) : true;

            // Exclude common junk
            const isJunk = lowerLink.includes('javascript:') || lowerLink.includes('#') || lowerLink.includes('archive');

            return matchesKeyword && matchesPattern && !isJunk;
        });

        const uniqueCandidates = Array.from(new Set(candidates)).slice(0, 5); // Limit to 5 per run to save AI tokens

        console.log(`Found ${uniqueCandidates.length} potential candidates.`);

        // 4. Process Candidates
        for (const url of uniqueCandidates) {
            await processCandidate(url, source);
        }

        // 5. Update Source Status
        await supabaseAdmin
            .from('sources')
            .update({
                status: 'active',
                last_checked_at: new Date().toISOString(),
                error_log: null
            })
            .eq('id', source.id);

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error processing source ${source.url}:`, error);

        await supabaseAdmin
            .from('sources')
            .update({
                status: 'error',
                last_checked_at: new Date().toISOString(),
                error_log: errorMessage
            })
            .eq('id', source.id);
    }
}

async function processCandidate(url: string, source: Source) {
    // Check if exists
    const { data: existing } = await supabaseAdmin
        .from('jobs')
        .select('id')
        .eq('source_url', url)
        .single();

    if (existing) {
        console.log(`Skipping existing: ${url}`);
        return;
    }

    console.log(`Processing new candidate: ${url}`);

    try {
        // Fetch candidate content
        const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const html = await res.text();
        const $ = cheerio.load(html);

        // Remove boilerplate
        $('nav, footer, header, script, style').remove();
        const text = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 15000);

        // Draft with AI
        const draft = await draftJobFromText(text, url, source.target_type);

        // Generate Slug
        const slugBase = draft.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const uniqueSlug = `${slugBase}-${Date.now()}`;

        // Save
        const { error: saveError } = await supabaseAdmin.from('jobs').insert({
            title: draft.title,
            slug: uniqueSlug,
            organization: draft.organization,
            post_date: draft.postDate,
            total_vacancy: draft.totalVacancy || 'Not Specified',
            brief_info: draft.description, // Mapping description to brief_info

            // New Columns
            description: draft.description,
            application_fee: draft.applicationFee,
            age_limit: draft.ageLimit,
            qualification: draft.qualification,
            important_dates: draft.importantDates,
            important_links: draft.importantLinks,

            // Map Source Region to Job State Code
            state_code: source.region !== 'All India' ? source.region : null,

            post_type: source.target_type,
            status: 'draft',
            source_url: url,
            ai_confidence: draft.aiConfidence
        })
            .select()
            .single();

        if (saveError) {
            throw saveError;
        }

        console.log(`✅ Draft created: ${draft.title}`);

        // Send Notification
        if (process.env.TELEGRAM_BOT_TOKEN) {
            const msg = `📢 *New Draft Found!* \n\n*${draft.title}*\n_${draft.organization}_\n\nConfidence: ${draft.aiConfidence}\n[Open Admin Dashboard](${process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://google.com'})`;

            // Relative import to avoid alias issues
            const { sendTelegramNotification } = await import('../notifications/telegram');
            await sendTelegramNotification(msg);
        }

    } catch (e: unknown) {
        const errorMsg = e instanceof Error ? e.message : 'Unknown processing error';
        console.error(`Failed to draft ${url}:`, errorMsg);
    }
}
