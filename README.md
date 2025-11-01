# MinuteMind

A clean and minimalistic web application for tracking daily study time with analytics and insights.

## Features

- Dynamic time, date, and day display
- Daily study time logging
- Monthly insights and analytics
- Visual charts and graphs
- Motivational quotes
- Dark mode toggle
- Responsive design

## Tech Stack

- **Frontend:** HTML, CSS, Vanilla JavaScript
- **Backend:** Supabase
- **Charts:** Chart.js
- **Hosting:** Vercel

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   npm run env:setup
   ```
4. Copy `.env.example` to `.env` and fill in your Supabase credentials:
   ```bash
   cp .env.example .env
   ```
5. Edit `.env` with your actual Supabase values:
   ```
   SUPABASE_URL=https://your-project-ref.supabase.co
   SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_TABLE_NAME=study_entries
   ```
6. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

The application uses the following environment variables:

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anonymous/public key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (backend only)
- `SUPABASE_TABLE_NAME`: Name of the database table (default: study_entries)

**Note:** Never commit your `.env` file to version control. The `.env.example` file is provided as a template.

## Deployment

This project is configured for easy deployment on Vercel.

## Database Schema

The Supabase table should have the following structure:
- `id` (uuid, primary key)
- `date` (date)
- `hours` (integer)
- `minutes` (integer)
- `total_minutes` (integer)
- `created_at` (timestamp)