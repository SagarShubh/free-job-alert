import './setup-env';
import { supabaseAdmin } from '../lib/supabaseAdmin';
import * as cheerio from 'cheerio';
import { manualDraftFreeJobAlert } from '../lib/crawler/parsers/freejobalert';

async function bulkImport() {
    const sourceUrl = 'https://www.freejobalert.com/';
    console.log(`🚀 Starting Bulk Import from ${sourceUrl}`);

    try {
        // 1. Fetch Homepage
        const res = await fetch(sourceUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const html = await res.text();
        const $ = cheerio.load(html);

        // 2. Extract All Article Links
        const links = new Set<string>();
        $('a').each((_, el) => {
            const href = $(el).attr('href');
            if (href && href.includes('/articles/') && !href.includes('#') && !href.includes('javascript')) {
                links.add(href);
            }
        });

        const allUrls = Array.from(links);
        console.log(`Found ${allUrls.length} total job articles.`);

        // 3. Process Each URL
        let processed = 0;
        let skipped = 0;
        let failed = 0;

        for (const url of allUrls) {
            // Check existence
            const { data: existing } = await supabaseAdmin
                .from('jobs')
                .select('id')
                .eq('source_url', url)
                .single();

            if (existing) {
                console.log(`⏭️  Skipping existing: ${url}`);
                skipped++;
                continue;
            }

            console.log(`📥 Processing (${processed + skipped + 1}/${allUrls.length}): ${url}`);

            try {
                // Fetch & Parse
                const jobRes = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
                if (!jobRes.ok) throw new Error(`HTTP ${jobRes.status}`);
                const jobHtml = await jobRes.text();

                // Parse
                const draft = await manualDraftFreeJobAlert(jobHtml, url);

                // Insert
                const uniqueSlug = `${draft.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')}-${Date.now()}`;

                const { error } = await supabaseAdmin.from('jobs').insert({
                    title: draft.title,
                    slug: uniqueSlug,
                    organization: draft.organization,
                    post_date: draft.postDate,
                    total_vacancy: draft.totalVacancy,
                    brief_info: draft.description,
                    description: draft.description,
                    application_fee: draft.applicationFee,
                    age_limit: draft.ageLimit,
                    qualification: draft.qualification,
                    important_dates: draft.importantDates,
                    important_links: draft.importantLinks,
                    state_code: null, // Default
                    post_type: draft.postType, // Correct Type
                    status: 'published',
                    source_url: url,
                    ai_confidence: 1.0
                });

                if (error) throw error;

                console.log(`✅ Imported: ${draft.title}`);
                processed++;

            } catch (e: any) {
                console.error(`❌ Failed: ${e.message}`);
                failed++;
            }

            // Short delay to be nice to their server (100ms - 500ms is usually safe for sequential scraping)
            await new Promise(r => setTimeout(r, 200));
        }

        console.log(`\n🎉 Bulk Import Complete!`);
        console.log(`Total: ${allUrls.length} | Imported: ${processed} | Skipped: ${skipped} | Failed: ${failed}`);

    } catch (e) {
        console.error('Fatal Error:', e);
    }
}

bulkImport();
