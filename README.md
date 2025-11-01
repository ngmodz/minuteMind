# MinuteMind

A clean and minimalistic web application for tracking daily study time with analytics and insights.

## ✨ Now Available as a Progressive Web App (PWA)!

MinuteMind can now be installed on your device like a native app! Works on phones, tablets, and computers.

### 📱 Features

- Dynamic time, date, and day display
- Daily study time logging
- Monthly insights and analytics
- Visual charts and graphs
- Motivational quotes
- Dark mode toggle
- Responsive design
- **🆕 Installable on all devices**
- **🆕 Works offline**
- **🆕 Fast loading with caching**
- **🆕 Native app experience**

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

## 📱 PWA Setup (New!)

MinuteMind is now a Progressive Web App! To complete the setup:

1. **Generate App Icons** (5 minutes):
   - Open `generate-icons.html` in your browser
   - Upload your logo image
   - Download all generated icons
   - Move them to the `/icons` folder

2. **Test Locally**:
   ```bash
   npm run dev
   ```
   Open http://localhost:3000 and look for the install prompt

3. **Deploy**:
   ```bash
   git add .
   git commit -m "Add PWA support"
   git push
   ```

📖 **Full PWA Documentation:**
- [Quick Start Guide](PWA-QUICKSTART.md) - 3-step setup
- [Complete Setup Guide](PWA-SETUP.md) - Detailed instructions
- [PWA Summary](PWA-SUMMARY.md) - Overview of changes

### How Users Install:
- **Android**: Chrome → Menu → "Install app"
- **iOS**: Safari → Share → "Add to Home Screen"
- **Desktop**: Chrome/Edge → Install icon in address bar

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