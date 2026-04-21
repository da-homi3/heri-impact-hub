import { useEffect, useState } from "react";
import { Ticket, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type TicketRow = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  subject: string;
  message: string;
  category: string;
  status: string;
  admin_response: string | null;
  created_at: string;
};

const statusColors: Record<string, string> = {
  open: "bg-accent/20 text-accent-foreground border-accent/40",
  in_progress: "bg-warm-gold/20 text-foreground border-warm-gold/40",
  resolved: "bg-trust-green/20 text-foreground border-trust-green/40",
  closed: "bg-muted text-muted-foreground border-border",
};

const TicketsTab = () => {
  const { toast } = useToast();
  const [rows, setRows] = useState<TicketRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<TicketRow | null>(null);
  const [response, setResponse] = useState("");
  const [status, setStatus] = useState("");

  const fetch = async () => {
    setLoading(true);
    const { data } = await supabase.from("tickets").select("*").order("created_at", { ascending: false });
    if (data) setRows(data as TicketRow[]);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const open = (t: TicketRow) => {
    setSelected(t);
    setResponse(t.admin_response || "");
    setStatus(t.status);
  };

  const save = async () => {
    if (!selected) return;
    const payload: Record<string, unknown> = { status, admin_response: response || null };
    if (status === "resolved") payload.resolved_at = new Date().toISOString();
    const { error } = await supabase.from("tickets").update(payload).eq("id", selected.id);
    if (error) toast({ title: "Update failed", variant: "destructive" });
    else { toast({ title: "Ticket updated" }); fetch(); setSelected(null); }
  };

  if (loading) return <p className="text-center text-muted-foreground py-8">Loading…</p>;
  if (rows.length === 0) return <p className="text-center text-muted-foreground py-8">No tickets yet.</p>;

  return (
    <>
      <div className="space-y-3">
        {rows.map((t) => (
          <div key={t.id} onClick={() => open(t)}
               className="bg-card border border-border rounded-xl p-4 cursor-pointer hover:border-primary/40 transition-colors">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-primary shrink-0" />
                  <p className="font-semibold text-foreground truncate">{t.subject}</p>
                </div>
                <p className="text-xs text-muted-foreground">{t.name} · {t.phone}</p>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{t.message}</p>
              </div>
              <div className="flex flex-col gap-1 items-end shrink-0">
                <Badge variant="outline" className={`text-xs ${statusColors[t.status] || ""}`}>{t.status.replace("_", " ")}</Badge>
                <Badge variant="secondary" className="text-xs">{t.category}</Badge>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.subject}</DialogTitle>
                <DialogDescription>{selected.name} · {selected.phone}{selected.email ? ` · ${selected.email}` : ""}</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Message</p>
                  <p className="text-sm text-foreground bg-secondary/40 rounded-lg p-3 whitespace-pre-wrap">{selected.message}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Internal response / notes</p>
                  <Textarea value={response} onChange={(e) => setResponse(e.target.value)} rows={4} placeholder="Reply or notes…" />
                </div>
                <Button onClick={save} className="w-full">
                  <CheckCircle2 className="w-4 h-4 mr-1" /> Save changes
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TicketsTab;
