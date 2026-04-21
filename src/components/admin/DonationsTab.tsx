import { useEffect, useState } from "react";
import { Heart, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Donation = {
  id: string;
  donor_name: string | null;
  phone: string;
  amount: number;
  mpesa_code: string;
  source: string;
  status: string;
  created_at: string;
};

const DonationsTab = () => {
  const { toast } = useToast();
  const [rows, setRows] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    const { data } = await supabase.from("donations").select("*").order("created_at", { ascending: false });
    if (data) setRows(data as Donation[]);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const update = async (id: string, status: string) => {
    const { error } = await supabase.from("donations").update({ status }).eq("id", id);
    if (error) toast({ title: "Update failed", variant: "destructive" });
    else { toast({ title: `Donation ${status}` }); fetch(); }
  };

  const total = rows.filter(r => r.status === "verified").reduce((s, r) => s + Number(r.amount), 0);

  if (loading) return <p className="text-center text-muted-foreground py-8">Loading…</p>;

  return (
    <div className="space-y-3">
      <div className="bg-trust-green/10 border border-trust-green/30 rounded-xl p-4 text-center">
        <p className="text-xs text-muted-foreground">Total verified</p>
        <p className="text-2xl font-bold text-foreground font-display">KSh {total.toLocaleString()}</p>
      </div>

      {rows.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No donations yet.</p>
      ) : rows.map((r) => (
        <div key={r.id} className="bg-card border border-border rounded-xl p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-primary shrink-0" />
                <p className="font-semibold text-foreground truncate">{r.donor_name || "Anonymous"}</p>
              </div>
              <p className="text-xs text-muted-foreground">{r.phone} · {r.source}</p>
              <p className="text-sm font-bold text-foreground">KSh {Number(r.amount).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground font-mono">M-Pesa: {r.mpesa_code}</p>
            </div>
            <Badge variant="outline" className="shrink-0 text-xs">{r.status}</Badge>
          </div>
          {r.status === "pending_verification" && (
            <div className="flex gap-2">
              <Button size="sm" onClick={() => update(r.id, "verified")} className="flex-1"><CheckCircle2 className="w-4 h-4 mr-1" />Verify</Button>
              <Button size="sm" variant="destructive" onClick={() => update(r.id, "rejected")} className="flex-1"><XCircle className="w-4 h-4 mr-1" />Reject</Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default DonationsTab;
