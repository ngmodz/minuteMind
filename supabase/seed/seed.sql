-- Seed data for MinuteMind study_entries table
-- This file contains sample data for development and testing

-- Clear existing data (uncomment if needed)
-- TRUNCATE TABLE public.study_entries;

-- Insert sample study entries for the past month
INSERT INTO public.study_entries (date, hours, minutes) VALUES
    -- October 2025
    ('2025-10-01', 2, 30),
    ('2025-10-02', 1, 45),
    ('2025-10-03', 3, 15),
    ('2025-10-05', 2, 0),
    ('2025-10-07', 1, 30),
    ('2025-10-08', 2, 45),
    ('2025-10-10', 4, 0),
    ('2025-10-12', 2, 15),
    ('2025-10-14', 3, 30),
    ('2025-10-15', 1, 45),
    ('2025-10-17', 2, 30),
    ('2025-10-19', 3, 0),
    ('2025-10-20', 2, 15),
    ('2025-10-22', 1, 30),
    ('2025-10-24', 3, 45),
    ('2025-10-26', 2, 0),
    ('2025-10-28', 4, 15),
    ('2025-10-30', 2, 30),
    ('2025-10-31', 1, 45),
    
    -- November 2025
    ('2025-11-01', 3, 0)
ON CONFLICT (date) DO NOTHING;