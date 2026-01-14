
import './setup-env';
import { processSource } from '../lib/crawler/engine';
import { Source } from '../types';

const mockSource: Source = {
    id: 'test-id',
    name: 'FreeJobAlert',
    url: 'https://www.freejobalert.com/',
    target_type: 'job_notification',
    region: 'All India',
    status: 'active',
    last_checked_at: undefined,
    error_log: undefined,
    pattern: undefined
};

async function test() {
    console.log('--- Starting Test Crawler ---');
    try {
        await processSource(mockSource);
        console.log('--- Test Complete ---');
    } catch (e) {
        console.error('Test Failed:', e);
    }
}

test();
