-- Create daybook_tasks table
CREATE TABLE IF NOT EXISTS public.daybook_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    task_date DATE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_daybook_tasks_user_id ON public.daybook_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_daybook_tasks_date ON public.daybook_tasks(task_date);
CREATE INDEX IF NOT EXISTS idx_daybook_tasks_user_date ON public.daybook_tasks(user_id, task_date);

-- Enable Row Level Security
ALTER TABLE public.daybook_tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for daybook_tasks
-- Users can only see their own tasks
CREATE POLICY "Users can view their own tasks"
    ON public.daybook_tasks
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own tasks
CREATE POLICY "Users can create their own tasks"
    ON public.daybook_tasks
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own tasks
CREATE POLICY "Users can update their own tasks"
    ON public.daybook_tasks
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own tasks
CREATE POLICY "Users can delete their own tasks"
    ON public.daybook_tasks
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_daybook_tasks_updated_at
    BEFORE UPDATE ON public.daybook_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
