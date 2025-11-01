-- Create study_entries table for MinuteMind application
CREATE TABLE IF NOT EXISTS public.study_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL,
    hours INTEGER NOT NULL DEFAULT 0,
    minutes INTEGER NOT NULL DEFAULT 0,
    total_minutes INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on date for better query performance
CREATE INDEX IF NOT EXISTS idx_study_entries_date ON public.study_entries(date);

-- Create index on created_at for chronological queries
CREATE INDEX IF NOT EXISTS idx_study_entries_created_at ON public.study_entries(created_at);

-- Function to automatically calculate total_minutes
CREATE OR REPLACE FUNCTION calculate_total_minutes()
RETURNS TRIGGER AS $$
BEGIN
    NEW.total_minutes := (NEW.hours * 60) + NEW.minutes;
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically calculate total_minutes on insert/update
CREATE TRIGGER tr_calculate_total_minutes
    BEFORE INSERT OR UPDATE ON public.study_entries
    FOR EACH ROW
    EXECUTE FUNCTION calculate_total_minutes();

-- Enable Row Level Security (RLS)
ALTER TABLE public.study_entries ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for authenticated users
-- You can customize this based on your authentication requirements
CREATE POLICY "Enable all operations for authenticated users" ON public.study_entries
    FOR ALL USING (true);

-- Create policy for anonymous access (for development/demo purposes)
-- Remove or modify this in production
CREATE POLICY "Enable all operations for anonymous users" ON public.study_entries
    FOR ALL USING (true);

-- Insert some sample data for testing (optional)
INSERT INTO public.study_entries (date, hours, minutes) VALUES
    ('2025-10-30', 2, 30),
    ('2025-10-31', 1, 45),
    ('2025-11-01', 3, 15)
ON CONFLICT DO NOTHING;