import { useState } from "react";
import { motion } from "framer-motion";
import { Gamepad2, CheckCircle2, Copy, Ticket } from "lucide-react";
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
  duration: string;
  emoji: string;
  description: string;
}

const GAME_OPTIONS: GameOption[] = [
  {
    id: "quick",
    name: "Quick Play",
    price: 50,
    duration: "30 minutes",
    emoji: "⚡",
    description: "Jump in for a quick gaming session. Perfect for a fast break.",
  },
  {
    id: "standard",
    name: "Standard Session",
    price: 100,
    duration: "1 hour",
    emoji: "🎮",
    description: "A full hour of gaming across any of our available systems.",
  },
  {
    id: "marathon",
    name: "Marathon Mode",
    price: 200,
    duration: "3 hours",
    emoji: "🔥",
    description: "Extended play for serious gamers. Best value per hour!",
  },
  {
    id: "tournament",
    name: "Tournament Entry",
    price: 150,
    duration: "Event-based",
    emoji: "🏆",
    description: "Enter a HeriArcade tournament and compete for prizes.",
  },
];

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
    if (!name.trim() || !phone.trim()) {
      toast({ title: "Please fill in your name and phone number", variant: "destructive" });
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
    if (!selectedGame) return;

    setLoading(true);

    // Generate entry code
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
    setName("");
    setPhone("");
    setMpesaCode("");
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
        <div className="flex items-center gap-2 mb-3">
          <Gamepad2 className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold font-display text-foreground">HeriArcade</h2>
        </div>
        <p className="text-muted-foreground text-sm mb-5">
          Pay to play on our gaming systems! Choose a session, pay via M-Pesa, and receive your entry code instantly.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {GAME_OPTIONS.map((game) => (
            <Card
              key={game.id}
              className="cursor-pointer border-border/50 hover:border-primary/50 hover:shadow-md transition-all group"
              onClick={() => setSelectedGame(game)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{game.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">
                      {game.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{game.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">{game.duration}</span>
                      <span className="font-bold text-primary text-sm">KSh {game.price}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.section>

      {/* Payment Dialog */}
      <Dialog open={!!selectedGame} onOpenChange={(open) => { if (!open) setSelectedGame(null); }}>
        <DialogContent className="max-w-md rounded-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl flex items-center gap-2">
              <span className="text-2xl">{selectedGame?.emoji}</span> {selectedGame?.name}
            </DialogTitle>
            <DialogDescription>
              Pay via M-Pesa to get your arcade entry code. Duration: {selectedGame?.duration}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="bg-secondary/60 border border-border rounded-xl p-3">
              <p className="text-sm font-semibold text-foreground">
                Amount: <span className="text-primary">KSh {selectedGame?.price}</span>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="arcadeName">Your name *</Label>
              <Input
                id="arcadeName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="arcadePhone">Phone number *</Label>
              <Input
                id="arcadePhone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="07XXXXXXXX"
                required
              />
            </div>

            <div className="bg-secondary/60 border border-border rounded-xl p-4 space-y-1">
              <p className="text-sm font-semibold text-foreground">Pay via M-Pesa</p>
              <p className="text-xs text-muted-foreground">
                Send <strong className="text-foreground">KSh {selectedGame?.price}</strong> to:
              </p>
              <p className="text-lg font-bold text-primary tracking-wide">0704498457</p>
              <p className="text-xs text-muted-foreground">
                Name: <strong>Herizon</strong>
              </p>
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

      {/* Success Dialog with Entry Code */}
      <Dialog open={showSuccess} onOpenChange={(open) => { if (!open) setShowSuccess(false); }}>
        <DialogContent className="max-w-sm rounded-2xl text-center">
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Ticket className="w-8 h-8 text-primary" />
            </div>
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">You're in! 🎮</DialogTitle>
              <DialogDescription className="text-base mt-2">
                Your payment has been recorded. Use this entry code at the HeriArcade to start playing:
              </DialogDescription>
            </DialogHeader>

            <div className="bg-secondary border-2 border-primary/30 rounded-2xl px-6 py-4 w-full">
              <p className="text-xs text-muted-foreground mb-1">Your Entry Code</p>
              <p className="text-3xl font-bold font-mono text-primary tracking-widest">{entryCode}</p>
            </div>

            <Button variant="outline" size="sm" onClick={copyCode} className="gap-2">
              <Copy className="w-4 h-4" /> Copy code
            </Button>

            <p className="text-xs text-muted-foreground max-w-xs">
              Show this code at the HeriArcade entrance. Keep it safe — it's your ticket to play! 🕹️
            </p>

            <Button variant="soft" onClick={() => setShowSuccess(false)} className="mt-2">
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HeriArcadeSection;
