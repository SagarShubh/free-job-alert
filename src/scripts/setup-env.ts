import { config } from 'dotenv';
import { resolve } from 'path';

console.log('--- Loading Environment Variables ---');
const path = resolve(process.cwd(), '.env.local');
const result = config({ path });

if (result.error) {
    console.error('Failed to load .env.local:', result.error);
} else {
    console.log('Loaded .env.local');
    // Debug
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.log('SUPABASE_SERVICE_ROLE_KEY loaded (len: ' + process.env.SUPABASE_SERVICE_ROLE_KEY.length + ')');
    } else {
        console.error('SUPABASE_SERVICE_ROLE_KEY is MISSING after loading .env.local');
    }
}
