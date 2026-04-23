import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Gamepad2, Timer, CheckCircle2, XCircle, MonitorPlay, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type RedeemResult =
  | { status: "activated" | "active"; player_name: string; expires_at: string; seconds_remaining: number; duration_minutes?: number }
  | { status: "expired"; player_name: string; expired_at: string }
  | { status: "invalid"; message: string };

const formatTime = (s: number) => {
  if (s <= 0) return "00:00";
  const m = Math.floor(s / 60);
  const sec = s % 60;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return h > 0
    ? `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
    : `${String(mm).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

const ArcadeConsole = () => {
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [consoleId, setConsoleId] = useState(() => localStorage.getItem("heriarcade_console_id") || "");
  const [busy, setBusy] = useState(false);
  const [session, setSession] = useState<RedeemResult | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const tickRef = useRef<number | null>(null);
  const heartbeatRef = useRef<number | null>(null);

  useEffect(() => {
    if (consoleId) localStorage.setItem("heriarcade_console_id", consoleId);
  }, [consoleId]);

  // Local countdown
  useEffect(() => {
    if (session && (session.status === "active" || session.status === "activated")) {
      setSecondsLeft(session.seconds_remaining);
      tickRef.current = window.setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            if (tickRef.current) clearInterval(tickRef.current);
            // Force a refresh with backend to mark as expired
            redeem(code, true);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
      // Heartbeat every 30s to keep server-side last_heartbeat_at fresh
      heartbeatRef.current = window.setInterval(() => { redeem(code, true); }, 30000);
    }
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.status]);

  const redeem = async (rawCode: string, silent = false) => {
    const trimmed = rawCode.trim().toUpperCase();
    if (!trimmed) { toast({ title: "Enter a code", variant: "destructive" }); return; }
    if (!silent) setBusy(true);
    const { data, error } = await supabase.rpc("redeem_arcade_code", {
      _code: trimmed,
      _console_id: consoleId || null,
    });
    if (!silent) setBusy(false);

    if (error) {
      if (!silent) toast({ title: "Network error", description: error.message, variant: "destructive" });
      return;
    }
    const result = data as unknown as RedeemResult;
    setSession(result);
    if (result.status === "activated" && !silent) toast({ title: "Session started! 🎮", description: `Welcome, ${result.player_name}` });
    if (result.status === "expired" && !silent) toast({ title: "Code expired", variant: "destructive" });
    if (result.status === "invalid" && !silent) toast({ title: "Invalid code", description: result.message, variant: "destructive" });
  };

  const endSession = () => {
    if (tickRef.current) clearInterval(tickRef.current);
    if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    setSession(null);
    setCode("");
    setSecondsLeft(0);
  };

  const isPlaying = session && (session.status === "active" || session.status === "activated") && secondsLeft > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-primary/15 blur-3xl float-slow" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-pink-glow/30 blur-3xl float-slower" />
      </div>

      <div className="relative container max-w-2xl px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-3">
            <MonitorPlay className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wide">HeriArcade Console</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-display text-foreground">Console redemption</h1>
          <p className="text-muted-foreground text-sm mt-2 max-w-md mx-auto">
            Enter your entry code to start your gaming session. Your timer begins now.
          </p>
        </motion.div>

        {!isPlaying && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-3xl p-6 shadow-depth-lg perspective-1000"
          >
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="consoleId">Console ID (optional)</Label>
                <Input
                  id="consoleId"
                  placeholder="e.g. console-01"
                  value={consoleId}
                  onChange={(e) => setConsoleId(e.target.value)}
                />
                <p className="text-[11px] text-muted-foreground">
                  Set once per machine. Helps the dashboard track which console a player is on.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Entry code</Label>
                <Input
                  id="code"
                  placeholder="HA-XXXXXX"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="text-center text-2xl font-mono tracking-widest h-16 shadow-depth-sm"
                  autoFocus
                />
              </div>

              <Button
                onClick={() => redeem(code)}
                disabled={busy}
                className="w-full h-14 text-base shadow-depth"
                size="lg"
              >
                <Gamepad2 className="w-5 h-5 mr-2" />
                {busy ? "Redeeming…" : "Start session"}
              </Button>

              {session?.status === "expired" && (
                <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/30 rounded-xl p-3">
                  <XCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Code expired</p>
                    <p className="text-xs text-muted-foreground">
                      {session.player_name}'s session ended at {new Date(session.expired_at).toLocaleTimeString()}.
                    </p>
                  </div>
                </div>
              )}

              {session?.status === "invalid" && (
                <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/30 rounded-xl p-3">
                  <XCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground">{session.message}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {isPlaying && session && "expires_at" in session && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-3xl p-8 shadow-depth-lg text-center perspective-1000"
          >
            <div className="tilt-card">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/15 mb-4 shadow-depth">
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold font-display text-foreground mb-1">
                Welcome, {session.player_name}!
              </h2>
              <p className="text-sm text-muted-foreground mb-6">Your session is now active. Game on. 🎮</p>

              <div className="bg-card border-2 border-primary/30 rounded-2xl p-6 mb-5 shadow-depth">
                <div className="flex items-center justify-center gap-2 text-muted-foreground mb-2">
                  <Timer className="w-4 h-4" />
                  <span className="text-xs uppercase font-semibold tracking-wider">Time remaining</span>
                </div>
                <p className="text-5xl sm:text-6xl font-bold font-mono text-primary tracking-tight tabular-nums">
                  {formatTime(secondsLeft)}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Expires at {new Date(session.expires_at).toLocaleTimeString()}
                </p>
              </div>

              <Button variant="outline" onClick={endSession} className="w-full">
                End session view
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ArcadeConsole;
