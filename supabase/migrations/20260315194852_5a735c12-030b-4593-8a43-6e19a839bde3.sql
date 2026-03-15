
-- Add access_code column to volunteers
ALTER TABLE public.volunteers ADD COLUMN IF NOT EXISTS access_code TEXT UNIQUE;

-- Function to generate a unique 6-character alphanumeric access code
CREATE OR REPLACE FUNCTION public.generate_volunteer_access_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 6-char uppercase alphanumeric code
    new_code := upper(substr(md5(gen_random_uuid()::text), 1, 6));
    -- Ensure uniqueness
    SELECT EXISTS(SELECT 1 FROM public.volunteers WHERE access_code = new_code) INTO code_exists;
    IF NOT code_exists THEN
      RETURN new_code;
    END IF;
  END LOOP;
END;
$$;
