CREATE TABLE public.event_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  ticket_type TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  total_amount NUMERIC NOT NULL,
  mpesa_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_verification',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.event_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can purchase a ticket"
ON public.event_tickets
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can view event tickets"
ON public.event_tickets
FOR SELECT
TO authenticated
USING (has_role('admin'::app_role));

CREATE POLICY "Admins can update event tickets"
ON public.event_tickets
FOR UPDATE
TO authenticated
USING (has_role('admin'::app_role));