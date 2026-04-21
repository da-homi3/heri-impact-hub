import { useEffect, useState } from "react";
import { Gamepad2, CheckCircle2, XCircle } from "lucide-react";
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
};

const ArcadeTab = () => {
  const { toast } = useToast();
  const [rows, setRows] = useState<ArcadeSession[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    const { data } = await supabase.from("arcade_sessions").select("*").order("created_at", { ascending: false });
    if (data) setRows(data as ArcadeSession[]);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const verify = async (id: string) => {
    const { data: codeData, error: codeError } = await supabase.rpc("generate_arcade_entry_code");
    if (codeError || !codeData) { toast({ title: "Failed to generate code", variant: "destructive" }); return; }
    const { error } = await supabase.from("arcade_sessions").update({ status: "verified", entry_code: codeData }).eq("id", id);
    if (error) toast({ title: "Update failed", variant: "destructive" });
    else { toast({ title: "Verified!", description: `Entry code: ${codeData}` }); fetch(); }
  };

  const reject = async (id: string) => {
    const { error } = await supabase.from("arcade_sessions").update({ status: "rejected", entry_code: null }).eq("id", id);
    if (error) toast({ title: "Update failed", variant: "destructive" });
    else fetch();
  };

  if (loading) return <p className="text-center text-muted-foreground py-8">Loading…</p>;
  if (rows.length === 0) return <p className="text-center text-muted-foreground py-8">No arcade payments yet.</p>;

  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <div key={r.id} className="bg-card border border-border rounded-xl p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-4 h-4 text-primary shrink-0" />
                <p className="font-semibold text-foreground truncate">{r.player_name}</p>
              </div>
              <p className="text-xs text-muted-foreground">{r.phone} · {r.game_type} · KSh {Number(r.amount).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground font-mono">M-Pesa: {r.mpesa_code}</p>
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
              <Button size="sm" onClick={() => verify(r.id)} className="flex-1"><CheckCircle2 className="w-4 h-4 mr-1" />Verify</Button>
              <Button size="sm" variant="destructive" onClick={() => reject(r.id)} className="flex-1"><XCircle className="w-4 h-4 mr-1" />Reject</Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ArcadeTab;
