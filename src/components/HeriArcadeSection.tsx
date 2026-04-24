import { useState } from "react";
import { motion } from "framer-motion";
import { Gamepad2, Copy, Ticket, Timer, MonitorPlay } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface GameOption {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
  duration: string;
  emoji: string;
  description: string;
}

const GAME_OPTIONS: GameOption[] = [
  { id: "quick",      name: "Quick Play",        price: 100, durationMinutes: 30,  duration: "30 minutes",   emoji: "⚡", description: "Jump in for a half-hour PS5 session. Your code activates the moment you scan it on the console." },
  { id: "standard",   name: "Standard Session",  price: 200, durationMinutes: 60,  duration: "1 hour",       emoji: "🎮", description: "A full hour of PS5 play. Standard rate at KSh 200/hr." },
  { id: "marathon",   name: "Marathon Mode",     price: 550, durationMinutes: 180, duration: "3 hours",      emoji: "🔥", description: "Three full hours on the PS5 — best value per hour." },
  { id: "tournament", name: "Tournament Entry",  price: 400, durationMinutes: 120, duration: "Up to 2 hours", emoji: "🏆", description: "Enter a HeriArcade PS5 tournament and compete for prizes." },
];

const ARCADE_BANNER =
  "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&q=70&auto=format&fit=crop";

