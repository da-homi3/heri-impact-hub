import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Users, CheckCircle2, XCircle, Clock, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Volunteer = {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  location: string;
  availability: string;
  skills: string[];
  interests: string[];
  payment_status: string;
  payment_reference: string | null;
  status: string;
  programme_rules_accepted: boolean;
  created_at: string;
};

const statusColors: Record<string, string> = {
  pending: "bg-accent/20 text-accent-foreground border-accent/40",
  approved: "bg-trust-green/20 text-foreground border-trust-green/40",
  rejected: "bg-destructive/20 text-destructive border-destructive/40",
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Volunteer | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/admin/login"); return; }
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      const isAdmin = roles?.some((r: { role: string }) => r.role === "admin");
      if (!isAdmin) { navigate("/admin/login"); return; }
      await fetchVolunteers();
    };
    init();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/admin/login"); return; }
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
    const isAdmin = roles?.some((r: { role: string }) => r.role === "admin");
    if (!isAdmin) { navigate("/admin/login"); }
  };

  const fetchVolunteers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("volunteers")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setVolunteers(data as Volunteer[]);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    setUpdating(true);
    const { error } = await supabase.from("volunteers").update({ status }).eq("id", id);
    if (error) {
      toast({ title: "Failed to update", variant: "destructive" });
    } else {
      toast({ title: `Volunteer ${status}` });
      setVolunteers((prev) => prev.map((v) => (v.id === id ? { ...v, status } : v)));
      if (selected?.id === id) setSelected({ ...selected, status });
    }
    setUpdating(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const stats = {
    total: volunteers.length,
    pending: volunteers.filter((v) => v.status === "pending").length,
    approved: volunteers.filter((v) => v.status === "approved").length,
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card/90 backdrop-blur-md border-b border-border/50 shadow-sm">
        <div className="container flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <h1 className="font-bold text-foreground font-display">Volunteer dashboard</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-1" /> Sign out
          </Button>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total", value: stats.total, icon: Users },
            { label: "Pending", value: stats.pending, icon: Clock },
            { label: "Approved", value: stats.approved, icon: CheckCircle2 },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
              <s.icon className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Volunteer list */}
        {loading ? (
          <p className="text-center text-muted-foreground py-12">Loading volunteers…</p>
        ) : volunteers.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No volunteer applications yet.</p>
        ) : (
          <div className="space-y-3">
            {volunteers.map((v) => (
              <div
                key={v.id}
                className="bg-card border border-border rounded-xl p-4 flex items-center justify-between gap-3 cursor-pointer hover:border-primary/40 transition-colors"
                onClick={() => setSelected(v)}
              >
                <div className="min-w-0">
                  <p className="font-semibold text-foreground truncate">{v.full_name}</p>
                  <p className="text-xs text-muted-foreground">{v.phone} · {v.location}</p>
                  <p className="text-xs text-muted-foreground">{new Date(v.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className={statusColors[v.status] || ""}>{v.status}</Badge>
                  <Eye className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display">{selected.full_name}</DialogTitle>
                <DialogDescription>{selected.phone} · {selected.location}</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 text-sm">
                {selected.email && (
                  <div><strong className="text-foreground">Email:</strong> <span className="text-muted-foreground">{selected.email}</span></div>
                )}
                <div><strong className="text-foreground">Availability:</strong> <span className="text-muted-foreground">{selected.availability}</span></div>

                {selected.skills.length > 0 && (
                  <div>
                    <strong className="text-foreground">Skills:</strong>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {selected.skills.map((s) => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}
                    </div>
                  </div>
                )}

                {selected.interests.length > 0 && (
                  <div>
                    <strong className="text-foreground">Interests:</strong>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {selected.interests.map((s) => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}
                    </div>
                  </div>
                )}

                <div>
                  <strong className="text-foreground">Payment ref:</strong>{" "}
                  <span className="text-muted-foreground font-mono">{selected.payment_reference || "—"}</span>
                  <Badge variant="outline" className="ml-2 text-xs">{selected.payment_status}</Badge>
                </div>

                <div>
                  <strong className="text-foreground">Rules accepted:</strong>{" "}
                  <span className="text-muted-foreground">{selected.programme_rules_accepted ? "Yes" : "No"}</span>
                </div>

                <div>
                  <strong className="text-foreground">Applied:</strong>{" "}
                  <span className="text-muted-foreground">{new Date(selected.created_at).toLocaleString()}</span>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => updateStatus(selected.id, "approved")}
                    disabled={updating || selected.status === "approved"}
                    className="flex-1"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" /> Approve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => updateStatus(selected.id, "rejected")}
                    disabled={updating || selected.status === "rejected"}
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-1" /> Reject
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
