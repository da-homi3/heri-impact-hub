import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Heart, Users, Camera, MessageSquare, Send, Image,
  LogOut, MapPin, ThumbsUp, Lightbulb, Loader2, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@supabase/supabase-js";

interface Post {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  location: string | null;
  likes_count: number;
  created_at: string;
  volunteer_name?: string;
}

interface Suggestion {
  id: string;
  volunteer_name: string;
  suggestion: string;
  created_at: string;
}

interface TeamMember {
  id: string;
  full_name: string;
  location: string;
  skills: string[] | null;
}

const Community = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamName, setTeamName] = useState("");
  const [newPost, setNewPost] = useState("");
  const [postLocation, setPostLocation] = useState("");
  const [newSuggestion, setNewSuggestion] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [volunteerName, setVolunteerName] = useState("");

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/volunteer-login");
        return;
      }
      setUser(session.user);
      await loadData(session.user.id);
      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate("/volunteer-login");
      else setUser(session.user);
    });

    init();
    return () => subscription.unsubscribe();
  }, [navigate, loadData]);

  const loadData = useCallback(async (userId: string) => {
    // Load posts
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: postsData } = await (supabase as any)
      .from("community_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    setPosts((postsData as Post[]) || []);

    // Load suggestions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: suggestionsData } = await (supabase as any)
      .from("community_suggestions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    setSuggestions((suggestionsData as Suggestion[]) || []);

    // Load user's likes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: likesData } = await (supabase as any)
      .from("post_likes")
      .select("post_id")
      .eq("user_id", userId);
    if (likesData) setLikedPosts(new Set(likesData.map((l: { post_id: string }) => l.post_id)));

    // Load team info
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: memberData } = await (supabase as any)
      .from("team_members")
      .select("team_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (memberData?.team_id) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: team } = await (supabase as any)
        .from("volunteer_teams")
        .select("name")
        .eq("id", memberData.team_id)
        .single();
      if (team) setTeamName(team.name);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: members } = await (supabase as any)
        .from("team_members")
        .select("volunteer_id")
        .eq("team_id", memberData.team_id);

      if (members && members.length > 0) {
        const volunteerIds = members.map((m: { volunteer_id: string }) => m.volunteer_id);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: volunteers } = await (supabase as any)
          .from("volunteers")
          .select("id, full_name, location, skills")
          .in("id", volunteerIds);
        setTeamMembers((volunteers as TeamMember[]) || []);
      }
    }

    // Get volunteer name
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: vol } = await (supabase as any)
      .from("volunteers")
      .select("full_name")
      .eq("user_id", userId)
      .maybeSingle();
    if (vol) setVolunteerName(vol.full_name);
    else setVolunteerName(user?.user_metadata?.full_name || "Volunteer");
  }, [user?.user_metadata?.full_name]);

  // Realtime subscriptions
  useEffect(() => {
    const postsChannel = supabase
      .channel("community-posts")
      .on("postgres_changes", { event: "*", schema: "public", table: "community_posts" }, () => {
        if (user) loadData(user.id);
      })
      .subscribe();

    const sugChannel = supabase
      .channel("community-suggestions")
      .on("postgres_changes", { event: "*", schema: "public", table: "community_suggestions" }, () => {
        if (user) loadData(user.id);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(postsChannel);
      supabase.removeChannel(sugChannel);
    };
  }, [user, loadData]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.trim() && !imageFile) return;
    setSubmitting(true);

    let imageUrl: string | null = null;
    if (imageFile && user) {
      const ext = imageFile.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("community-photos")
        .upload(path, imageFile);
      if (!uploadError) {
        const { data: signedData } = await supabase.storage
          .from("community-photos")
          .createSignedUrl(path, 3600);
        imageUrl = signedData?.signedUrl ?? null;
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("community_posts").insert({
      user_id: user.id,
      content: newPost.trim() || "📸 Mission photo",
      image_url: imageUrl,
      location: postLocation.trim() || null,
    });

    setSubmitting(false);
    if (error) {
      toast({ title: "Failed to create post", variant: "destructive" });
      return;
    }
    setNewPost("");
    setPostLocation("");
    setImageFile(null);
    setImagePreview(null);
    toast({ title: "Post shared with the community! 🎉" });
  };

  const handleLike = async (postId: string) => {
    if (likedPosts.has(postId)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from("post_likes").delete().eq("post_id", postId).eq("user_id", user.id);
      setLikedPosts((prev) => { const n = new Set(prev); n.delete(postId); return n; });
      setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, likes_count: Math.max(0, p.likes_count - 1) } : p));
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from("post_likes").insert({ post_id: postId, user_id: user.id });
      setLikedPosts((prev) => new Set(prev).add(postId));
      setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, likes_count: p.likes_count + 1 } : p));
    }
  };

  const handleSubmitSuggestion = async () => {
    if (!newSuggestion.trim()) return;
    setSubmitting(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("community_suggestions").insert({
      user_id: user.id,
      volunteer_name: volunteerName || "Anonymous",
      suggestion: newSuggestion.trim(),
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Failed to submit suggestion", variant: "destructive" });
      return;
    }
    setNewSuggestion("");
    toast({ title: "Suggestion submitted! Thank you 💡" });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/90 backdrop-blur-md border-b border-border/50 shadow-sm">
        <div className="container flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")} className="p-2 -ml-2 text-foreground hover:text-primary transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Heart className="w-5 h-5 text-primary" />
            <h1 className="font-bold text-foreground text-lg font-display">Community</h1>
          </div>
          <button onClick={handleSignOut} className="p-2 text-muted-foreground hover:text-primary transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="container max-w-lg mx-auto px-4 py-6 pb-24">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <p className="text-muted-foreground text-sm">
            Welcome back, <span className="text-foreground font-semibold">{volunteerName || "Volunteer"}</span> 👋
          </p>
          {teamName && (
            <p className="text-xs text-primary font-semibold mt-1 flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> Team: {teamName}
            </p>
          )}
        </motion.div>

        <Tabs defaultValue="feed" className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-6">
            <TabsTrigger value="feed" className="text-xs font-semibold">
              <Camera className="w-3.5 h-3.5 mr-1" /> Feed
            </TabsTrigger>
            <TabsTrigger value="team" className="text-xs font-semibold">
              <Users className="w-3.5 h-3.5 mr-1" /> My team
            </TabsTrigger>
            <TabsTrigger value="suggest" className="text-xs font-semibold">
              <Lightbulb className="w-3.5 h-3.5 mr-1" /> Suggestions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="space-y-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-secondary via-card to-secondary/50 border border-border/50 rounded-2xl p-10 text-center"
            >
              <div className="text-5xl mb-4">🍬😊✨</div>
              <h3 className="text-2xl font-bold font-display text-foreground mb-3">
                Sweets, Smiles & Everything Nice
              </h3>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-4">
                Our volunteer feed is coming soon! Get ready to share mission photos, updates and celebrate the amazing work our community does.
              </p>
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-4 py-2 rounded-full">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Coming soon
              </div>
            </motion.div>
          </TabsContent>

          {/* TEAM TAB */}
          <TabsContent value="team" className="space-y-4">
            {teamMembers.length > 0 ? (
              <>
                <div className="bg-secondary/50 rounded-xl p-4 text-center mb-4">
                  <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h3 className="font-bold font-display text-foreground">{teamName}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{teamMembers.length} team members near you</p>
                </div>
                {teamMembers.map((member) => (
                  <div key={member.id} className="bg-card border border-border/50 rounded-xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-primary font-bold text-sm">{member.full_name[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{member.full_name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {member.location}
                      </p>
                      {member.skills && member.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {member.skills.slice(0, 3).map((s) => (
                            <span key={s} className="text-[10px] bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">{s}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="text-center py-12">
                <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">You haven't been assigned to a team yet.</p>
                <p className="text-xs text-muted-foreground mt-1">Teams are assigned based on your location once your application is approved.</p>
              </div>
            )}
          </TabsContent>

          {/* SUGGESTIONS TAB */}
          <TabsContent value="suggest" className="space-y-5">
            {/* Submit suggestion */}
            <div className="bg-card border border-border/50 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Lightbulb className="w-5 h-5 text-accent" />
                <h3 className="font-bold text-foreground text-sm font-display">Suggestion box</h3>
              </div>
              <p className="text-xs text-muted-foreground">Share ideas to improve our community, missions, or volunteer experience.</p>
              <Textarea
                value={newSuggestion}
                onChange={(e) => setNewSuggestion(e.target.value)}
                placeholder="Your suggestion…"
                className="min-h-[60px] text-sm resize-none"
                maxLength={500}
              />
              <Button size="sm" onClick={handleSubmitSuggestion} disabled={submitting || !newSuggestion.trim()} className="w-full">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><MessageSquare className="w-3.5 h-3.5 mr-1" /> Submit suggestion</>}
              </Button>
            </div>

            {/* Suggestion list */}
            <AnimatePresence>
              {suggestions.map((s) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card border border-border/50 rounded-xl p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center">
                      <Lightbulb className="w-3.5 h-3.5 text-accent" />
                    </div>
                    <p className="text-xs font-semibold text-foreground">{s.volunteer_name}</p>
                    <span className="text-[10px] text-muted-foreground ml-auto">{timeAgo(s.created_at)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{s.suggestion}</p>
                </motion.div>
              ))}
            </AnimatePresence>

            {suggestions.length === 0 && (
              <div className="text-center py-12">
                <Lightbulb className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No suggestions yet. Share your ideas!</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Community;
