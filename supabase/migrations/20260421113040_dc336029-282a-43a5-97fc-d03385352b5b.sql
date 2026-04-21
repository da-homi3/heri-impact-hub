-- Tickets table for support ticket system
CREATE TABLE public.tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  status TEXT NOT NULL DEFAULT 'open',
  admin_response TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  CONSTRAINT tickets_status_check CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  CONSTRAINT tickets_category_check CHECK (category IN ('general', 'donation', 'volunteer', 'arcade', 'technical', 'other'))
);

ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a ticket"
  ON public.tickets FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view tickets"
  ON public.tickets FOR SELECT
  TO authenticated
  USING (has_role('admin'::app_role));

CREATE POLICY "Admins can update tickets"
  ON public.tickets FOR UPDATE
  TO authenticated
  USING (has_role('admin'::app_role));

CREATE TRIGGER tickets_updated_at
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER tickets_rate_limit
  BEFORE INSERT ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION public.check_submission_rate();

-- Storage: community-photos bucket — uploads metadata table so admins can review
CREATE TABLE public.photo_uploads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  uploader_name TEXT NOT NULL,
  phone TEXT,
  caption TEXT,
  storage_path TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  CONSTRAINT photo_uploads_status_check CHECK (status IN ('pending', 'approved', 'rejected'))
);

ALTER TABLE public.photo_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a photo upload"
  ON public.photo_uploads FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view photo uploads"
  ON public.photo_uploads FOR SELECT
  TO authenticated
  USING (has_role('admin'::app_role));

CREATE POLICY "Admins can update photo uploads"
  ON public.photo_uploads FOR UPDATE
  TO authenticated
  USING (has_role('admin'::app_role));

CREATE POLICY "Admins can delete photo uploads"
  ON public.photo_uploads FOR DELETE
  TO authenticated
  USING (has_role('admin'::app_role));

-- Allow public uploads to community-photos under a "public-uploads/" prefix
CREATE POLICY "Anyone can upload to public-uploads folder"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    bucket_id = 'community-photos'
    AND (storage.foldername(name))[1] = 'public-uploads'
  );

CREATE POLICY "Admins can view all community photos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'community-photos' AND has_role('admin'::app_role));

CREATE POLICY "Admins can delete community photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'community-photos' AND has_role('admin'::app_role));