import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Sparkles, Shirt, Ticket, CheckCircle2, Crown, Star, Mic, Camera, Printer, Mail, User, Phone, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface TicketTier {
  id: "paid" | "invite";
  name: string;
  price: number;
  perks: string[];
  icon: typeof Star;
  accent: string;
  maxQty: number;
}

const TIERS: TicketTier[] = [
  {
    id: "paid",
    name: "Launch Event Pass",
    price: 3000,
    perks: [
      "Limited to 15 tickets total",
      "Full access to creative show & galleries",
      "Delicious premium snacks & punch",
      "Interactive creative networking",
      "Sent instantly to your email with verification QR",
    ],
    icon: Star,
    accent: "border-primary bg-secondary/40 ring-2 ring-primary/30",
    maxQty: 15,
  },
  {
    id: "invite",
    name: "Exclusive Invite",
    price: 0,
    perks: [
      "Limited to 15 VIP invites",
      "VIP reserved seating & special gift hamper",
      "Backstage creative preview",
      "Premium catering & custom beverages",
      "Requires private invitation code to claim",
    ],
    icon: Crown,
    accent: "border-border bg-card",
    maxQty: 15,
  },
];

const VALID_INVITE_CODES = ["HERIZON_VIP", "LAUNCH_15", "EXCL_INVITE", "HERIZON_GUEST"];

