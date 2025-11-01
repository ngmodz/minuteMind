// Supabase Configuration
// Replace these with your actual Supabase project credentials

// Supabase Configuration
// Environment variables are loaded from environment configuration

import { env } from './env.js';

// Validate environment configuration on load
if (!env.validateConfig()) {
    console.warn('⚠️ Some environment variables may be missing. Check your .env file.');
}

const SUPABASE_CONFIG = {
    url: env.get('SUPABASE_URL'),
    anonKey: env.get('SUPABASE_ANON_KEY'),
    
    // Table name for study entries
    tableName: env.get('SUPABASE_TABLE_NAME')
};

// To set up your Supabase database:
// 1. Go to https://supabase.com and create a new project
// 2. Create a table called 'study_entries' with the following columns:
//    - id (uuid, primary key, default: gen_random_uuid())
//    - date (date, not null)
//    - hours (int4, not null, default: 0)
//    - minutes (int4, not null, default: 0)
//    - total_minutes (int4, not null, default: 0)
//    - created_at (timestamptz, default: now())
//    - updated_at (timestamptz, default: now())
// 3. Set up Row Level Security (RLS) policies as needed
// 4. Replace the URL and anonKey above with your project's credentials

export { SUPABASE_CONFIG };