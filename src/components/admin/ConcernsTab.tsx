import { useEffect, useState } from "react";
import { MessageSquare, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Concern = {
  id: string;
  name: string | null;
  phone: string | null;
  concern: string;
  chat_history: unknown;
  status: string;
  created_at: string;
};

const ConcernsTab = () => {
  const { toast } = useToast();
  const [rows, setRows] = useState<Concern[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Concern | null>(null);

  const fetch = async () => {
    setLoading(true);
    const { data } = await supabase.from("escalated_concerns").select("*").order("created_at", { ascending: false });
    if (data) setRows(data as Concern[]);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const resolve = async (id: string) => {
    const { error } = await supabase.from("escalated_concerns").update({ status: "resolved", resolved_at: new Date().toISOString() }).eq("id", id);
    if (error) toast({ title: "Update failed", variant: "destructive" });
    else { toast({ title: "Marked resolved" }); fetch(); setSelected(null); }
  };

  if (loading) return <p className="text-center text-muted-foreground py-8">Loading…</p>;
  if (rows.length === 0) return <p className="text-center text-muted-foreground py-8">No escalated concerns.</p>;

  return (
    <>
      <div className="space-y-3">
        {rows.map((r) => (
          <div key={r.id} onClick={() => setSelected(r)}
               className="bg-card border border-border rounded-xl p-4 cursor-pointer hover:border-primary/40 transition-colors">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-primary shrink-0" />
                  <p className="font-semibold text-foreground truncate">{r.name || "Anonymous"}</p>
                </div>
                {r.phone && <p className="text-xs text-muted-foreground">{r.phone}</p>}
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{r.concern}</p>
              </div>
              <Badge variant="outline" className="shrink-0 text-xs">{r.status}</Badge>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.name || "Anonymous"}</DialogTitle>
                <DialogDescription>{selected.phone || "No phone provided"}</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Concern</p>
                  <p className="text-sm text-foreground bg-secondary/40 rounded-lg p-3">{selected.concern}</p>
                </div>
                {Array.isArray(selected.chat_history) && selected.chat_history.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Chat history</p>
                    <div className="space-y-2 max-h-60 overflow-y-auto bg-secondary/30 rounded-lg p-2">
                      {(selected.chat_history as { role: string; content: string }[]).map((m, i) => (
                        <div key={i} className="text-xs">
                          <span className="font-semibold capitalize">{m.role}:</span> <span className="text-muted-foreground">{m.content}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {selected.status !== "resolved" && (
                  <Button onClick={() => resolve(selected.id)} className="w-full">
                    <CheckCircle2 className="w-4 h-4 mr-1" /> Mark resolved
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ConcernsTab;