const LaunchEventSection = () => {
  const { toast } = useToast();
  const [selected, setSelected] = useState<TicketTier | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [mpesaCode, setMpesaCode] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdTicket, setCreatedTicket] = useState<any | null>(null);

  // Sold tickets counts
  const [soldCounts, setSoldCounts] = useState<{ paid: number; invite: number }>({ paid: 0, invite: 0 });

  const fetchSoldCounts = async () => {
    const { data, error } = await supabase
      .from("event_tickets")
      .select("ticket_type, quantity, status");
    if (!error && data) {
      let paid = 0;
      let invite = 0;
      data.forEach((ticket) => {
        if (ticket.status !== "cancelled" && ticket.status !== "declined") {
          if (ticket.ticket_type === "paid") {
            paid += ticket.quantity || 1;
          } else if (ticket.ticket_type === "invite") {
            invite += ticket.quantity || 1;
          }
        }
      });
      setSoldCounts({ paid, invite });
    }
  };

  useEffect(() => {
    fetchSoldCounts();
  }, []);

  const total = selected ? selected.price * quantity : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;

    if (!name.trim() || !phone.trim()) {
      toast({ title: "Please enter your name and phone number", variant: "destructive" });
      return;
    }
    if (phone.trim().length < 10) {
      toast({ title: "Please enter a valid phone number", variant: "destructive" });
      return;
    }

    // Check capacity limits
    const currentSold = selected.id === "paid" ? soldCounts.paid : soldCounts.invite;
    if (currentSold + quantity > selected.maxQty) {
      toast({
        title: "Ticket Limit Reached",
        description: `Only ${selected.maxQty - currentSold} ticket(s) are left for this tier.`,
        variant: "destructive",
      });
      return;
    }

    // Handle invite code check
    if (selected.id === "invite") {
      const cleanCode = inviteCode.trim().toUpperCase();
      if (!VALID_INVITE_CODES.includes(cleanCode)) {
        toast({
          title: "Invalid Invite Code",
          description: "Please enter a valid verification code sent to you by the organizers.",
          variant: "destructive",
        });
        return;
      }
    } else {
      // Paid tier: M-Pesa is required
      if (!mpesaCode.trim()) {
        toast({ title: "Please enter your M-Pesa confirmation code", variant: "destructive" });
        return;
      }
    }

    setLoading(true);

    const mpesaOrInviteCode =
      selected.id === "paid"
        ? mpesaCode.trim().toUpperCase()
        : `INVITE-${inviteCode.trim().toUpperCase()}`;

    const { data, error } = await supabase
      .from("event_tickets")
      .insert({
        buyer_name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || null,
        ticket_type: selected.id,
        quantity,
        total_amount: total,
        mpesa_code: mpesaOrInviteCode,
        status: selected.id === "paid" ? "pending_verification" : "approved", // invites approved instantly
      })
      .select();

    setLoading(false);

    if (error) {
      toast({
        title: "Registration Failed",
        description: error.message || "Could not complete registration. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (data && data.length > 0) {
      const newTicket = data[0];
      setCreatedTicket(newTicket);

      // Invoke Email Sending function
      try {
        await supabase.functions.invoke("send-ticket-email", {
          body: {
            ticketId: newTicket.id,
            email: newTicket.email,
            buyerName: newTicket.buyer_name,
            ticketType: newTicket.ticket_type,
            quantity: newTicket.quantity,
            amount: newTicket.total_amount,
            code: newTicket.mpesa_code,
          },
        });
      } catch (emailErr) {
        console.warn("Email function warning:", emailErr);
      }

      setSelected(null);
      setSuccess(true);
      setName("");
      setPhone("");
      setEmail("");
      setMpesaCode("");
      setInviteCode("");
      setQuantity(1);
      fetchSoldCounts();
    }
  };

  const handlePrintTicket = () => {
    if (!createdTicket) return;
    const qrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(createdTicket.id)}`;
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(`
        <html>
          <head>
            <title>Herizon Launch Ticket</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                background-color: #0b0f19;
                color: #f3f4f6;
              }
              .ticket {
                border: 2px solid #b89855;
                border-radius: 20px;
                padding: 30px;
                background: linear-gradient(135deg, #111827 0%, #1f2937 100%);
                width: 380px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.6);
                text-align: center;
              }
              .header {
                font-size: 20px;
                font-weight: 800;
                color: #b89855;
                letter-spacing: 3px;
                margin: 0 0 5px 0;
              }
              .sub {
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 2px;
                color: #9ca3af;
                margin: 0 0 15px 0;
              }
              .divider {
                border-top: 1px dashed #b89855;
                margin: 15px 0;
              }
              .qr-box {
                background: #ffffff;
                padding: 10px;
                border-radius: 12px;
                display: inline-block;
                margin: 15px 0;
              }
              .qr-box img {
                display: block;
              }
              .code-label {
                font-size: 10px;
                color: #9ca3af;
                margin-bottom: 2px;
              }
              .code-value {
                font-family: monospace;
                font-size: 14px;
                font-weight: 700;
                color: #f3f4f6;
                letter-spacing: 1px;
              }
              .meta {
                text-align: left;
                font-size: 12px;
                color: #d1d5db;
                margin-top: 15px;
              }
              .meta-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 6px;
              }
              .meta-label {
                color: #6b7280;
              }
              .meta-value {
                font-weight: 600;
              }
            </style>
          </head>
          <body>
            <div class="ticket">
              <div class="header">HERIZON LAUNCH</div>
              <div class="sub">${createdTicket.ticket_type === "paid" ? "Launch Event Pass" : "Exclusive VIP Invite"}</div>
              <div class="divider"></div>
              <div class="qr-box">
                <img src="${qrDataUrl}" alt="QR" width="180" height="180" />
              </div>
              <div class="code-label">TICKET VERIFICATION ID</div>
              <div class="code-value">${createdTicket.id}</div>
              <div class="divider"></div>
              <div class="meta">
                <div class="meta-row">
                  <span class="meta-label">Holder:</span>
                  <span class="meta-value">${createdTicket.buyer_name}</span>
                </div>
                <div class="meta-row">
                  <span class="meta-label">Phone:</span>
                  <span class="meta-value">${createdTicket.phone}</span>
                </div>
                <div class="meta-row">
                  <span class="meta-label">Date & Time:</span>
                  <span class="meta-value">23rd May 2026, 4pm</span>
                </div>
                <div class="meta-row">
                  <span class="meta-label">Venue:</span>
                  <span class="meta-value">Herizon Creative Space</span>
                </div>
                <div class="meta-row">
                  <span class="meta-label">Reference:</span>
                  <span class="meta-value" style="text-transform: uppercase;">${createdTicket.mpesa_code}</span>
                </div>
              </div>
            </div>
            <script>
              window.onload = function() {
                window.print();
                setTimeout(() => window.close(), 500);
              }
            </script>
          </body>
        </html>
      `);
      win.document.close();
    }
  };

  return (
    <section id="launch-event" className="py-12 sm:py-16 bg-gradient-to-b from-secondary/30 via-background to-background">
      <div className="container max-w-5xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wide">Launch Event</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-foreground mb-3">
            The Herizon Launch
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-5">
            Join us as we officially launch Herizon. Experience a premium evening highlighting creative galleries, fashion showcases, and creative communities.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border">
              <Calendar className="w-4 h-4 text-primary" />
              <strong className="text-foreground">23rd May 2026, 4pm - 8pm</strong>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border">
              <Shirt className="w-4 h-4 text-primary" />
              <span className="text-foreground">Fashion Show</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-foreground">Creatives Showcase</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border">
              <Mic className="w-4 h-4 text-primary" />
              <span className="text-foreground">Inspirations</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border">
              <Camera className="w-4 h-4 text-primary" />
              <span className="text-foreground">Visual Capture</span>
            </span>
          </div>
        </motion.div>

        {/* Tickets grid */}
        <div className="grid gap-6 sm:grid-cols-2 max-w-3xl mx-auto">
          {TIERS.map((tier, i) => {
            const Icon = tier.icon;
            const sold = tier.id === "paid" ? soldCounts.paid : soldCounts.invite;
            const remaining = Math.max(0, tier.maxQty - sold);
            const isSoldOut = remaining === 0;

            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`relative rounded-2xl border p-6 flex flex-col justify-between ${tier.accent} transition-transform hover:scale-[1.01]`}
              >
                {tier.id === "paid" && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider">
                    General Admission
                  </span>
                )}
                {tier.id === "invite" && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-amber-600 text-white text-[10px] font-bold uppercase tracking-wider">
                    Invite Only
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5 text-primary" />
                      <h3 className="font-bold font-display text-lg text-foreground">{tier.name}</h3>
                    </div>
                    <Badge variant={isSoldOut ? "destructive" : "secondary"} className="text-xs">
                      {isSoldOut ? "Sold Out" : `${remaining} left`}
                    </Badge>
                  </div>

                  <p className="text-3xl font-extrabold text-foreground mb-1">
                    {tier.price > 0 ? `KSh ${tier.price.toLocaleString()}` : "Free"}
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">per event ticket</p>
                  
                  <ul className="space-y-2 mb-6">
                    {tier.perks.map((perk) => (
                      <li key={perk} className="flex items-start gap-2 text-sm text-foreground/90">
                        <CheckCircle2 className="w-4 h-4 text-trust-green shrink-0 mt-0.5" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  onClick={() => { setSelected(tier); setQuantity(1); }}
                  variant={tier.id === "paid" ? "default" : "outline"}
                  className="w-full h-11 rounded-xl font-medium"
                  disabled={isSoldOut}
                >
                  <Ticket className="w-4 h-4 mr-1.5" />
                  {isSoldOut ? "Fully Booked" : tier.id === "paid" ? "Buy Event Pass" : "Claim Invitation"}
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Ticket Purchase / Claim Dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <DialogContent className="max-w-md rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl flex items-center gap-2">
              <Ticket className="w-5 h-5 text-primary" />
              {selected?.name}
            </DialogTitle>
            <DialogDescription>
              {selected?.id === "paid"
                ? "Enter your payment details to purchase your launch event ticket."
                : "Enter your private invitation code to claim your VIP seat."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Quantity</Label>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="h-8 w-8 rounded-lg"
                >
                  −
                </Button>
                <span className="font-bold text-lg w-8 text-center">{quantity}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const limit = selected ? selected.maxQty - (selected.id === "paid" ? soldCounts.paid : soldCounts.invite) : 1;
                    setQuantity(Math.min(Math.min(limit, 5), quantity + 1));
                  }}
                  className="h-8 w-8 rounded-lg"
                >
                  +
                </Button>
              </div>
            </div>

            {selected?.id === "paid" && (
              <div className="bg-secondary/60 border border-border rounded-xl p-3 flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">Total Payment:</span>
                <span className="text-lg font-bold text-primary">KSh {total.toLocaleString()}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="ticketName">Full name *</Label>
              <Input id="ticketName" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your full name" required className="rounded-xl" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ticketPhone">Phone number *</Label>
              <Input id="ticketPhone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07XXXXXXXX" required className="rounded-xl" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ticketEmail">Email address (to receive ticket PDF) *</Label>
              <Input id="ticketEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="rounded-xl" />
            </div>

            {selected?.id === "paid" ? (
              <>
                <div className="bg-secondary/60 border border-border rounded-xl p-4 space-y-1 text-sm">
                  <p className="font-semibold text-foreground flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-primary" />
                    How to Pay via M-Pesa:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground text-xs pl-1">
                    <li>Send KSh <strong>{total.toLocaleString()}</strong> to phone: <strong className="text-primary font-mono">0704498457</strong></li>
                    <li>Registered Name: <strong>Herizon</strong></li>
                    <li>Enter the M-Pesa transaction reference code below.</li>
                  </ol>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ticketRef">M-Pesa transaction reference code *</Label>
                  <Input
                    id="ticketRef"
                    value={mpesaCode}
                    onChange={(e) => setMpesaCode(e.target.value.toUpperCase())}
                    placeholder="e.g. QTX8N3B6DK"
                    maxLength={20}
                    required
                    className="rounded-xl font-mono uppercase"
                  />
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="inviteCode">Private Invitation Code *</Label>
                <Input
                  id="inviteCode"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="Enter private VIP invite code"
                  required
                  className="rounded-xl font-mono uppercase"
                />
              </div>
            )}

            <Button type="submit" className="w-full h-11 rounded-xl mt-4 font-semibold" disabled={loading}>
              {loading ? "Registering seat..." : selected?.id === "paid" ? `Confirm Purchase · KSh ${total.toLocaleString()}` : "Claim VIP Invitation"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Holographic Virtual Ticket Success Dialog */}
      <Dialog open={success} onOpenChange={(open) => { if (!open) setSuccess(false); }}>
        <DialogContent className="max-w-md rounded-3xl p-6 bg-slate-950 border border-amber-500/30 text-center overflow-hidden">
          {createdTicket && (
            <div className="flex flex-col items-center gap-4 py-2">
              <div className="p-3 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
              
              <DialogHeader>
                <DialogTitle className="font-display text-2xl text-foreground">Ticket Booked Successfully!</DialogTitle>
                <DialogDescription className="text-slate-400">
                  {createdTicket.ticket_type === "paid" 
                    ? "Your payment is being verified. Your virtual ticket has been sent to your email." 
                    : "VIP Invitation verified! Your virtual ticket details are below."}
                </DialogDescription>
              </DialogHeader>

              {/* Styled Virtual Ticket */}
              <div id="virtual-event-ticket" className="w-full border border-amber-500/20 rounded-2xl p-5 bg-gradient-to-b from-slate-900 to-slate-950 text-left relative overflow-hidden my-2 shadow-2xl">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full -mr-8 -mt-8"></div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[9px] text-amber-500 font-bold uppercase tracking-widest leading-none">HERIZON LAUNCH</span>
                    <h4 className="font-bold text-foreground text-base mt-0.5">
                      {createdTicket.ticket_type === "paid" ? "Launch Event Pass" : "Exclusive VIP Invite"}
                    </h4>
                  </div>
                  <Badge variant="outline" className="border-amber-500/30 text-amber-500 text-[10px] uppercase tracking-wide">
                    {createdTicket.status.replace("_", " ")}
                  </Badge>
                </div>

                {/* Dashed Separator */}
                <div className="border-t border-dashed border-slate-800 my-3"></div>

                {/* QR Code Container */}
                <div className="flex justify-center py-2 bg-white rounded-xl max-w-[150px] mx-auto mb-4 border border-slate-800">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${encodeURIComponent(createdTicket.id)}`}
                    alt="Ticket QR Code"
                    width="130"
                    height="130"
                    className="block"
                  />
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase block">Ticket Holder</span>
                      <span className="font-medium text-slate-200">{createdTicket.buyer_name}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase block">Phone</span>
                        <span className="font-medium text-slate-200">{createdTicket.phone}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase block">Date</span>
                        <span className="font-medium text-slate-200">23rd May 2026</span>
                      </div>
                    </div>
                  </div>

                  {createdTicket.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase block">Email Address</span>
                        <span className="font-medium text-slate-200 truncate max-w-[280px] block">{createdTicket.email}</span>
                      </div>
                    </div>
                  )}

                  <div className="border-t border-dashed border-slate-800 pt-2.5 mt-2 flex justify-between items-center text-[10px]">
                    <div>
                      <span className="text-slate-500 uppercase block">Verification ID</span>
                      <span className="font-mono text-slate-300">{createdTicket.id.slice(0, 13)}...</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 uppercase block">
                        {createdTicket.ticket_type === "paid" ? "M-Pesa Reference" : "Invite Code"}
                      </span>
                      <span className="font-mono font-bold text-amber-500 uppercase">{createdTicket.mpesa_code}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="w-full flex gap-3 mt-2">
                <Button onClick={handlePrintTicket} variant="outline" className="flex-1 rounded-xl h-10 border-slate-800 hover:bg-slate-900 gap-2">
                  <Printer className="w-4 h-4" /> Print / Save PDF
                </Button>
                <Button onClick={() => setSuccess(false)} className="flex-1 rounded-xl h-10">
                  Done
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default LaunchEventSection;