const HeriArcadeSection = () => {
  const { toast } = useToast();
  const [selectedGame, setSelectedGame] = useState<GameOption | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [mpesaCode, setMpesaCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [entryCode, setEntryCode] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) { toast({ title: "Please fill in your name and phone number", variant: "destructive" }); return; }
    if (phone.trim().length < 10) { toast({ title: "Please enter a valid phone number", variant: "destructive" }); return; }
    if (!mpesaCode.trim()) { toast({ title: "Please enter your M-Pesa confirmation code", variant: "destructive" }); return; }
    if (!selectedGame) return;

    setLoading(true);
    const { data: codeData, error: codeError } = await supabase.rpc("generate_arcade_entry_code");
    if (codeError || !codeData) {
      toast({ title: "Could not generate entry code. Please try again.", variant: "destructive" });
      setLoading(false);
      return;
    }
    const generatedCode = codeData as string;

    const { error } = await supabase.from("arcade_sessions").insert({
      player_name: name.trim(),
      phone: phone.trim(),
      amount: selectedGame.price,
      mpesa_code: mpesaCode.trim().toUpperCase(),
      entry_code: generatedCode,
      game_type: selectedGame.id,
      duration_minutes: selectedGame.durationMinutes,
    });

    setLoading(false);
    if (error) {
      toast({
        title: error.message?.includes("Too many")
          ? "Too many submissions. Please try again later."
          : "Could not process payment. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setEntryCode(generatedCode);
    setShowSuccess(true);
    setSelectedGame(null);
    setName(""); setPhone(""); setMpesaCode("");
  };

  const copyCode = () => {
    navigator.clipboard.writeText(entryCode);
    toast({ title: "Entry code copied! 📋" });
  };

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-10"
      >
        {/* Hero banner with depth */}
        <div className="relative rounded-3xl overflow-hidden shadow-depth-lg mb-5 perspective-1000">
          <div className="tilt-card">
            <img src={ARCADE_BANNER} alt="HeriArcade gaming setup" loading="lazy" className="w-full h-44 sm:h-56 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/85 via-primary/55 to-transparent" />
            <div className="absolute inset-0 p-5 sm:p-7 flex flex-col justify-end">
              <div className="flex items-center gap-2 mb-1">
                <Gamepad2 className="w-6 h-6 text-primary-foreground" />
                <h2 className="text-2xl sm:text-3xl font-bold font-display text-primary-foreground">HeriArcade</h2>
              </div>
              <p className="text-primary-foreground/90 text-sm max-w-md">
                Pay to play. Get a code. Scan it at the console — your timer starts on first use.
              </p>
            </div>
          </div>
        </div>

        {/* How it works strip */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          {[
            { icon: Ticket, label: "Pick a session" },
            { icon: Timer, label: "Get your code" },
            { icon: MonitorPlay, label: "Scan to play" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="glass rounded-xl p-3 text-center shadow-depth-sm">
              <Icon className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-[11px] font-semibold text-foreground">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 perspective-1000">
          {GAME_OPTIONS.map((game) => (
            <Card
              key={game.id}
              className="cursor-pointer border-border/50 lift-on-hover shadow-depth-sm hover:border-primary/50 group"
              onClick={() => setSelectedGame(game)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <span className="text-3xl drop-shadow-sm">{game.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">
                      {game.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{game.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                        <Timer className="w-3 h-3" /> {game.duration}
                      </span>
                      <span className="font-bold text-primary text-sm">KSh {game.price}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-xs text-muted-foreground mt-4 text-center">
          Already have a code? Visit the{" "}
          <Link to="/arcade/console" className="text-primary font-semibold underline-offset-2 hover:underline">
            console redemption page
          </Link>{" "}
          to start your timer.
        </p>
      </motion.section>

      {/* Payment Dialog */}
      <Dialog open={!!selectedGame} onOpenChange={(open) => { if (!open) setSelectedGame(null); }}>
        <DialogContent className="max-w-md rounded-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl flex items-center gap-2">
              <span className="text-2xl">{selectedGame?.emoji}</span> {selectedGame?.name}
            </DialogTitle>
            <DialogDescription>
              Pay via M-Pesa to receive your arcade code. Your <strong>{selectedGame?.duration}</strong> timer only starts when you scan the code on a console.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="bg-secondary/60 border border-border rounded-xl p-3 shadow-depth-sm">
              <p className="text-sm font-semibold text-foreground">
                Amount: <span className="text-primary">KSh {selectedGame?.price}</span>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="arcadeName">Your name *</Label>
              <Input id="arcadeName" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="arcadePhone">Phone number *</Label>
              <Input id="arcadePhone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07XXXXXXXX" required />
            </div>

            <div className="bg-secondary/60 border border-border rounded-xl p-4 space-y-1 shadow-depth-sm">
              <p className="text-sm font-semibold text-foreground">Pay via M-Pesa</p>
              <p className="text-xs text-muted-foreground">
                Send <strong className="text-foreground">KSh {selectedGame?.price}</strong> to:
              </p>
              <p className="text-lg font-bold text-primary tracking-wide">0704498457</p>
              <p className="text-xs text-muted-foreground">Name: <strong>Herizon</strong></p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="arcadeMpesa">M-Pesa confirmation code *</Label>
              <Input
                id="arcadeMpesa"
                value={mpesaCode}
                onChange={(e) => setMpesaCode(e.target.value.toUpperCase())}
                placeholder="e.g. SLK3A7B2XC"
                maxLength={20}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Processing…" : "Pay & get entry code"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={(open) => { if (!open) setShowSuccess(false); }}>
        <DialogContent className="max-w-sm rounded-2xl text-center">
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shadow-depth">
              <Ticket className="w-8 h-8 text-primary" />
            </div>
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">You're in! 🎮</DialogTitle>
              <DialogDescription className="text-base mt-2">
                Your code is ready. Scan it at any HeriArcade console — the timer starts on first use and expires automatically.
              </DialogDescription>
            </DialogHeader>

            <div className="bg-secondary border-2 border-primary/30 rounded-2xl px-6 py-4 w-full shadow-depth">
              <p className="text-xs text-muted-foreground mb-1">Your Entry Code</p>
              <p className="text-3xl font-bold font-mono text-primary tracking-widest">{entryCode}</p>
            </div>

            <Button variant="outline" size="sm" onClick={copyCode} className="gap-2">
              <Copy className="w-4 h-4" /> Copy code
            </Button>

            <p className="text-xs text-muted-foreground max-w-xs">
              Show this code at the HeriArcade entrance. Keep it safe — it's your ticket to play! 🕹️
            </p>

            <Button variant="soft" onClick={() => setShowSuccess(false)} className="mt-2">Done</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HeriArcadeSection;
