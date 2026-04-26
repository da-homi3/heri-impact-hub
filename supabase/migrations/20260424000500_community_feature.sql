
-- Create tables for the Community feature

-- 1. Volunteer Teams
CREATE TABLE IF NOT EXISTS public.volunteer_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Team Members (Links volunteers to teams and users)
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.volunteer_teams(id) ON DELETE CASCADE,
  volunteer_id UUID NOT NULL REFERENCES public.volunteers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(team_id, volunteer_id),
  UNIQUE(user_id) -- A user can only be in one team for now
);

-- 3. Community Posts
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  volunteer_name TEXT,
  content TEXT NOT NULL,
  image_url TEXT,
  location TEXT,
  likes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Post Likes
CREATE TABLE IF NOT EXISTS public.post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- 5. Community Suggestions
CREATE TABLE IF NOT EXISTS public.community_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  volunteer_name TEXT NOT NULL,
  suggestion TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.volunteer_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_suggestions ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Volunteer Teams: Everyone can view
CREATE POLICY "Everyone can view teams" ON public.volunteer_teams FOR SELECT USING (true);

-- Team Members: Users can view their own team membership and their teammates
CREATE POLICY "Users can view teammates" ON public.team_members 
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
    )
  );

-- Community Posts: Authenticated users can view and create
CREATE POLICY "Authenticated users can view posts" ON public.community_posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create posts" ON public.community_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON public.community_posts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Post Likes: Authenticated users can view and toggle
CREATE POLICY "Authenticated users can view likes" ON public.post_likes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can toggle likes" ON public.post_likes FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Community Suggestions: Users can view all and create own
CREATE POLICY "Everyone can view suggestions" ON public.community_suggestions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create suggestions" ON public.community_suggestions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Admin access to everything
CREATE POLICY "Admins have full access to teams" ON public.volunteer_teams FOR ALL USING (public.has_role('admin'));
CREATE POLICY "Admins have full access to team members" ON public.team_members FOR ALL USING (public.has_role('admin'));
CREATE POLICY "Admins have full access to posts" ON public.community_posts FOR ALL USING (public.has_role('admin'));
CREATE POLICY "Admins have full access to likes" ON public.post_likes FOR ALL USING (public.has_role('admin'));
CREATE POLICY "Admins have full access to suggestions" ON public.community_suggestions FOR ALL USING (public.has_role('admin'));

-- Trigger to update likes_count on posts
CREATE OR REPLACE FUNCTION public.update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.community_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.community_posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_post_like_change
  AFTER INSERT OR DELETE ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_post_likes_count();

-- Ensure community-photos bucket exists (this part might require manual setup in dashboard, but we can try)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('community-photos', 'community-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Anyone can view community photos" ON storage.objects FOR SELECT USING (bucket_id = 'community-photos');
CREATE POLICY "Users can upload mission photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'community-photos' AND auth.role() = 'authenticated');
