import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Users, CheckCircle2, XCircle, Clock, Eye, LayoutDashboard, Heart, Gamepad2, MessageSquare, Image as ImageIcon, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import OverviewTab from "@/components/admin/OverviewTab";
import ArcadeTab from "@/components/admin/ArcadeTab";
import DonationsTab from "@/components/admin/DonationsTab";
import ConcernsTab from "@/components/admin/ConcernsTab";
import PhotosTab from "@/components/admin/PhotosTab";
import TicketsTab from "@/components/admin/TicketsTab";

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
  access_code: string | null;
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
  const [stats, setStats] = useState({
    volunteers: { total: 0, pending: 0, approved: 0 },
    donations: { total: 0, sum: 0 },
    arcade: { total: 0, pending: 0 },
    concerns: { total: 0, pending: 0 },
    photos: { total: 0, pending: 0 },
    tickets: { total: 0, open: 0 },
  });

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/admin/login"); return; }
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      const isAdmin = roles?.some((r: { role: string }) => r.role === "admin");
      if (!isAdmin) { navigate("/admin/login"); return; }
      await Promise.all([fetchVolunteers(), fetchStats()]);
    };
    init();
  }, [navigate, fetchVolunteers, fetchStats]);

  const fetchVolunteers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("volunteers").select("*").order("created_at", { ascending: false });
    if (!error && data) setVolunteers(data as Volunteer[]);
    setLoading(false);
  }, []);

  const fetchStats = useCallback(async () => {
    const [vRes, dRes, aRes, cRes, pRes, tRes] = await Promise.all([
      supabase.from("volunteers").select("status"),
      supabase.from("donations").select("status, amount"),
      supabase.from("arcade_sessions").select("status"),
      supabase.from("escalated_concerns").select("status"),
      supabase.from("photo_uploads").select("status"),
      supabase.from("tickets").select("status"),
    ]);
    const v = (vRes.data || []) as { status: string }[];
    const d = (dRes.data || []) as { status: string; amount: number }[];
    const a = (aRes.data || []) as { status: string }[];
    const c = (cRes.data || []) as { status: string }[];
    const p = (pRes.data || []) as { status: string }[];
    const t = (tRes.data || []) as { status: string }[];
    setStats({
      volunteers: { total: v.length, pending: v.filter(x => x.status === "pending").length, approved: v.filter(x => x.status === "approved").length },
      donations: { total: d.length, sum: d.filter(x => x.status === "verified").reduce((s, x) => s + Number(x.amount || 0), 0) },
      arcade: { total: a.length, pending: a.filter(x => x.status === "pending_verification").length },
      concerns: { total: c.length, pending: c.filter(x => x.status === "pending").length },
      photos: { total: p.length, pending: p.filter(x => x.status === "pending").length },
      tickets: { total: t.length, open: t.filter(x => x.status === "open").length },
    });
  }, []);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(true);
    let accessCode: string | null = null;
    if (status === "approved") {
      const { data: codeData, error: codeError } = await supabase.rpc("generate_volunteer_access_code");
      if (codeError || !codeData) { toast({ title: "Failed to generate access code", variant: "destructive" }); setUpdating(false); return; }
      accessCode = codeData as string;
    }
    const updatePayload: Record<string, unknown> = { status };
    if (accessCode) updatePayload.access_code = accessCode;
    if (status === "rejected") updatePayload.access_code = null;

    const { error } = await supabase.from("volunteers").update(updatePayload).eq("id", id);
    if (error) {
      toast({ title: "Failed to update", variant: "destructive" });
    } else {
      const msg = status === "approved" ? `Volunteer approved! Access code: ${accessCode}` : `Volunteer ${status}`;
      toast({ title: msg, description: status === "approved" ? "Share this code with the volunteer." : undefined });
      setVolunteers((prev) => prev.map((v) => (v.id === id ? { ...v, status, access_code: accessCode ?? v.access_code } : v)));
      if (selected?.id === id) setSelected({ ...selected, status, access_code: accessCode ?? selected.access_code });
      fetchStats();
    }
    setUpdating(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 bg-card/90 backdrop-blur-md border-b border-border/50 shadow-sm">
        <div className="container flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-primary" />
            <h1 className="font-bold text-foreground font-display">Admin dashboard</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-1" /> Sign out
          </Button>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full grid grid-cols-7 h-auto p-1 bg-card border border-border">
            <TabsTrigger value="overview" className="flex flex-col gap-0.5 py-2 text-[10px]"><LayoutDashboard className="w-4 h-4" />Overview</TabsTrigger>
            <TabsTrigger value="volunteers" className="flex flex-col gap-0.5 py-2 text-[10px]"><Users className="w-4 h-4" />Volunteers</TabsTrigger>
            <TabsTrigger value="donations" className="flex flex-col gap-0.5 py-2 text-[10px]"><Heart className="w-4 h-4" />Donations</TabsTrigger>
            <TabsTrigger value="arcade" className="flex flex-col gap-0.5 py-2 text-[10px]"><Gamepad2 className="w-4 h-4" />Arcade</TabsTrigger>
            <TabsTrigger value="concerns" className="flex flex-col gap-0.5 py-2 text-[10px]"><MessageSquare className="w-4 h-4" />Concerns</TabsTrigger>
            <TabsTrigger value="photos" className="flex flex-col gap-0.5 py-2 text-[10px]"><ImageIcon className="w-4 h-4" />Photos</TabsTrigger>
            <TabsTrigger value="tickets" className="flex flex-col gap-0.5 py-2 text-[10px]"><Ticket className="w-4 h-4" />Tickets</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4"><OverviewTab stats={stats} /></TabsContent>

          <TabsContent value="volunteers" className="mt-4 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Total", value: stats.volunteers.total, icon: Users },
                { label: "Pending", value: stats.volunteers.pending, icon: Clock },
                { label: "Approved", value: stats.volunteers.approved, icon: CheckCircle2 },
              ].map((s) => (
                <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
                  <s.icon className="w-5 h-5 text-primary mx-auto mb-1" />
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Loading volunteers…</p>
            ) : volunteers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No volunteer applications yet.</p>
            ) : (
              <div className="space-y-3">
                {volunteers.map((v) => (
                  <div key={v.id} onClick={() => setSelected(v)}
                       className="bg-card border border-border rounded-xl p-4 flex items-center justify-between gap-3 cursor-pointer hover:border-primary/40 transition-colors">
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
          </TabsContent>

          <TabsContent value="donations" className="mt-4"><DonationsTab /></TabsContent>
          <TabsContent value="arcade" className="mt-4"><ArcadeTab /></TabsContent>
          <TabsContent value="concerns" className="mt-4"><ConcernsTab /></TabsContent>
          <TabsContent value="photos" className="mt-4"><PhotosTab /></TabsContent>
          <TabsContent value="tickets" className="mt-4"><TicketsTab /></TabsContent>
        </Tabs>
      </main>

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

                {selected.access_code && (
                  <div className="bg-secondary/60 border border-primary/20 rounded-xl p-4 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Volunteer access code</p>
                    <p className="text-2xl font-bold font-mono tracking-widest text-primary">{selected.access_code}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Share this code with {selected.full_name.split(" ")[0]} via SMS or call.
                      They use it with their phone number to log into the community.
                    </p>
                  </div>
                )}

                <div>
                  <strong className="text-foreground">Applied:</strong>{" "}
                  <span className="text-muted-foreground">{new Date(selected.created_at).toLocaleString()}</span>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button onClick={() => updateStatus(selected.id, "approved")} disabled={updating || selected.status === "approved"} className="flex-1">
                    <CheckCircle2 className="w-4 h-4 mr-1" /> Approve
                  </Button>
                  <Button variant="destructive" onClick={() => updateStatus(selected.id, "rejected")} disabled={updating || selected.status === "rejected"} className="flex-1">
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
