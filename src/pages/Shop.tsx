import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingBag, CheckCircle2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface MerchItem {
  id: string;
  name: string;
  price: number;
  description: string;
  emoji: string;
  sizes?: string[];
}

const MERCH_ITEMS: MerchItem[] = [
  {
    id: "tshirt",
    name: "Herizon T-Shirt",
    price: 1500,
    description: "Premium cotton tee with the Herizon logo. Comfortable and stylish.",
    emoji: "👕",
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
  {
    id: "hoodie",
    name: "Herizon Hoodie",
    price: 3500,
    description: "Warm, cosy hoodie with embroidered Herizon branding. Perfect for community events.",
    emoji: "🧥",
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
  {
    id: "cap",
    name: "Herizon Cap",
    price: 800,
    description: "Adjustable cap with the Herizon logo. One size fits all.",
    emoji: "🧢",
  },
  {
    id: "wristband",
    name: "Herizon Wristband",
    price: 300,
    description: "Silicone wristband in Herizon colours. Show your support everywhere you go.",
    emoji: "💪",
  },
  {
    id: "tote",
    name: "Herizon Tote Bag",
    price: 1200,
    description: "Durable canvas tote bag with the Herizon design. Eco-friendly and reusable.",
    emoji: "👜",
  },
];

const Shop = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedItem, setSelectedItem] = useState<MerchItem | null>(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentRef, setPaymentRef] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      toast({ title: "Please fill in your name and phone number", variant: "destructive" });
      return;
    }
    if (phone.trim().length < 10) {
      toast({ title: "Please enter a valid phone number", variant: "destructive" });
      return;
    }
    if (selectedItem?.sizes && !selectedSize) {
      toast({ title: "Please select a size", variant: "destructive" });
      return;
    }
    if (!paymentRef.trim()) {
      toast({ title: "Please enter your M-Pesa confirmation code", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("donations").insert({
      donor_name: name.trim() || null,
      phone: phone.trim(),
      amount: totalPrice,
      mpesa_code: paymentRef.trim(),
      source: "shop",
    });
    setLoading(false);
    if (error) {
      toast({ title: error.message?.includes("Too many") ? "Too many submissions. Please try again later." : "Could not place order. Please try again.", variant: "destructive" });
      return;
    }
    setSelectedItem(null);
    setShowSuccess(true);
    setName("");
    setPhone("");
    setPaymentRef("");
    setSelectedSize("");
    setQuantity(1);
  };

  const totalPrice = selectedItem ? selectedItem.price * quantity : 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card/90 backdrop-blur-md border-b border-border/50 shadow-sm">
        <div className="container flex items-center h-14 px-4 gap-3">
          <button onClick={() => navigate("/")} className="p-2 -ml-2 text-foreground hover:text-primary transition-colors" aria-label="Go back">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <ShoppingBag className="w-5 h-5 text-primary" />
          <h1 className="font-bold text-foreground text-lg font-display">Herizon Merch</h1>
        </div>
      </header>

      <main className="container max-w-lg mx-auto px-4 py-8 pb-24">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <p className="text-muted-foreground text-sm leading-relaxed mb-8">
            Wear your support proudly. All proceeds go towards funding Herizon's community programmes.
          </p>
          <div className="bg-muted rounded-2xl p-10 border border-border/50">
            <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold font-display text-foreground mb-2">Coming soon!</h2>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              We're preparing our official Herizon merchandise collection. Stay tuned for T-shirts, hoodies, caps, and more — all in support of our mission.
            </p>
          </div>
        </motion.div>
      </main>

      {/* Order dialog */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => { if (!open) setSelectedItem(null); }}>
        <DialogContent className="max-w-md rounded-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl flex items-center gap-2">
              <span className="text-2xl">{selectedItem?.emoji}</span> {selectedItem?.name}
            </DialogTitle>
            <DialogDescription>Fill in your details and pay via M-Pesa to place your order.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleOrder} className="space-y-4 mt-2">
            {selectedItem?.sizes && (
              <div className="space-y-2">
                <Label>Size *</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedItem.sizes.map((size) => (
                    <button
                      type="button"
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-xl border text-sm font-semibold transition-all ${
                        selectedSize === size
                          ? "border-primary bg-secondary text-primary"
                          : "border-border bg-card text-foreground hover:border-primary/40"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

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
                Total: <span className="text-primary">KSh {totalPrice.toLocaleString()}</span>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shopName">Your name *</Label>
              <Input id="shopName" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your full name" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shopPhone">Phone number *</Label>
              <Input id="shopPhone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07XXXXXXXX" required />
            </div>

            <div className="bg-secondary/60 border border-border rounded-xl p-4 space-y-1">
              <p className="text-sm font-semibold text-foreground">Pay via M-Pesa</p>
              <p className="text-xs text-muted-foreground">Send <strong className="text-foreground">KSh {totalPrice.toLocaleString()}</strong> to:</p>
              <p className="text-lg font-bold text-primary tracking-wide">0704498457</p>
              <p className="text-xs text-muted-foreground">Name: <strong>Herizon</strong></p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shopRef">M-Pesa confirmation code *</Label>
              <Input
                id="shopRef"
                value={paymentRef}
                onChange={(e) => setPaymentRef(e.target.value.toUpperCase())}
                placeholder="e.g. SLK3A7B2XC"
                maxLength={20}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Placing order…" : "Place order"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Success dialog */}
      <Dialog open={showSuccess} onOpenChange={(open) => { if (!open) setShowSuccess(false); }}>
        <DialogContent className="max-w-sm rounded-2xl text-center">
          <div className="flex flex-col items-center gap-4 py-4">
            <CheckCircle2 className="w-16 h-16 text-trust-green" />
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">Order received! 🎉</DialogTitle>
              <DialogDescription className="text-base mt-2">
                Thank you for your purchase! Our team will verify your payment and contact you on your phone number to arrange delivery. Asante sana!
              </DialogDescription>
            </DialogHeader>
            <Button variant="soft" onClick={() => setShowSuccess(false)} className="mt-2">Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Shop;
