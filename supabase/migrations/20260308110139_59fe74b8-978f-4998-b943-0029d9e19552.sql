
DROP POLICY "Authenticated users can view escalated concerns" ON public.escalated_concerns;
CREATE POLICY "Admins can view escalated concerns" ON public.escalated_concerns
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY "Authenticated users can update escalated concerns" ON public.escalated_concerns;
CREATE POLICY "Admins can update escalated concerns" ON public.escalated_concerns
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
