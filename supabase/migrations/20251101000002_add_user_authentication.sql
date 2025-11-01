-- Add user authentication to study_entries table

-- Add user_id column to study_entries table
ALTER TABLE public.study_entries 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index on user_id for better query performance
CREATE INDEX IF NOT EXISTS idx_study_entries_user_id ON public.study_entries(user_id);

-- Drop existing policies
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public.study_entries;
DROP POLICY IF EXISTS "Enable all operations for anonymous users" ON public.study_entries;

-- Create new RLS policies for user-specific data access
CREATE POLICY "Users can view their own study entries" ON public.study_entries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own study entries" ON public.study_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study entries" ON public.study_entries
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own study entries" ON public.study_entries
    FOR DELETE USING (auth.uid() = user_id);

-- Update function to set user_id on insert
CREATE OR REPLACE FUNCTION set_user_id_and_calculate_total()
RETURNS TRIGGER AS $$
BEGIN
    -- Set user_id if not already set
    IF NEW.user_id IS NULL THEN
        NEW.user_id := auth.uid();
    END IF;
    
    -- Calculate total_minutes
    NEW.total_minutes := (NEW.hours * 60) + NEW.minutes;
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop old trigger and function
DROP TRIGGER IF EXISTS tr_calculate_total_minutes ON public.study_entries;
DROP FUNCTION IF EXISTS calculate_total_minutes();

-- Create new trigger
CREATE TRIGGER tr_set_user_id_and_calculate_total
    BEFORE INSERT OR UPDATE ON public.study_entries
    FOR EACH ROW
    EXECUTE FUNCTION set_user_id_and_calculate_total();