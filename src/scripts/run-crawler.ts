import { supabaseAdmin } from '../lib/supabaseAdmin';
import { processSource } from '../lib/crawler/engine';

async function run() {
    console.log('--- Starting Crawler Run ---');

    // 1. Get Sources
    const { data: sources, error } = await supabaseAdmin
        .from('sources')
        .select('*')
        .neq('status', 'blocked'); // Don't check blocked sources

    if (error) {
        console.error('Failed to fetch sources:', error);
        process.exit(1);
    }

    if (!sources || sources.length === 0) {
        console.log('No active sources found.');
        process.exit(0);
    }

    console.log(`Found ${sources.length} sources.`);

    // 2. Process each
    for (const source of sources) {
        // Cast to any to satisfy TS for now as types might be loose
        await processSource(source as any);
    }

    console.log('--- Crawler Run Complete ---');
    process.exit(0);
}

run().catch(e => {
    console.error('Fatal Crawler Error:', e);
    process.exit(1);
});
