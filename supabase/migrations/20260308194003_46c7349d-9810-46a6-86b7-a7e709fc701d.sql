
-- Drop all existing RESTRICTIVE policies on volunteers
DROP POLICY IF EXISTS "Anyone can submit volunteer application" ON public.volunteers;
DROP POLICY IF EXISTS "Admins can view volunteers" ON public.volunteers;
DROP POLICY IF EXISTS "Admins can update volunteers" ON public.volunteers;
DROP POLICY IF EXISTS "Admins can delete volunteers" ON public.volunteers;

-- Recreate as PERMISSIVE policies
CREATE POLICY "Anyone can submit volunteer application"
ON public.volunteers
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can view volunteers"
ON public.volunteers
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update volunteers"
ON public.volunteers
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete volunteers"
ON public.volunteers
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
