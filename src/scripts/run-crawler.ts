import { supabaseAdmin } from '../lib/supabaseAdmin';
import { processSource } from '../lib/crawler/engine';
import { Source } from '../types';

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
    // 2. Process each
    for (const source of sources) {
        await processSource(source as Source);
    }

    console.log('--- Crawler Run Complete ---');
    process.exit(0);
}

run().catch(e => {
    console.error('Fatal Crawler Error:', e);
    process.exit(1);
});
