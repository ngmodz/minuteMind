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
2. Open `index.html` in a web browser
3. Configure your Supabase credentials in `js/config.js`

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