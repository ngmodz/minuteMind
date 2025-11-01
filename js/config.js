// Supabase Configuration
// Replace these with your actual Supabase project credentials

const SUPABASE_CONFIG = {
    url: 'YOUR_SUPABASE_URL', // Replace with your Supabase project URL
    anonKey: 'YOUR_SUPABASE_ANON_KEY', // Replace with your Supabase anonymous key
    
    // Table name for study entries
    tableName: 'study_entries'
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