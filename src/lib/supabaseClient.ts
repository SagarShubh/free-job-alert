import { createClient } from '@supabase/supabase-js'

// Provide a fallback to prevent build errors if Env Vars are missing
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

// Warn in console instead of crashing
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.warn('WARNING: NEXT_PUBLIC_SUPABASE_URL is missing. Using placeholder.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
