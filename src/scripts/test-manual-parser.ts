import fs from 'fs';
import path from 'path';
import { manualDraftFreeJobAlert } from './manual-drafter';

const samplePath = path.join(process.cwd(), 'sample_job_real.html');

async function testParser() {
    try {
        console.log(`Reading sample HTML from: ${samplePath}`);
        if (!fs.existsSync(samplePath)) {
            console.error('Sample file not found!');
            return;
        }

        const html = fs.readFileSync(samplePath, 'utf8');
        console.log('Sample HTML read. Length:', html.length);

        console.log('Running manual parser...');
        const result = await manualDraftFreeJobAlert(html, 'https://www.freejobalert.com/articles/rrb-group-d-recruitment-2026-apply-online-for-22000-posts-3033409');

        console.log('--- Parser Result ---');
        console.log(JSON.stringify(result, null, 2));
        console.log('---------------------');

    } catch (error) {
        console.error('Error during test:', error);
    }
}

testParser();
