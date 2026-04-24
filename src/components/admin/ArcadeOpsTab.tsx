import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MonitorSmartphone, ShieldAlert, Wallet, Users2, Activity, CheckCircle2, Plus, Trash2, AlertTriangle, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type Station = {
  id: string; station_code: string; name: string; location: string;
  console_id: string | null; camera_id: string | null; status: string;
  ip_address: string | null; notes: string | null;
  last_heartbeat_at: string | null; installed_at: string | null;
};
type TamperEvent = {
  id: string; station_id: string | null; station_code: string | null;
  event_type: string; severity: string; payload: Record<string, unknown>;
  snapshot_url: string | null; resolved: boolean; resolved_at: string | null;
  notes: string | null; created_at: string;
};
type BudgetItem = {
  id: string; phase: string; category: string; label: string;
  per_unit_cost: number; units: number; total_cost: number;
  notes: string | null; sort_order: number;
};
type WorkforceRole = {
  id: string; phase: string; role_name: string; task_description: string | null;
  hours: number; hourly_rate: number; total_cost: number;
  payment_type: string; payment_schedule: string | null; sort_order: number;
};
type OperatingCost = {
  id: string; label: string; monthly_cost: number; category: string;
  notes: string | null; active: boolean; sort_order: number;
};

const PHASE_LABEL: Record<string, string> = {
  pilot: "Pilot (3 stations)", full_rollout: "Full rollout (10 stations)", monthly: "Monthly ongoing",
};
const SEVERITY_BADGE: Record<string, string> = {
  low: "bg-muted text-muted-foreground border-border",
  medium: "bg-warm-gold/20 text-foreground border-warm-gold/40",
  high: "bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/40",
  critical: "bg-destructive/20 text-destructive border-destructive/40",
};
const ksh = (n: number) => `KSh ${Number(n || 0).toLocaleString()}`;

const isOnline = (ts: string | null) => {
  if (!ts) return false;
  return Date.now() - new Date(ts).getTime() < 5 * 60 * 1000; // 5 min
};

