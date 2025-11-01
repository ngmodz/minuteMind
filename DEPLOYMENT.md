# Deployment Guide

## Vercel Deployment

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/Sign in with GitHub
   - Import your repository
   - Deploy with default settings

3. **Configure Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Create the `study_entries` table with the following SQL:
   
   ```sql
   CREATE TABLE study_entries (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     date DATE NOT NULL,
     hours INTEGER NOT NULL DEFAULT 0,
     minutes INTEGER NOT NULL DEFAULT 0,
     total_minutes INTEGER NOT NULL DEFAULT 0,
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );
   
   -- Create an index for better performance
   CREATE INDEX idx_study_entries_date ON study_entries(date);
   
   -- Add RLS (Row Level Security) if needed
   ALTER TABLE study_entries ENABLE ROW LEVEL SECURITY;
   
   -- Create a policy to allow all operations (adjust as needed)
   CREATE POLICY "Allow all operations" ON study_entries
   FOR ALL USING (true);
   ```

4. **Update Configuration**
   - Copy your Supabase URL and anon key
   - Update `js/config.js` with your credentials
   - Commit and push changes

## Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Open in browser**
   - Navigate to `http://localhost:3000`

## Features

✅ Dynamic time and date display  
✅ Study time logging with hours and minutes  
✅ Supabase database integration with local storage fallback  
✅ Monthly insights and analytics  
✅ Interactive charts (daily, cumulative, weekly)  
✅ Motivational quotes  
✅ Edit and delete entries  
✅ Dark mode toggle  
✅ CSV data export  
✅ Responsive design  
✅ Clean minimalist UI  

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+