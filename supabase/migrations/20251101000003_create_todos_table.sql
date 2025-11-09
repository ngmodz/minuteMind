-- Create todos table
CREATE TABLE IF NOT EXISTS public.todos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

-- Create policies for todos
CREATE POLICY "Users can view their own todos"
    ON public.todos FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own todos"
    ON public.todos FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own todos"
    ON public.todos FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own todos"
    ON public.todos FOR DELETE
    USING (auth.uid() = user_id);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON public.todos(user_id);
CREATE INDEX IF NOT EXISTS idx_todos_created_at ON public.todos(created_at DESC);

-- Create trigger to automatically set user_id
CREATE OR REPLACE FUNCTION public.set_todo_user_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.user_id IS NULL THEN
        NEW.user_id := auth.uid();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER set_todo_user_id_trigger
    BEFORE INSERT ON public.todos
    FOR EACH ROW
    EXECUTE FUNCTION public.set_todo_user_id();

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_todo_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_todo_updated_at_trigger
    BEFORE UPDATE ON public.todos
    FOR EACH ROW
    EXECUTE FUNCTION public.update_todo_updated_at();