const ArcadeOpsTab = () => {
  const { toast } = useToast();
  const [stations, setStations] = useState<Station[]>([]);
  const [events, setEvents] = useState<TamperEvent[]>([]);
  const [budget, setBudget] = useState<BudgetItem[]>([]);
  const [workforce, setWorkforce] = useState<WorkforceRole[]>([]);
  const [opCosts, setOpCosts] = useState<OperatingCost[]>([]);
  const [loading, setLoading] = useState(true);
  const [stationDialog, setStationDialog] = useState(false);
  const [stationForm, setStationForm] = useState({ station_code: "", name: "", location: "", console_id: "", camera_id: "", notes: "" });

  const fetchAll = async () => {
    setLoading(true);
    const [s, e, b, w, o] = await Promise.all([
      supabase.from("arcade_stations").select("*").order("station_code"),
      supabase.from("arcade_tamper_events").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("arcade_budget_items").select("*").order("phase").order("sort_order"),
      supabase.from("arcade_workforce_roles").select("*").order("phase").order("sort_order"),
      supabase.from("arcade_operating_costs").select("*").order("sort_order"),
    ]);
    if (s.data) setStations(s.data as Station[]);
    if (e.data) setEvents(e.data as TamperEvent[]);
    if (b.data) setBudget(b.data as BudgetItem[]);
    if (w.data) setWorkforce(w.data as WorkforceRole[]);
    if (o.data) setOpCosts(o.data as OperatingCost[]);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  // Realtime tamper alerts
  useEffect(() => {
    const ch = supabase
      .channel("arcade-ops")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "arcade_tamper_events" }, (p) => {
        const evt = p.new as TamperEvent;
        setEvents((prev) => [evt, ...prev].slice(0, 50));
        if (evt.severity === "high" || evt.severity === "critical") {
          toast({ title: `🚨 Tamper alert: ${evt.station_code}`, description: `${evt.event_type} (${evt.severity})`, variant: "destructive" });
        }
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "arcade_stations" }, () => {
        supabase.from("arcade_stations").select("*").order("station_code").then(({ data }) => {
          if (data) setStations(data as Station[]);
        });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [toast]);

  const addStation = async () => {
    if (!stationForm.station_code.trim() || !stationForm.name.trim() || !stationForm.location.trim()) {
      toast({ title: "Code, name and location required", variant: "destructive" }); return;
    }
    const { error } = await supabase.from("arcade_stations").insert({
      station_code: stationForm.station_code.trim(),
      name: stationForm.name.trim(),
      location: stationForm.location.trim(),
      console_id: stationForm.console_id.trim() || null,
      camera_id: stationForm.camera_id.trim() || null,
      notes: stationForm.notes.trim() || null,
      status: "offline",
      installed_at: new Date().toISOString(),
    });
    if (error) toast({ title: "Failed", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Station added" });
      setStationDialog(false);
      setStationForm({ station_code: "", name: "", location: "", console_id: "", camera_id: "", notes: "" });
      fetchAll();
    }
  };

  const setStationStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("arcade_stations").update({ status }).eq("id", id);
    if (error) toast({ title: "Failed", variant: "destructive" });
    else fetchAll();
  };

  const removeStation = async (id: string) => {
    if (!confirm("Remove this station?")) return;
    const { error } = await supabase.from("arcade_stations").delete().eq("id", id);
    if (error) toast({ title: "Failed", variant: "destructive" });
    else { toast({ title: "Removed" }); fetchAll(); }
  };

  const resolveEvent = async (id: string) => {
    const { error } = await supabase.from("arcade_tamper_events").update({
      resolved: true, resolved_at: new Date().toISOString(),
    }).eq("id", id);
    if (error) toast({ title: "Failed", variant: "destructive" });
    else fetchAll();
  };

  const updateBudget = async (id: string, field: "per_unit_cost" | "units", value: number) => {
    const item = budget.find((b) => b.id === id); if (!item) return;
    const per = field === "per_unit_cost" ? value : item.per_unit_cost;
    const units = field === "units" ? value : item.units;
    const total = per * units;
    const { error } = await supabase.from("arcade_budget_items").update({ [field]: value, total_cost: total }).eq("id", id);
    if (error) toast({ title: "Failed", variant: "destructive" });
    else fetchAll();
  };

  const updateWorkforce = async (id: string, field: "hours" | "hourly_rate" | "total_cost", value: number) => {
    const item = workforce.find((w) => w.id === id); if (!item) return;
    const updates: Record<string, number> = { [field]: value };
    if (item.payment_type === "hourly") {
      const hours = field === "hours" ? value : item.hours;
      const rate = field === "hourly_rate" ? value : item.hourly_rate;
      updates.total_cost = hours * rate;
    }
    const { error } = await supabase.from("arcade_workforce_roles").update(updates).eq("id", id);
    if (error) toast({ title: "Failed", variant: "destructive" });
    else fetchAll();
  };

  const updateOpCost = async (id: string, value: number) => {
    const { error } = await supabase.from("arcade_operating_costs").update({ monthly_cost: value }).eq("id", id);
    if (error) toast({ title: "Failed", variant: "destructive" });
    else fetchAll();
  };

  // Aggregates
  const stationsOnline = stations.filter((s) => isOnline(s.last_heartbeat_at)).length;
  const unresolvedEvents = events.filter((e) => !e.resolved).length;
  const criticalEvents = events.filter((e) => !e.resolved && (e.severity === "high" || e.severity === "critical")).length;
  const budgetByPhase = (phase: string) => budget.filter((b) => b.phase === phase);
  const workforceByPhase = (phase: string) => workforce.filter((w) => w.phase === phase);
  const phaseTotal = (phase: string) =>
    budgetByPhase(phase).reduce((s, b) => s + Number(b.total_cost || 0), 0)
    + workforceByPhase(phase).reduce((s, w) => s + Number(w.total_cost || 0), 0);
  const monthlyOpsTotal = opCosts.filter((o) => o.active).reduce((s, o) => s + Number(o.monthly_cost || 0), 0);
  const monthlyWorkforceTotal = workforceByPhase("monthly").reduce((s, w) => s + Number(w.total_cost || 0), 0);

  if (loading) return <p className="text-center text-muted-foreground py-8">Loading arcade ops…</p>;

  return (
    <div className="space-y-5">
      {/* Top stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-xl p-3 text-center shadow-depth-sm">
          <Wifi className="w-4 h-4 text-trust-green mx-auto mb-1" />
          <p className="text-xl font-bold text-foreground">{stationsOnline}/{stations.length}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Stations online</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center shadow-depth-sm">
          <ShieldAlert className={`w-4 h-4 mx-auto mb-1 ${criticalEvents > 0 ? "text-destructive animate-pulse" : "text-warm-gold"}`} />
          <p className="text-xl font-bold text-foreground">{unresolvedEvents}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Open alerts</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center shadow-depth-sm">
          <Wallet className="w-4 h-4 text-primary mx-auto mb-1" />
          <p className="text-xl font-bold text-foreground">{ksh(monthlyOpsTotal + monthlyWorkforceTotal)}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Monthly run cost</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center shadow-depth-sm">
          <Activity className="w-4 h-4 text-warm-gold mx-auto mb-1" />
          <p className="text-xl font-bold text-foreground">{ksh(phaseTotal("pilot") + phaseTotal("full_rollout"))}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Total CapEx</p>
        </div>
      </div>

      <Tabs defaultValue="stations" className="w-full">
        <TabsList className="w-full grid grid-cols-5 h-auto p-1 bg-card border border-border">
          <TabsTrigger value="stations" className="flex flex-col gap-0.5 py-2 text-[10px]"><MonitorSmartphone className="w-4 h-4" />Stations</TabsTrigger>
          <TabsTrigger value="alerts" className="flex flex-col gap-0.5 py-2 text-[10px]"><ShieldAlert className="w-4 h-4" />Alerts</TabsTrigger>
          <TabsTrigger value="budget" className="flex flex-col gap-0.5 py-2 text-[10px]"><Wallet className="w-4 h-4" />Budget</TabsTrigger>
          <TabsTrigger value="workforce" className="flex flex-col gap-0.5 py-2 text-[10px]"><Users2 className="w-4 h-4" />Workforce</TabsTrigger>
          <TabsTrigger value="ops" className="flex flex-col gap-0.5 py-2 text-[10px]"><RefreshCw className="w-4 h-4" />Monthly</TabsTrigger>
        </TabsList>

        {/* STATIONS */}
        <TabsContent value="stations" className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">PS5 kiosks registered with the system. Auto-updates from Pi heartbeat.</p>
            <Button size="sm" onClick={() => setStationDialog(true)}><Plus className="w-4 h-4 mr-1" />Add</Button>
          </div>
          {stations.length === 0 ? (
            <p className="text-center text-muted-foreground py-6 text-sm">No stations yet. Add one or have a kiosk send a heartbeat.</p>
          ) : (
            <div className="space-y-2">
              {stations.map((st) => {
                const online = isOnline(st.last_heartbeat_at);
                return (
                  <motion.div key={st.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-card border border-border rounded-xl p-3 shadow-depth-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          {online ? <Wifi className="w-4 h-4 text-trust-green" /> : <WifiOff className="w-4 h-4 text-muted-foreground" />}
                          <p className="font-semibold text-foreground truncate">{st.name}</p>
                          <Badge variant="outline" className="text-[10px] font-mono">{st.station_code}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{st.location}</p>
                        <p className="text-[11px] text-muted-foreground mt-1">
                          Console: <span className="font-mono">{st.console_id || "—"}</span>
                          {" · "}Camera: <span className="font-mono">{st.camera_id || "—"}</span>
                          {st.ip_address && <> · IP: <span className="font-mono">{st.ip_address}</span></>}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Last ping: {st.last_heartbeat_at ? new Date(st.last_heartbeat_at).toLocaleString() : "never"}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <Select value={st.status} onValueChange={(v) => setStationStatus(st.id, v)}>
                          <SelectTrigger className="h-7 w-32 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                            <SelectItem value="offline">Offline</SelectItem>
                            <SelectItem value="retired">Retired</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button size="sm" variant="ghost" onClick={() => removeStation(st.id)} className="h-7 px-2 text-destructive">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ALERTS */}
        <TabsContent value="alerts" className="mt-4 space-y-2">
          <p className="text-sm text-muted-foreground">Tamper events from reed switches, accelerometers, and cameras. Live updates.</p>
          {events.length === 0 ? (
            <p className="text-center text-muted-foreground py-6 text-sm">No tamper events recorded. ✅</p>
          ) : (
            events.map((ev) => (
              <div key={ev.id} className={`border rounded-xl p-3 shadow-depth-sm ${ev.resolved ? "bg-card border-border opacity-60" : "bg-card border-border"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <AlertTriangle className={`w-4 h-4 shrink-0 ${ev.severity === "critical" ? "text-destructive" : ev.severity === "high" ? "text-orange-500" : "text-warm-gold"}`} />
                      <Badge className={`text-[10px] ${SEVERITY_BADGE[ev.severity]}`}>{ev.severity}</Badge>
                      <span className="font-semibold text-foreground text-sm">{ev.event_type.replace(/_/g, " ")}</span>
                      <Badge variant="outline" className="text-[10px] font-mono">{ev.station_code || "unknown"}</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {new Date(ev.created_at).toLocaleString()}
                      {ev.resolved && ev.resolved_at && <> · resolved {new Date(ev.resolved_at).toLocaleString()}</>}
                    </p>
                    {Object.keys(ev.payload || {}).length > 0 && (
                      <pre className="text-[10px] text-muted-foreground bg-secondary/50 rounded p-1.5 mt-1.5 overflow-x-auto">{JSON.stringify(ev.payload, null, 0)}</pre>
                    )}
                  </div>
                  {!ev.resolved && (
                    <Button size="sm" variant="outline" onClick={() => resolveEvent(ev.id)} className="shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Resolve
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </TabsContent>

        {/* BUDGET */}
        <TabsContent value="budget" className="mt-4 space-y-5">
          {(["pilot", "full_rollout"] as const).map((phase) => (
            <div key={phase}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-foreground text-sm">{PHASE_LABEL[phase]}</h4>
                <span className="text-sm font-bold text-primary">{ksh(phaseTotal(phase))}</span>
              </div>
              <div className="border border-border rounded-xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-secondary/50">
                    <tr>
                      <th className="text-left p-2">Item</th>
                      <th className="text-right p-2 w-20">Per unit</th>
                      <th className="text-right p-2 w-14">Qty</th>
                      <th className="text-right p-2 w-24">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {budgetByPhase(phase).map((b) => (
                      <tr key={b.id} className="border-t border-border">
                        <td className="p-2">
                          <p className="font-medium text-foreground">{b.label}</p>
                          <p className="text-[10px] text-muted-foreground">{b.category.replace(/_/g, " ")}</p>
                        </td>
                        <td className="p-1">
                          <Input type="number" defaultValue={b.per_unit_cost} className="h-7 text-right text-xs"
                            onBlur={(e) => { const v = Number(e.target.value); if (v !== b.per_unit_cost) updateBudget(b.id, "per_unit_cost", v); }} />
                        </td>
                        <td className="p-1">
                          <Input type="number" defaultValue={b.units} className="h-7 text-right text-xs"
                            onBlur={(e) => { const v = Number(e.target.value); if (v !== b.units) updateBudget(b.id, "units", v); }} />
                        </td>
                        <td className="p-2 text-right font-semibold text-foreground">{ksh(b.total_cost)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </TabsContent>

        {/* WORKFORCE */}
        <TabsContent value="workforce" className="mt-4 space-y-5">
          {(["pilot", "full_rollout", "monthly"] as const).map((phase) => (
            <div key={phase}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-foreground text-sm">{PHASE_LABEL[phase]}</h4>
                <span className="text-sm font-bold text-primary">
                  {ksh(workforceByPhase(phase).reduce((s, w) => s + Number(w.total_cost || 0), 0))}
                </span>
              </div>
              <div className="space-y-2">
                {workforceByPhase(phase).map((w) => (
                  <div key={w.id} className="bg-card border border-border rounded-xl p-3 shadow-depth-sm">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-foreground text-sm">{w.role_name}</p>
                        {w.task_description && <p className="text-[11px] text-muted-foreground">{w.task_description}</p>}
                      </div>
                      <Badge variant="outline" className="text-[10px] shrink-0">{w.payment_type}</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <Label className="text-[10px]">Hours</Label>
                        <Input type="number" step="0.25" defaultValue={w.hours} className="h-7 text-xs"
                          disabled={w.payment_type !== "hourly"}
                          onBlur={(e) => { const v = Number(e.target.value); if (v !== w.hours) updateWorkforce(w.id, "hours", v); }} />
                      </div>
                      <div>
                        <Label className="text-[10px]">Rate (KES/hr)</Label>
                        <Input type="number" defaultValue={w.hourly_rate} className="h-7 text-xs"
                          disabled={w.payment_type !== "hourly"}
                          onBlur={(e) => { const v = Number(e.target.value); if (v !== w.hourly_rate) updateWorkforce(w.id, "hourly_rate", v); }} />
                      </div>
                      <div>
                        <Label className="text-[10px]">Total (KES)</Label>
                        <Input type="number" defaultValue={w.total_cost} className="h-7 text-xs font-bold"
                          onBlur={(e) => { const v = Number(e.target.value); if (v !== w.total_cost) updateWorkforce(w.id, "total_cost", v); }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </TabsContent>

        {/* MONTHLY OPERATING */}
        <TabsContent value="ops" className="mt-4 space-y-3">
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 text-center">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Total monthly running cost</p>
            <p className="text-2xl font-bold text-primary">{ksh(monthlyOpsTotal + monthlyWorkforceTotal)}</p>
            <p className="text-[10px] text-muted-foreground">{ksh(monthlyOpsTotal)} infrastructure + {ksh(monthlyWorkforceTotal)} workforce</p>
          </div>
          <div className="space-y-2">
            {opCosts.map((o) => (
              <div key={o.id} className="bg-card border border-border rounded-xl p-3 flex items-center justify-between gap-3 shadow-depth-sm">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground text-sm">{o.label}</p>
                  <p className="text-[11px] text-muted-foreground capitalize">{o.category}</p>
                </div>
                <Input type="number" defaultValue={o.monthly_cost} className="h-8 w-28 text-right text-sm"
                  onBlur={(e) => { const v = Number(e.target.value); if (v !== o.monthly_cost) updateOpCost(o.id, v); }} />
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add station dialog */}
      <Dialog open={stationDialog} onOpenChange={setStationDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add a kiosk station</DialogTitle>
            <DialogDescription>Register a new PS5 station. Heartbeats from the Pi will keep it live.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {[
              { k: "station_code", label: "Station code *", ph: "e.g. HA-NRB-01" },
              { k: "name", label: "Name *", ph: "e.g. Westlands kiosk 1" },
              { k: "location", label: "Location *", ph: "Venue / address" },
              { k: "console_id", label: "PS5 console ID", ph: "Optional" },
              { k: "camera_id", label: "Tamper camera ID", ph: "ESP32-CAM serial / label" },
              { k: "notes", label: "Notes", ph: "Any extra info" },
            ].map((f) => (
              <div key={f.k} className="space-y-1">
                <Label htmlFor={f.k}>{f.label}</Label>
                <Input id={f.k} placeholder={f.ph}
                  value={stationForm[f.k as keyof typeof stationForm]}
                  onChange={(e) => setStationForm({ ...stationForm, [f.k]: e.target.value })} />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStationDialog(false)}>Cancel</Button>
            <Button onClick={addStation}>Add station</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ArcadeOpsTab;
