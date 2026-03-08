
-- Fix escalated_concerns policies: RESTRICTIVE -> PERMISSIVE
DROP POLICY IF EXISTS "Anyone can submit an escalated concern" ON public.escalated_concerns;
CREATE POLICY "Anyone can submit an escalated concern" ON public.escalated_concerns FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view escalated concerns" ON public.escalated_concerns;
CREATE POLICY "Admins can view escalated concerns" ON public.escalated_concerns FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update escalated concerns" ON public.escalated_concerns;
CREATE POLICY "Admins can update escalated concerns" ON public.escalated_concerns FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Fix profiles policies: RESTRICTIVE -> PERMISSIVE
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Fix user_roles policies: RESTRICTIVE -> PERMISSIVE
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
