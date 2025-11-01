# Daybook Feature - Setup Instructions

## Overview
The Daybook feature adds a calendar-based task management system to MinuteMind, allowing users to:
- View a monthly calendar with today's date highlighted
- Select any date to view/manage tasks for that day
- Add, edit, and delete tasks for each date
- Mark tasks as complete/incomplete
- See visual indicators for dates with tasks

## Database Setup

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of `supabase/migrations/20251101000003_create_daybook_tasks.sql`
5. Click **Run** to execute the migration
6. Verify the table was created by going to **Table Editor** and checking for `daybook_tasks`

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Run the migration
supabase db push

# Or run manually
supabase db execute -f supabase/migrations/20251101000003_create_daybook_tasks.sql
```

## What the Migration Creates

The migration creates:

1. **Table: `daybook_tasks`**
   - `id` (UUID) - Primary key
   - `user_id` (UUID) - References auth.users
   - `task_date` (DATE) - The date for the task
   - `title` (TEXT) - Task title (required)
   - `description` (TEXT) - Optional task description
   - `completed` (BOOLEAN) - Task completion status
   - `created_at` (TIMESTAMP) - Creation timestamp
   - `updated_at` (TIMESTAMP) - Last update timestamp

2. **Indexes** for better query performance:
   - Index on `user_id`
   - Index on `task_date`
   - Composite index on `user_id` and `task_date`

3. **Row Level Security (RLS)** policies:
   - Users can only view their own tasks
   - Users can only create tasks for themselves
   - Users can only update their own tasks
   - Users can only delete their own tasks

4. **Trigger** to automatically update `updated_at` timestamp

## Accessing the Daybook

Once the database is set up:

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to MinuteMind (http://localhost:3000 or your development URL)

3. Sign in with your account

4. Click the **📅 Daybook** tab in the navigation

## Features

### Calendar View
- **Current month display** with navigation buttons
- **Today's date** highlighted in blue
- **Selected date** highlighted when clicked
- **Task indicators** (small dots) on dates with tasks
- **Previous/next month** days shown in lighter color

### Task Management
- **Add Task**: Click the "+ Add task" button
- **Edit Task**: Click the "✏️ Edit" button on any task
- **Delete Task**: Click the "🗑️ Delete" button (with confirmation)
- **Complete Task**: Click the checkbox to toggle completion
- **Task Details**: Each task can have a title and optional description

### Data Persistence
- All tasks are stored in your Supabase database
- Tasks are user-specific (each user only sees their own tasks)
- Tasks persist across sessions and devices

## Files Added

- `pages/daybook.html` - Daybook page HTML
- `css/daybook.css` - Daybook-specific styles
- `js/daybook.js` - Daybook functionality
- `supabase/migrations/20251101000003_create_daybook_tasks.sql` - Database migration

## Files Modified

- `index.html` - Added Daybook tab to navigation
- `css/styles.css` - Added CSS variables and link styling for Daybook tab

## Dark Mode Support

The Daybook feature fully supports dark mode, which can be toggled using the theme button in the header. The theme preference is synchronized across all pages.

## Troubleshooting

### Tasks Not Loading
- Verify the database migration ran successfully
- Check browser console for errors
- Ensure you're logged in with a valid account
- Verify RLS policies are correctly set up

### Calendar Not Displaying
- Check that all CSS files are loading correctly
- Ensure JavaScript modules are loading (check browser console)
- Verify the calendar container exists in the DOM

### Tasks Not Saving
- Check Supabase connection in browser console
- Verify authentication is working
- Check that the `daybook_tasks` table exists in your database
- Ensure RLS policies allow INSERT operations

## Future Enhancements

Potential improvements for the Daybook feature:
- Task categories/tags
- Task priorities
- Recurring tasks
- Task reminders
- Task search and filtering
- Drag-and-drop task reordering
- Calendar view export
- Integration with study time tracking
