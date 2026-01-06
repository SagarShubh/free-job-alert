import { createClient } from '@supabase/supabase-js';

// Server-side only client with Service Role Key
// WARNING: Never import this in client-side components!
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key-for-build';

if (!supabaseUrl || !supabaseServiceKey) {
    if (process.env.NODE_ENV === 'production') {
        console.warn('Missing Supabase Service Key for Admin Client. Admin operations may fail.');
    }
}

export const supabaseAdmin = createClient<any>(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});
