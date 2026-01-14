
import './setup-env';
import { supabaseAdmin } from '../lib/supabaseAdmin';

async function check() {
    console.log('--- Checking Database State ---');

    // Check Sources
    const { count: sourceCount, error: sourceError } = await supabaseAdmin
        .from('sources')
        .select('*', { count: 'exact', head: true });

    if (sourceError) {
        console.error('Error counting sources:', sourceError);
    } else {
        console.log(`Total Sources: ${sourceCount}`);
    }

    // Check recent source activity
    const { data: sources, error: sourcesDataError } = await supabaseAdmin
        .from('sources')
        .select('url, status, last_checked_at, error_log')
        .order('last_checked_at', { ascending: false })
        .limit(5);

    if (sourcesDataError) {
        console.error('Error fetching sources:', sourcesDataError);
    } else {
        console.log('\n--- Recently Checked Sources ---');
        sources?.forEach(s => {
            console.log(`[${s.status}] ${s.url}`);
            console.log(`   Last Checked: ${s.last_checked_at}`);
            if (s.error_log) console.log(`   Error: ${s.error_log}`);
        });
    }

    // Check Jobs
    const { count: jobCount, error: jobError } = await supabaseAdmin
        .from('jobs')
        .select('*', { count: 'exact', head: true });

    if (jobError) {
        console.error('Error counting jobs:', jobError);
    } else {
        console.log(`\nTotal Jobs: ${jobCount}`);
    }

    // Check recent jobs
    const { data: jobs, error: jobsError } = await supabaseAdmin
        .from('jobs')
        .select('id, title, status, created_at, source_url, post_type')
        .order('created_at', { ascending: false })
        .limit(5);

    if (jobsError) {
        console.error('Error fetching recent jobs:', jobsError);
    } else {
        console.log('\n--- Recently Created Jobs ---');
        if (jobs && jobs.length > 0) {
            jobs.forEach(j => {
                console.log(`[${j.status}] ${j.title} (ID: ${j.id})`);
                console.log(`   Created: ${j.created_at}`);
                console.log(`   Source: ${j.source_url}`);
                console.log(`   Post Type: ${j.post_type}`);
            });
        } else {
            console.log('No jobs found.');
        }
    }
}

check().catch(console.error);
