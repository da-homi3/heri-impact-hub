import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Sparkles, Music, Shirt, Ticket, CheckCircle2, Crown, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface TicketTier {
  id: "vip" | "regular" | "all_access";
  name: string;
  price: number;
  perks: string[];
  icon: typeof Crown;
  accent: string;
}

const TIERS: TicketTier[] = [
  {
    id: "regular",
    name: "Regular",
    price: 1000,
    perks: ["Event entry", "Fashion show access", "Live entertainment"],
    icon: Star,
    accent: "border-border bg-card",
  },
  {
    id: "vip",
    name: "VIP",
    price: 3000,
    perks: ["Priority seating", "Welcome drink", "Meet & greet with the team", "Fashion show + entertainment"],
    icon: Crown,
    accent: "border-primary bg-secondary/40 ring-2 ring-primary/30",
  },
  {
    id: "all_access",
    name: "All Access",
    price: 5000,
    perks: ["Front-row seating", "Backstage pass", "Exclusive afterparty", "Herizon launch gift bag", "All VIP perks"],
    icon: Zap,
    accent: "border-border bg-card",
  },
];

const LaunchEventSection = () => {
  const { toast } = useToast();
  const [selected, setSelected] = useState<TicketTier | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [mpesaCode, setMpesaCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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
    if (!mpesaCode.trim()) {
      toast({ title: "Please enter your M-Pesa confirmation code", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("event_tickets").insert({
      buyer_name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || null,
      ticket_type: selected.id,
      quantity,
      total_amount: total,
      mpesa_code: mpesaCode.trim(),
    });
    setLoading(false);

    if (error) {
      toast({
        title: error.message?.includes("Too many")
          ? "Too many submissions. Please try again later."
          : "Could not complete purchase. Please try again.",
        variant: "destructive",
      });
      return;
    }
    setSelected(null);
    setSuccess(true);
    setName("");
    setPhone("");
    setEmail("");
    setMpesaCode("");
    setQuantity(1);
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
            <span className="text-xs font-semibold text-primary uppercase tracking-wide">Launch event</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-foreground mb-3">
            The Herizon Launch
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-5">
            Join us as we officially launch Herizon as a company. An evening of fashion, music and community.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border">
              <Calendar className="w-4 h-4 text-primary" />
              <strong className="text-foreground">23rd May 2026</strong>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border">
              <Shirt className="w-4 h-4 text-primary" />
              <span className="text-foreground">Fashion show</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border">
              <Music className="w-4 h-4 text-primary" />
              <span className="text-foreground">Entertainment</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-foreground">Company launch</span>
            </span>
          </div>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-3">
          {TIERS.map((tier, i) => {
            const Icon = tier.icon;
            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`relative rounded-2xl border p-5 flex flex-col ${tier.accent}`}
              >
                {tier.id === "vip" && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider">
                    Most popular
                  </span>
                )}
                <div className="flex items-center gap-2 mb-3">
                  <Icon className="w-5 h-5 text-primary" />
                  <h3 className="font-bold font-display text-lg text-foreground">{tier.name}</h3>
                </div>
                <p className="text-3xl font-bold text-foreground mb-1">
                  KSh {tier.price.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mb-4">per ticket</p>
                <ul className="space-y-2 mb-5 flex-1">
                  {tier.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2 text-sm text-foreground">
                      <CheckCircle2 className="w-4 h-4 text-trust-green shrink-0 mt-0.5" />
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => { setSelected(tier); setQuantity(1); }}
                  variant={tier.id === "vip" ? "default" : "outline"}
                  className="w-full"
                >
                  <Ticket className="w-4 h-4 mr-1.5" />
                  Buy {tier.name}
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Purchase dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <DialogContent className="max-w-md rounded-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl flex items-center gap-2">
              <Ticket className="w-5 h-5 text-primary" />
              {selected?.name} ticket
            </DialogTitle>
            <DialogDescription>
              Herizon Launch · 23rd May 2026. Pay via M-Pesa to secure your seat.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Quantity</Label>
              <div className="flex items-center gap-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</Button>
                <span className="font-bold text-lg w-8 text-center">{quantity}</span>
                <Button type="button" variant="outline" size="sm" onClick={() => setQuantity(Math.min(10, quantity + 1))}>+</Button>
              </div>
            </div>

            <div className="bg-secondary/60 border border-border rounded-xl p-3">
              <p className="text-sm font-semibold text-foreground">
                Total: <span className="text-primary">KSh {total.toLocaleString()}</span>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ticketName">Full name *</Label>
              <Input id="ticketName" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ticketPhone">Phone number *</Label>
              <Input id="ticketPhone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07XXXXXXXX" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ticketEmail">Email (optional)</Label>
              <Input id="ticketEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>

            <div className="bg-secondary/60 border border-border rounded-xl p-4 space-y-1">
              <p className="text-sm font-semibold text-foreground">Pay via M-Pesa</p>
              <p className="text-xs text-muted-foreground">
                Send <strong className="text-foreground">KSh {total.toLocaleString()}</strong> to:
              </p>
              <p className="text-lg font-bold text-primary tracking-wide">0704498457</p>
              <p className="text-xs text-muted-foreground">Name: <strong>Herizon</strong></p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ticketRef">M-Pesa confirmation code *</Label>
              <Input
                id="ticketRef"
                value={mpesaCode}
                onChange={(e) => setMpesaCode(e.target.value.toUpperCase())}
                placeholder="e.g. SLK3A7B2XC"
                maxLength={20}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Securing your ticket…" : `Confirm purchase · KSh ${total.toLocaleString()}`}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Success dialog */}
      <Dialog open={success} onOpenChange={(open) => { if (!open) setSuccess(false); }}>
        <DialogContent className="max-w-sm rounded-2xl text-center">
          <div className="flex flex-col items-center gap-4 py-4">
            <CheckCircle2 className="w-16 h-16 text-trust-green" />
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">You're in! 🎉</DialogTitle>
              <DialogDescription className="text-base mt-2">
                Your ticket request has been received. We'll verify your payment and send your ticket details to your phone shortly. See you on 23rd May!
              </DialogDescription>
            </DialogHeader>
            <Button variant="soft" onClick={() => setSuccess(false)} className="mt-2">Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default LaunchEventSection;
