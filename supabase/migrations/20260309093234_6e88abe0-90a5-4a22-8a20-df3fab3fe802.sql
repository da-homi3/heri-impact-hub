
-- Drop all policies that depend on old has_role(uuid, app_role) FIRST
DROP POLICY IF EXISTS "Admins can view volunteers" ON public.volunteers;
DROP POLICY IF EXISTS "Admins can update volunteers" ON public.volunteers;
DROP POLICY IF EXISTS "Admins can delete volunteers" ON public.volunteers;
DROP POLICY IF EXISTS "Admins can view escalated concerns" ON public.escalated_concerns;
DROP POLICY IF EXISTS "Admins can update escalated concerns" ON public.escalated_concerns;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;

-- Now drop old 2-param function
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role);

-- Create new self-scoped single-param version
CREATE OR REPLACE FUNCTION public.has_role(_role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = _role
  )
$$;

REVOKE EXECUTE ON FUNCTION public.has_role(app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(app_role) TO authenticated;

-- Recreate all policies with new function signature
CREATE POLICY "Admins can view escalated concerns" ON public.escalated_concerns FOR SELECT USING (public.has_role('admin'));
CREATE POLICY "Admins can update escalated concerns" ON public.escalated_concerns FOR UPDATE USING (public.has_role('admin'));
CREATE POLICY "Admins can view volunteers" ON public.volunteers FOR SELECT USING (public.has_role('admin'));
CREATE POLICY "Admins can update volunteers" ON public.volunteers FOR UPDATE USING (public.has_role('admin'));
CREATE POLICY "Admins can delete volunteers" ON public.volunteers FOR DELETE USING (public.has_role('admin'));
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.has_role('admin'));
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- Rate limiting trigger
CREATE OR REPLACE FUNCTION public.check_submission_rate()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO recent_count
  FROM (
    SELECT 1 FROM public.escalated_concerns
    WHERE phone = NEW.phone AND created_at > now() - interval '1 hour'
    UNION ALL
    SELECT 1 FROM public.volunteers
    WHERE phone = NEW.phone AND created_at > now() - interval '1 hour'
  ) sub;

  IF recent_count >= 5 THEN
    RAISE EXCEPTION 'Too many submissions. Please try again later.';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER check_escalated_rate
  BEFORE INSERT ON public.escalated_concerns
  FOR EACH ROW EXECUTE FUNCTION public.check_submission_rate();

CREATE TRIGGER check_volunteer_rate
  BEFORE INSERT ON public.volunteers
  FOR EACH ROW EXECUTE FUNCTION public.check_submission_rate();

-- Donations table
CREATE TABLE public.donations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  donor_name TEXT,
  phone TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  mpesa_code TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'mpesa',
  status TEXT NOT NULL DEFAULT 'pending_verification',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a donation" ON public.donations FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view donations" ON public.donations FOR SELECT USING (public.has_role('admin'));
CREATE POLICY "Admins can update donations" ON public.donations FOR UPDATE USING (public.has_role('admin'));

CREATE TRIGGER check_donation_rate
  BEFORE INSERT ON public.donations
  FOR EACH ROW EXECUTE FUNCTION public.check_submission_rate();
