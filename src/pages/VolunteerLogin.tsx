import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Phone, KeyRound, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const VolunteerLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [accessCode, setAccessCode] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !accessCode.trim()) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      // Verify access code via edge function
      const { data, error } = await supabase.functions.invoke("verify-volunteer-code", {
        body: { phone: phone.trim(), access_code: accessCode.trim().toUpperCase() },
      });

      if (error || data?.error) {
        setLoading(false);
        toast({
          title: "Access denied",
          description: data?.error || "Invalid phone number or access code. Please check your details and try again.",
          variant: "destructive",
        });
        return;
      }

      // Sign in with the returned credentials
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      setLoading(false);

      if (signInError) {
        toast({
          title: "Login failed",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({ title: `Welcome, ${data.volunteer_name}! 🎉` });
      navigate("/community");
    } catch {
      setLoading(false);
      toast({ title: "Connection error", description: "Please try again.", variant: "destructive" });
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
            <KeyRound className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground mb-2">Welcome back</h2>
          <p className="text-muted-foreground text-sm">
            Enter your phone number and the access code you received after your volunteer application was approved.
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                className="pl-9"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="07XXXXXXXX"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accessCode">Access code</Label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="accessCode"
                type="text"
                className="pl-9 uppercase tracking-widest font-mono"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                placeholder="e.g. A3F9K2"
                maxLength={6}
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">
              The 6-character code sent to you after approval.
            </p>
          </div>

          <Button type="submit" size="lg" className="w-full font-bold" disabled={loading}>
            <LogIn className="w-4 h-4 mr-2" />
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <div className="mt-8 bg-secondary/50 rounded-xl p-4 text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an access code yet?
          </p>
          <Button variant="link" className="text-primary font-semibold mt-1" onClick={() => navigate("/volunteer")}>
            Apply to become a volunteer →
          </Button>
        </div>
      </main>
    </div>
  );
};

export default VolunteerLogin;
