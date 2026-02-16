
-- Table to store escalated support concerns
CREATE TABLE public.escalated_concerns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  phone TEXT,
  concern TEXT NOT NULL,
  chat_history JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.escalated_concerns ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (users don't need to be logged in to escalate)
CREATE POLICY "Anyone can submit an escalated concern"
ON public.escalated_concerns
FOR INSERT
WITH CHECK (true);

-- Only authenticated staff can read/update escalated concerns
CREATE POLICY "Authenticated users can view escalated concerns"
ON public.escalated_concerns
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update escalated concerns"
ON public.escalated_concerns
FOR UPDATE
USING (auth.role() = 'authenticated');
