-- Fix all RLS policies: recreate as PERMISSIVE (default was RESTRICTIVE)

-- ============ DONATIONS ============
DROP POLICY IF EXISTS "Anyone can submit a donation" ON public.donations;
DROP POLICY IF EXISTS "Admins can view donations" ON public.donations;
DROP POLICY IF EXISTS "Admins can update donations" ON public.donations;

CREATE POLICY "Anyone can submit a donation" ON public.donations FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can view donations" ON public.donations FOR SELECT TO authenticated USING (public.has_role('admin'));
CREATE POLICY "Admins can update donations" ON public.donations FOR UPDATE TO authenticated USING (public.has_role('admin'));

-- ============ ESCALATED_CONCERNS ============
DROP POLICY IF EXISTS "Anyone can submit an escalated concern" ON public.escalated_concerns;
DROP POLICY IF EXISTS "Admins can view escalated concerns" ON public.escalated_concerns;
DROP POLICY IF EXISTS "Admins can update escalated concerns" ON public.escalated_concerns;

CREATE POLICY "Anyone can submit an escalated concern" ON public.escalated_concerns FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can view escalated concerns" ON public.escalated_concerns FOR SELECT TO authenticated USING (public.has_role('admin'));
CREATE POLICY "Admins can update escalated concerns" ON public.escalated_concerns FOR UPDATE TO authenticated USING (public.has_role('admin'));

-- ============ VOLUNTEERS ============
DROP POLICY IF EXISTS "Anyone can submit volunteer application" ON public.volunteers;
DROP POLICY IF EXISTS "Admins can view volunteers" ON public.volunteers;
DROP POLICY IF EXISTS "Admins can update volunteers" ON public.volunteers;
DROP POLICY IF EXISTS "Admins can delete volunteers" ON public.volunteers;

CREATE POLICY "Anyone can submit volunteer application" ON public.volunteers FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can view volunteers" ON public.volunteers FOR SELECT TO authenticated USING (public.has_role('admin'));
CREATE POLICY "Admins can update volunteers" ON public.volunteers FOR UPDATE TO authenticated USING (public.has_role('admin'));
CREATE POLICY "Admins can delete volunteers" ON public.volunteers FOR DELETE TO authenticated USING (public.has_role('admin'));

-- ============ PROFILES ============
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- ============ USER_ROLES ============
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;

CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role('admin'));
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);