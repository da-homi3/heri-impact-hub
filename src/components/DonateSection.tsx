import { useState } from "react";
import { motion } from "framer-motion";
import { Package, Smartphone, MapPin, Calendar, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import MpesaDonationFlow from "@/components/MpesaDonationFlow";

const conditionOptions = ["New", "Gently Used", "Used – Still Good", "Slightly Torn", "Torn"];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const DonateSection = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [mpesaOpen, setMpesaOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [anonymous, setAnonymous] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [condition, setCondition] = useState("Gently Used");
  const [itemDescription, setItemDescription] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !location || !condition) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    setFormOpen(false);
    setSuccessOpen(true);
    // Reset form
    setName("");
    setPhone("");
    setLocation("");
    setCondition("Gently Used");
    setItemDescription("");
    setAnonymous(false);
  };

  const donateOptions = [
    {
      icon: Package,
      title: "Donate Items",
      description: "Clothes, shoes, toys, food & essential supplies. Fill in a quick form and we'll arrange collection.",
      action: "Donate Now",
      color: "text-primary",
      bg: "bg-secondary",
      onClick: () => setFormOpen(true),
    },
    {
      icon: Smartphone,
      title: "Donate Money",
      description: "Quick M-Pesa Paybill or Till donation. One-tap giving with instant digital receipts and full transparency.",
      action: "Send via M-Pesa",
      color: "text-warm-gold",
      bg: "bg-warm-gold/10",
      onClick: () => setMpesaOpen(true),
    },
    {
      icon: Calendar,
      title: "Schedule Pick-up",
      description: "Book a convenient time and our team will collect your physical donations right from your doorstep.",
      action: "Schedule Now",
      color: "text-primary",
      bg: "bg-pink-soft",
      onClick: () => setFormOpen(true),
    },
  ];

  return (
    <section id="donate" className="py-16 px-4 bg-background">
      <div className="container max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-foreground mb-3">
            Ways to Give
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Choose how you'd like to make a difference today. Every contribution, big or small, transforms lives.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {donateOptions.map((opt) => (
            <motion.div key={opt.title} variants={item}>
              <Card className="h-full border-border/60 hover:shadow-lg transition-shadow duration-300 rounded-2xl">
                <CardHeader className="pb-3">
                  <div className={`w-12 h-12 rounded-xl ${opt.bg} flex items-center justify-center mb-2`}>
                    <opt.icon className={`w-6 h-6 ${opt.color}`} />
                  </div>
                  <CardTitle className="text-xl font-display">{opt.title}</CardTitle>
                  <CardDescription className="text-sm">{opt.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="soft" size="sm" className="w-full" onClick={opt.onClick}>
                    {opt.action}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Donation Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Donate Items</DialogTitle>
            <DialogDescription>Fill in the details below and we'll arrange collection.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            {/* Anonymous toggle */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="anonymous"
                checked={anonymous}
                onCheckedChange={(v) => setAnonymous(v === true)}
              />
              <Label htmlFor="anonymous" className="text-sm cursor-pointer">Donate anonymously</Label>
            </div>

            {!anonymous && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Jane Wanjiku"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={100}
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="phone">Mobile Number *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="e.g. 0712 345 678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                maxLength={15}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="location">Your Location *</Label>
              <Input
                id="location"
                placeholder="e.g. Westlands, Nairobi"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                maxLength={200}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="items">What are you donating?</Label>
              <Input
                id="items"
                placeholder="e.g. Children's clothes, shoes"
                value={itemDescription}
                onChange={(e) => setItemDescription(e.target.value)}
                maxLength={300}
              />
            </div>

            <div className="space-y-2">
              <Label>Condition of Items *</Label>
              <RadioGroup value={condition} onValueChange={setCondition} className="flex flex-wrap gap-3">
                {conditionOptions.map((c) => (
                  <div key={c} className="flex items-center gap-1.5">
                    <RadioGroupItem value={c} id={`cond-${c}`} />
                    <Label htmlFor={`cond-${c}`} className="text-sm cursor-pointer">{c}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <Button type="submit" className="w-full mt-2">Submit Donation</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="max-w-sm rounded-2xl text-center">
          <div className="flex flex-col items-center gap-4 py-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <CheckCircle className="w-16 h-16 text-trust-green" />
            </motion.div>
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">Thank You! 🎉</DialogTitle>
              <DialogDescription className="text-base mt-2">
                Your donation request has been received. You will be notified on your mobile number once our team is ready to collect. Asante sana!
              </DialogDescription>
            </DialogHeader>
            <Button variant="soft" onClick={() => setSuccessOpen(false)} className="mt-2">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default DonateSection;
