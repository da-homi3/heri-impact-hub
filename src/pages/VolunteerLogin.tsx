import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Mail, Lock, UserPlus, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const VolunteerLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: window.location.origin + "/community",
        },
      });
      setLoading(false);
      if (error) {
        toast({ title: error.message, variant: "destructive" });
        return;
      }
      toast({
        title: "Check your email",
        description: "We've sent a verification link to confirm your account.",
      });
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) {
        toast({ title: "Invalid email or password", variant: "destructive" });
        return;
      }
      navigate("/community");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card/90 backdrop-blur-md border-b border-border/50 shadow-sm">
        <div className="container flex items-center h-14 px-4 gap-3">
          <button onClick={() => navigate("/")} className="p-2 -ml-2 text-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Heart className="w-5 h-5 text-primary" />
          <h1 className="font-bold text-foreground text-lg font-display">Volunteer community</h1>
        </div>
      </header>

      <main className="container max-w-sm mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground mb-2">
            {isSignUp ? "Create your account" : "Welcome back"}
          </h2>
          <p className="text-muted-foreground text-sm">
            {isSignUp
              ? "Sign up to join the Herizon volunteer community."
              : "Sign in to access your community, team, and missions."}
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <div className="relative">
                <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="fullName" className="pl-9" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" required />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input id="email" type="email" className="pl-9" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input id="password" type="password" className="pl-9" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" minLength={6} required />
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full font-bold" disabled={loading}>
            {loading ? "Please wait…" : isSignUp ? (
              <><UserPlus className="w-4 h-4 mr-2" /> Create account</>
            ) : (
              <><LogIn className="w-4 h-4 mr-2" /> Sign in</>
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button onClick={() => setIsSignUp(!isSignUp)} className="text-primary font-semibold hover:underline">
            {isSignUp ? "Sign in" : "Sign up"}
          </button>
        </p>

        <p className="text-center text-xs text-muted-foreground mt-4">
          You must be a registered volunteer to access community features.
        </p>
      </main>
    </div>
  );
};

export default VolunteerLogin;
