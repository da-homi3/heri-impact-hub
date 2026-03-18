
-- Create arcade_sessions table for HeriArcade gaming payments
CREATE TABLE public.arcade_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_name text NOT NULL,
  phone text NOT NULL,
  amount numeric NOT NULL,
  mpesa_code text NOT NULL,
  entry_code text UNIQUE,
  game_type text NOT NULL DEFAULT 'general',
  status text NOT NULL DEFAULT 'pending_verification',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.arcade_sessions ENABLE ROW LEVEL SECURITY;

-- Anyone can submit an arcade payment
CREATE POLICY "Anyone can submit arcade payment"
  ON public.arcade_sessions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Admins can view all arcade sessions
CREATE POLICY "Admins can view arcade sessions"
  ON public.arcade_sessions FOR SELECT
  TO authenticated
  USING (has_role('admin'::app_role));

-- Admins can update arcade sessions
CREATE POLICY "Admins can update arcade sessions"
  ON public.arcade_sessions FOR UPDATE
  TO authenticated
  USING (has_role('admin'::app_role));

-- Generate entry code function
CREATE OR REPLACE FUNCTION public.generate_arcade_entry_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    new_code := 'HA-' || upper(substr(md5(gen_random_uuid()::text), 1, 6));
    SELECT EXISTS(SELECT 1 FROM public.arcade_sessions WHERE entry_code = new_code) INTO code_exists;
    IF NOT code_exists THEN
      RETURN new_code;
    END IF;
  END LOOP;
END;
$$;

-- Rate limit trigger for arcade submissions
CREATE TRIGGER check_arcade_rate
  BEFORE INSERT ON public.arcade_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.check_submission_rate();
