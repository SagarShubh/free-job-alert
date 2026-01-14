import './setup-env';
import { supabaseAdmin } from '../lib/supabaseAdmin';

async function enableFreeJobAlert() {
    console.log('Enabling FreeJobAlert source...');

    const url = 'https://www.freejobalert.com/';

    // Check if exists
    const { data: existing } = await supabaseAdmin
        .from('sources')
        .select('*')
        .eq('url', url)
        .single();

    if (existing) {
        console.log('Source exists. Updating status to active...');
        await supabaseAdmin
            .from('sources')
            .update({ status: 'active', error_log: null })
            .eq('id', existing.id);
        console.log('Updated.');
    } else {
        console.log('Source does not exist. Creating...');
        await supabaseAdmin
            .from('sources')
            .insert({
                url: url,
                name: 'FreeJobAlert',
                target_type: 'job',
                region: 'All India',
                status: 'active'
            });
        console.log('Created.');
    }
}

enableFreeJobAlert();
