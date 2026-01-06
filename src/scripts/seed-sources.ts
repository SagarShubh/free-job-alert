import { supabaseAdmin } from '../lib/supabaseAdmin';

async function seed() {
    console.log('--- Seeding Sources ---');

    const sources = [
        {
            name: 'UPSC Recruitment',
            url: 'https://upsc.gov.in/advertisement/vacancy-circular-2024',
            target_type: 'job_notification',
            status: 'active'
        },
        {
            name: 'SSC Notices',
            url: 'https://ssc.nic.in/Portal/Notices',
            target_type: 'job_notification',
            status: 'active'
        },
        {
            name: 'IBPS',
            url: 'https://ibps.in',
            target_type: 'job_notification',
            status: 'active'
        }
    ];

    for (const source of sources) {
        const { error } = await supabaseAdmin
            .from('sources')
            .upsert(source, { onConflict: 'url' });

        if (error) console.error(`Failed to seed ${source.name}:`, error.message);
        else console.log(`✅ Seeded: ${source.name}`);
    }

    console.log('--- Seeding Complete ---');
}

seed().catch(console.error);
