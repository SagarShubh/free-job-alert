import './setup-env';
import { supabaseAdmin } from '../lib/supabaseAdmin';

async function publishAll() {
    console.log('🚀 Publishing all existing drafts...');

    const { data, error } = await supabaseAdmin
        .from('jobs')
        .update({ status: 'published' })
        .eq('status', 'draft')
        .select();

    if (error) {
        console.error('Error updating jobs:', error);
    } else {
        console.log(`✅ Successfully published ${data.length} jobs.`);
    }
}

publishAll();
