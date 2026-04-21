import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AdminForgotPassword = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/admin/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Could not send reset email", description: error.message, variant: "destructive" });
      return;
    }
    setSent(true);
    toast({ title: "Reset link sent", description: "Check your inbox for the reset email." });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <Heart className="w-10 h-10 text-primary mx-auto" fill="currentColor" />
          <h1 className="text-2xl font-bold font-display text-foreground">Forgot password</h1>
          <p className="text-sm text-muted-foreground">
            Enter your admin email and we'll send you a link to reset your password.
          </p>
        </div>

        {sent ? (
          <div className="bg-card border border-border rounded-xl p-6 text-center space-y-3">
            <Mail className="w-10 h-10 text-primary mx-auto" />
            <p className="font-semibold text-foreground">Check your email</p>
            <p className="text-sm text-muted-foreground">
              We've sent a password reset link to <strong>{email}</strong>. The link will expire shortly, so use it soon.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email" type="email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@herizon.org" required
              />
            </div>
            <Button type="submit" className="w-full font-bold" disabled={loading}>
              <Mail className="w-4 h-4 mr-2" />
              {loading ? "Sending…" : "Send reset link"}
            </Button>
          </form>
        )}

        <Link
          to="/admin/login"
          className="flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to login
        </Link>
      </div>
    </div>
  );
};

export default AdminForgotPassword;
