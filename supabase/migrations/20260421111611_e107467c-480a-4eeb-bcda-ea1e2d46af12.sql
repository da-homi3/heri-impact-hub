-- 1. Volunteer self-approval bypass: enforce safe defaults on insert
CREATE OR REPLACE FUNCTION public.enforce_volunteer_defaults()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.status := 'pending';
  NEW.payment_status := 'pending';
  NEW.access_code := NULL;
  NEW.payment_reference := NULL;
  NEW.user_id := NULL;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_volunteer_safe_defaults ON public.volunteers;
CREATE TRIGGER trg_volunteer_safe_defaults
BEFORE INSERT ON public.volunteers
FOR EACH ROW EXECUTE FUNCTION public.enforce_volunteer_defaults();

-- 2. Donation amount + mpesa code validation
ALTER TABLE public.donations
  ADD CONSTRAINT donations_amount_positive CHECK (amount > 0),
  ADD CONSTRAINT donations_amount_max CHECK (amount <= 10000000),
  ADD CONSTRAINT donations_mpesa_code_format CHECK (mpesa_code ~ '^[A-Z0-9]{6,20}$');

ALTER TABLE public.volunteers
  ADD CONSTRAINT volunteers_payment_ref_format
    CHECK (payment_reference IS NULL OR payment_reference ~ '^[A-Z0-9]{6,20}$');

ALTER TABLE public.arcade_sessions
  ADD CONSTRAINT arcade_amount_positive CHECK (amount > 0),
  ADD CONSTRAINT arcade_amount_max CHECK (amount <= 1000000),
  ADD CONSTRAINT arcade_mpesa_code_format CHECK (mpesa_code ~ '^[A-Z0-9]{6,20}$');

-- 3. Community photos bucket - enforce private + RLS policies
INSERT INTO storage.buckets (id, name, public)
VALUES ('community-photos', 'community-photos', false)
ON CONFLICT (id) DO UPDATE SET public = false;

DROP POLICY IF EXISTS "Volunteers can upload own photos" ON storage.objects;
CREATE POLICY "Volunteers can upload own photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'community-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Authenticated can read community photos" ON storage.objects;
CREATE POLICY "Authenticated can read community photos"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'community-photos');

DROP POLICY IF EXISTS "Volunteers can update own photos" ON storage.objects;
CREATE POLICY "Volunteers can update own photos"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'community-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Volunteers can delete own photos" ON storage.objects;
CREATE POLICY "Volunteers can delete own photos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'community-photos' AND (storage.foldername(name))[1] = auth.uid()::text);