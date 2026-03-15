
-- Add user_id column to volunteers to link with auth users
ALTER TABLE public.volunteers ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
