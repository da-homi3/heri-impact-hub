import { useEffect, useState } from "react";
import { Gamepad2, CheckCircle2, XCircle, Timer, Activity, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type ArcadeSession = {
  id: string;
  player_name: string;
  phone: string;
  amount: number;
  game_type: string;
  mpesa_code: string;
  entry_code: string | null;
  status: string;
  created_at: string;
  duration_minutes: number | null;
  activated_at: string | null;
  expires_at: string | null;
  console_id: string | null;
  last_heartbeat_at: string | null;
};

const formatRemaining = (expiresAt: string | null) => {
  if (!expiresAt) return null;
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return "expired";
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}m ${String(s).padStart(2, "0")}s`;
};

const ArcadeTab = () => {
  const { toast } = useToast();
  const [rows, setRows] = useState<ArcadeSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setTick] = useState(0);

  const fetchRows = async () => {
    setLoading(true);
    const { data } = await supabase.from("arcade_sessions").select("*").order("created_at", { ascending: false });
    if (data) setRows(data as ArcadeSession[]);
    setLoading(false);
  };

  useEffect(() => { fetchRows(); }, []);
  // Refresh countdowns every second
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const verify = async (id: string) => {
    const { error } = await supabase.from("arcade_sessions").update({ status: "verified" }).eq("id", id);
    if (error) toast({ title: "Update failed", variant: "destructive" });
    else { toast({ title: "Payment verified" }); fetchRows(); }
  };

  const reject = async (id: string) => {
    const { error } = await supabase.from("arcade_sessions").update({ status: "rejected", entry_code: null }).eq("id", id);
    if (error) toast({ title: "Update failed", variant: "destructive" });
    else fetchRows();
  };

  if (loading) return <p className="text-center text-muted-foreground py-8">Loading…</p>;

  const active = rows.filter((r) => r.status === "active" && r.expires_at && new Date(r.expires_at) > new Date());
  const today = new Date(); today.setHours(0,0,0,0);
  const todayRevenue = rows
    .filter((r) => new Date(r.created_at) >= today && r.status !== "rejected")
    .reduce((sum, r) => sum + Number(r.amount), 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-xl p-3 text-center shadow-depth-sm">
          <Activity className="w-4 h-4 text-trust-green mx-auto mb-1" />
          <p className="text-xl font-bold text-foreground">{active.length}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Live now</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center shadow-depth-sm">
          <Clock className="w-4 h-4 text-primary mx-auto mb-1" />
          <p className="text-xl font-bold text-foreground">{rows.length}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Total sessions</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center shadow-depth-sm">
          <Gamepad2 className="w-4 h-4 text-warm-gold mx-auto mb-1" />
          <p className="text-xl font-bold text-foreground">KSh {todayRevenue.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Today</p>
        </div>
      </div>

      {/* Live sessions */}
      {active.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-trust-green animate-pulse" />
            Active sessions
          </h3>
          <div className="space-y-2">
            {active.map((r) => (
              <div key={r.id} className="bg-trust-green/5 border border-trust-green/30 rounded-xl p-3 flex items-center justify-between gap-2 shadow-depth-sm">
                <div className="min-w-0">
                  <p className="font-semibold text-foreground text-sm truncate">{r.player_name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {r.console_id || "no console"} · {r.game_type} · code <span className="font-mono">{r.entry_code}</span>
                  </p>
                </div>
                <Badge className="bg-trust-green text-white border-none shrink-0">
                  <Timer className="w-3 h-3 mr-1" /> {formatRemaining(r.expires_at)}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All sessions */}
      <div>
        <h3 className="text-sm font-bold text-foreground mb-2">All payments</h3>
        {rows.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No arcade payments yet.</p>
        ) : (
          <div className="space-y-3">
            {rows.map((r) => (
              <div key={r.id} className="bg-card border border-border rounded-xl p-4 space-y-2 shadow-depth-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Gamepad2 className="w-4 h-4 text-primary shrink-0" />
                      <p className="font-semibold text-foreground truncate">{r.player_name}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {r.phone} · {r.game_type} · {r.duration_minutes ?? 60}min · KSh {Number(r.amount).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">M-Pesa: {r.mpesa_code}</p>
                    {r.activated_at && (
                      <p className="text-[11px] text-muted-foreground">
                        Started {new Date(r.activated_at).toLocaleTimeString()} · Console: {r.console_id || "—"}
                      </p>
                    )}
                  </div>
                  <Badge variant="outline" className="shrink-0 text-xs">{r.status}</Badge>
                </div>
                {r.entry_code && (
                  <div className="bg-secondary/60 border border-primary/20 rounded-lg p-2 text-center">
                    <p className="text-xs text-muted-foreground">Entry code</p>
                    <p className="text-lg font-bold font-mono text-primary">{r.entry_code}</p>
                  </div>
                )}
                {r.status === "pending_verification" && (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => verify(r.id)} className="flex-1"><CheckCircle2 className="w-4 h-4 mr-1" />Mark verified</Button>
                    <Button size="sm" variant="destructive" onClick={() => reject(r.id)} className="flex-1"><XCircle className="w-4 h-4 mr-1" />Reject</Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArcadeTab;
