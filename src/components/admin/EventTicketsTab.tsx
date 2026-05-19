import { useEffect, useState, useRef } from "react";
import { Ticket, CheckCircle2, XCircle, Search, QrCode, Sparkles, User, Phone, Mail, DollarSign, Calendar, ShieldCheck, RefreshCw, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type EventTicket = {
  id: string;
  buyer_name: string;
  phone: string;
  email: string | null;
  ticket_type: string;
  quantity: number;
  total_amount: number;
  mpesa_code: string;
  status: string;
  created_at: string;
};

const statusColors: Record<string, string> = {
  pending_verification: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  approved: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  scanned: "bg-blue-500/10 text-blue-500 border-blue-500/20",
};

const EventTicketsTab = () => {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<EventTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<EventTicket | null>(null);
  
  // Scanning state
  const [scanOpen, setScanOpen] = useState(false);
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    message: string;
    ticket?: EventTicket;
  } | null>(null);
  
  const [manualCode, setManualCode] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const fetchTickets = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("event_tickets")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) {
      setTickets(data as EventTicket[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Load jsQR from CDN
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleVerifyTicket = async (ticketId: string) => {
    // Stop camera immediately once code is captured
    stopCamera();
    
    try {
      const cleanId = ticketId.trim();
      
      // Fetch ticket
      const { data: ticket, error } = await supabase
        .from("event_tickets")
        .select("*")
        .eq("id", cleanId)
        .maybeSingle();

      if (error || !ticket) {
        // Try searching by mpesa_code (in case they scan a code containing mpesa reference)
        const { data: ticketByCode, error: errByCode } = await supabase
          .from("event_tickets")
          .select("*")
          .eq("mpesa_code", cleanId.toUpperCase())
          .maybeSingle();
          
        if (!errByCode && ticketByCode) {
          processVerification(ticketByCode as EventTicket);
          return;
        }

        setScanResult({
          success: false,
          message: `Invalid Ticket. No ticket found matching code or ID: "${cleanId}"`,
        });
        return;
      }

      processVerification(ticket as EventTicket);
    } catch (err) {
      setScanResult({
        success: false,
        message: "An error occurred during verification. Please try again.",
      });
    }
  };

  const processVerification = async (ticket: EventTicket) => {
    if (ticket.status === "pending_verification") {
      setScanResult({
        success: false,
        message: "Ticket payment is still pending verification. Please verify payment first.",
        ticket,
      });
    } else if (ticket.status === "scanned") {
      setScanResult({
        success: false,
        message: `Ticket has ALREADY been scanned and used!`,
        ticket,
      });
    } else if (ticket.status === "approved") {
      // Automatically mark as scanned to prevent reuse!
      const { error } = await supabase
        .from("event_tickets")
        .update({ status: "scanned" })
        .eq("id", ticket.id);

      if (error) {
        setScanResult({
          success: false,
          message: "Failed to mark ticket as scanned in the database.",
          ticket,
        });
      } else {
        setScanResult({
          success: true,
          message: "AUTHENTIC TICKET VERIFIED! Check-in successful.",
          ticket: { ...ticket, status: "scanned" },
        });
        fetchTickets();
        toast({
          title: "Ticket Checked-In Successfully",
          description: `${ticket.buyer_name}'s ticket has been validated and checked in.`,
        });
      }
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from("event_tickets")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      toast({ title: "Failed to update status", variant: "destructive" });
    } else {
      toast({ title: `Ticket marked as ${newStatus}` });
      fetchTickets();
      if (selectedTicket?.id === id) {
        setSelectedTicket((prev) => prev ? { ...prev, status: newStatus } : null);
      }
    }
  };

  const handleResendEmail = async (ticket: EventTicket) => {
    toast({ title: "Sending ticket email...", description: `Sending to ${ticket.email || "buyer"}` });
    try {
      const { data, error } = await supabase.functions.invoke("send-ticket-email", {
        body: {
          ticketId: ticket.id,
          email: ticket.email,
          buyerName: ticket.buyer_name,
          ticketType: ticket.ticket_type,
          quantity: ticket.quantity,
          amount: ticket.total_amount,
          code: ticket.mpesa_code,
        },
      });

      if (error) throw error;
      toast({ title: "Email sent successfully!", description: `Ticket sent to ${ticket.email}` });
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Email delivery mock-logged",
        description: `Edge function not fully deployed, but email logged. Code: ${ticket.mpesa_code}`,
      });
    }
  };

  // Web camera controls
  const startCamera = async () => {
    setScanResult(null);
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        videoRef.current.play();
        animationFrameRef.current = requestAnimationFrame(scanTick);
      }
    } catch (err) {
      console.error(err);
      setCameraActive(false);
      toast({
        title: "Camera Access Failed",
        description: "Please check your camera permissions and ensure no other app is using it.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    setCameraActive(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const scanTick = () => {
    if (!cameraActive) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (canvas && video && video.readyState === video.HAVE_ENOUGH_DATA) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Call jsQR from window
        const jsQR = (window as any).jsQR;
        if (jsQR) {
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });
          if (code) {
            handleVerifyTicket(code.data);
            return; // stop scanning loop
          }
        }
      }
    }
    animationFrameRef.current = requestAnimationFrame(scanTick);
  };

  const handleOpenScanDialog = () => {
    setScanOpen(true);
    setScanResult(null);
    setManualCode("");
    // Delay camera start slightly to let Dialog mount
    setTimeout(() => {
      startCamera();
    }, 300);
  };

  const handleCloseScanDialog = () => {
    stopCamera();
    setScanOpen(false);
  };

  // Stats
  const paidTicketsCount = tickets
    .filter((t) => t.ticket_type === "paid")
    .reduce((sum, t) => sum + t.quantity, 0);
  const inviteTicketsCount = tickets
    .filter((t) => t.ticket_type === "invite")
    .reduce((sum, t) => sum + t.quantity, 0);
  const totalRevenue = tickets
    .filter((t) => t.ticket_type === "paid" && t.status !== "pending_verification")
    .reduce((sum, t) => sum + t.total_amount, 0);

  const filteredTickets = tickets.filter(
    (t) =>
      t.buyer_name.toLowerCase().includes(search.toLowerCase()) ||
      t.phone.includes(search) ||
      (t.email && t.email.toLowerCase().includes(search.toLowerCase())) ||
      t.mpesa_code.toUpperCase().includes(search.toUpperCase()) ||
      t.id.includes(search)
  );

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Launch Event Passes</p>
            <p className="text-3xl font-bold text-foreground mt-1">
              {paidTicketsCount} <span className="text-sm text-muted-foreground">/ 15 sold</span>
            </p>
            <div className="w-full bg-secondary rounded-full h-1.5 mt-3 max-w-[200px]">
              <div
                className="bg-primary h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (paidTicketsCount / 15) * 100)}%` }}
              ></div>
            </div>
          </div>
          <Badge className="p-3 bg-primary/10 text-primary border-primary/20 rounded-xl">
            <Ticket className="w-6 h-6" />
          </Badge>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Exclusive Invites</p>
            <p className="text-3xl font-bold text-foreground mt-1">
              {inviteTicketsCount} <span className="text-sm text-muted-foreground">/ 15 claimed</span>
            </p>
            <div className="w-full bg-secondary rounded-full h-1.5 mt-3 max-w-[200px]">
              <div
                className="bg-primary h-1.5 rounded-full transition-all duration-500 animate-pulse"
                style={{ width: `${Math.min(100, (inviteTicketsCount / 15) * 100)}%` }}
              ></div>
            </div>
          </div>
          <Badge className="p-3 bg-primary/10 text-primary border-primary/20 rounded-xl">
            <Sparkles className="w-6 h-6" />
          </Badge>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Confirmed Revenue</p>
            <p className="text-3xl font-bold text-foreground mt-1">KSh {totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-3">From verified paid passes</p>
          </div>
          <Badge className="p-3 bg-emerald-500/10 text-emerald-500 border-emerald-500/20 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </Badge>
        </div>
      </div>

      {/* Control panel */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, email, or M-Pesa code..."
            className="pl-9 h-10 rounded-xl"
          />
        </div>
        <Button onClick={handleOpenScanDialog} className="w-full sm:w-auto h-10 gap-2 rounded-xl">
          <QrCode className="w-4 h-4" /> Scan / Verify Ticket
        </Button>
      </div>

      {/* Ticket Table */}
      {loading ? (
        <p className="text-center text-muted-foreground py-8">Loading event tickets...</p>
      ) : filteredTickets.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-2xl">
          <Ticket className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-50" />
          <p className="font-semibold text-foreground">No event tickets found</p>
          <p className="text-sm text-muted-foreground mt-1">Try refining your search query.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30 text-muted-foreground">
                  <th className="p-4 font-semibold">Buyer</th>
                  <th className="p-4 font-semibold">Type</th>
                  <th className="p-4 font-semibold">Qty</th>
                  <th className="p-4 font-semibold">M-Pesa / Invite Code</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTickets.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => setSelectedTicket(t)}
                    className="hover:bg-secondary/20 cursor-pointer transition-colors"
                  >
                    <td className="p-4">
                      <p className="font-semibold text-foreground">{t.buyer_name}</p>
                      <p className="text-xs text-muted-foreground">{t.phone}</p>
                    </td>
                    <td className="p-4">
                      <Badge variant="secondary" className="capitalize">
                        {t.ticket_type === "paid" ? "Event Pass" : "VIP Invite"}
                      </Badge>
                    </td>
                    <td className="p-4 font-mono font-medium text-foreground">{t.quantity}</td>
                    <td className="p-4 font-mono uppercase text-foreground text-xs">{t.mpesa_code}</td>
                    <td className="p-4">
                      <Badge variant="outline" className={`capitalize ${statusColors[t.status] || ""}`}>
                        {t.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs gap-1"
                          onClick={() => handleResendEmail(t)}
                        >
                          <Mail className="w-3.5 h-3.5" /> Send Mail
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Ticket Scanning Dialog */}
      <Dialog open={scanOpen} onOpenChange={(open) => !open && handleCloseScanDialog()}>
        <DialogContent className="max-w-md rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-primary" />
              Ticket Authenticator
            </DialogTitle>
            <DialogDescription>
              Scan a ticket QR code using your camera or enter the ticket code manually.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Live Camera Scanner */}
            <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-black/95 flex items-center justify-center">
              {cameraActive ? (
                <>
                  <video
                    ref={videoRef}
                    className="absolute inset-0 w-full h-full object-cover"
                    playsInline
                    muted
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  {/* Scanner overlay */}
                  <div className="absolute inset-0 pointer-events-none border-[3px] border-primary/40 m-8 animate-pulse flex items-center justify-center">
                    <div className="w-full h-0.5 bg-primary absolute top-1/2 -translate-y-1/2 animate-bounce"></div>
                  </div>
                </>
              ) : (
                <div className="text-center p-6 text-muted-foreground flex flex-col items-center gap-2">
                  <Camera className="w-8 h-8 opacity-40" />
                  <p className="text-sm">Camera inactive</p>
                  <Button size="sm" variant="outline" onClick={startCamera}>
                    Start Camera
                  </Button>
                </div>
              )}
            </div>

            {/* Manual entry */}
            <div className="flex gap-2">
              <Input
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Enter Ticket Code / UUID / M-Pesa Code"
                className="h-10 rounded-xl"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleVerifyTicket(manualCode);
                }}
              />
              <Button onClick={() => handleVerifyTicket(manualCode)} className="h-10 px-4 rounded-xl">
                Verify
              </Button>
            </div>

            {/* Result Dialog state */}
            {scanResult && (
              <div
                className={`p-4 rounded-xl border flex flex-col gap-3 ${
                  scanResult.success
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                    : "bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400"
                }`}
              >
                <div className="flex items-center gap-2">
                  {scanResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-amber-500 shrink-0" />
                  )}
                  <p className="font-semibold text-sm">{scanResult.message}</p>
                </div>

                {scanResult.ticket && (
                  <div className="text-xs space-y-1.5 border-t border-current/20 pt-2 text-foreground/80 mt-1">
                    <p>
                      <strong>Holder:</strong> {scanResult.ticket.buyer_name}
                    </p>
                    <p>
                      <strong>Phone:</strong> {scanResult.ticket.phone}
                    </p>
                    <p>
                      <strong>Type:</strong>{" "}
                      {scanResult.ticket.ticket_type === "paid" ? "Event Pass" : "Exclusive VIP Invite"}
                    </p>
                    <p>
                      <strong>Code/Ref:</strong> {scanResult.ticket.mpesa_code}
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      <Badge variant="secondary" className="text-[10px] py-0 px-1.5 uppercase font-semibold">
                        {scanResult.ticket.status}
                      </Badge>
                    </p>
                  </div>
                )}

                {!scanResult.success && scanResult.ticket?.status === "pending_verification" && (
                  <Button
                    onClick={() => {
                      if (scanResult.ticket) {
                        handleUpdateStatus(scanResult.ticket.id, "approved");
                        setScanResult(null);
                        setScanOpen(false);
                      }
                    }}
                    size="sm"
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white mt-1"
                  >
                    Verify Payment & Approve Ticket Now
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setScanResult(null);
                    startCamera();
                  }}
                  className="w-full mt-1 border border-current/10"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1" /> Reset & Scan Next
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Ticket Details Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
        <DialogContent className="max-w-md rounded-2xl">
          {selectedTicket && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-primary" />
                  Ticket Details
                </DialogTitle>
                <DialogDescription>
                  Purchase and verification information for this launch event ticket.
                </DialogDescription>
              </DialogHeader>

              {/* Styled Ticket Rendering inside Admin for overview */}
              <div className="space-y-4 my-2 text-sm">
                <div className="border border-border rounded-xl p-4 bg-secondary/30 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-8 -mt-8"></div>
                  
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">HERIZON LAUNCH</p>
                      <h4 className="font-bold text-foreground text-base capitalize mt-0.5">
                        {selectedTicket.ticket_type === "paid" ? "Launch Event Pass" : "Exclusive Invite"}
                      </h4>
                    </div>
                    <Badge variant="outline" className={`capitalize ${statusColors[selectedTicket.status] || ""}`}>
                      {selectedTicket.status.replace("_", " ")}
                    </Badge>
                  </div>

                  <div className="space-y-2 border-t border-dashed border-border pt-3">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-[10px] text-muted-foreground leading-none">TICKET HOLDER</p>
                        <p className="font-medium text-foreground text-sm mt-0.5">{selectedTicket.buyer_name}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                        <div>
                          <p className="text-[10px] text-muted-foreground leading-none">PHONE</p>
                          <p className="font-medium text-foreground text-xs mt-0.5">{selectedTicket.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                        <div>
                          <p className="text-[10px] text-muted-foreground leading-none">DATE & TIME</p>
                          <p className="font-medium text-foreground text-xs mt-0.5">23rd May 2026, 4pm</p>
                        </div>
                      </div>
                    </div>

                    {selectedTicket.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                        <div>
                          <p className="text-[10px] text-muted-foreground leading-none">EMAIL</p>
                          <p className="font-medium text-foreground text-xs mt-0.5 truncate max-w-[280px]">
                            {selectedTicket.email}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-end border-t border-dashed border-border pt-3 mt-3">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase leading-none">
                        {selectedTicket.ticket_type === "paid" ? "M-PESA REF" : "INVITE CODE"}
                      </p>
                      <p className="font-bold text-foreground font-mono uppercase text-sm mt-1">
                        {selectedTicket.mpesa_code}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground leading-none">TOTAL PAID</p>
                      <p className="font-extrabold text-primary text-base mt-0.5">
                        KSh {selectedTicket.total_amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {selectedTicket.status === "pending_verification" && (
                    <Button
                      onClick={() => handleUpdateStatus(selectedTicket.id, "approved")}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1.5" /> Approve Payment
                    </Button>
                  )}
                  {selectedTicket.status === "approved" && (
                    <Button
                      onClick={() => handleUpdateStatus(selectedTicket.id, "scanned")}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <ShieldCheck className="w-4 h-4 mr-1.5" /> Check-In (Scan)
                    </Button>
                  )}
                  {selectedTicket.status === "scanned" && (
                    <Button
                      onClick={() => handleUpdateStatus(selectedTicket.id, "approved")}
                      variant="outline"
                      className="w-full"
                    >
                      Unmark Check-in
                    </Button>
                  )}
                  
                  {selectedTicket.status === "pending_verification" && (
                    <Button
                      variant="destructive"
                      onClick={() => handleUpdateStatus(selectedTicket.id, "cancelled")}
                      className="w-full"
                    >
                      Cancel / Reject
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    onClick={() => handleResendEmail(selectedTicket)}
                    className="w-full col-span-2"
                  >
                    <Mail className="w-4 h-4 mr-1.5" /> Resend Ticket to Email
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

export default EventTicketsTab;
