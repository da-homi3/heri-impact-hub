import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, HandHeart, CheckCircle2, Shield, MapPin, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const SKILLS_OPTIONS = [
  "Teaching & Mentoring",
  "First Aid & Health",
  "Logistics & Driving",
  "Social Work",
  "Photography & Media",
  "Cooking & Nutrition",
  "IT & Tech Support",
  "Event Planning",
];

const INTERESTS_OPTIONS = [
  "Child welfare",
  "Education support",
  "Food & nutrition drives",
  "Clothing distribution",
  "Community outreach",
  "Environmental cleanup",
  "Health & hygiene campaigns",
  "Fundraising events",
];

const AVAILABILITY_OPTIONS = [
  "Weekdays only",
  "Weekends only",
  "Both weekdays and weekends",
  "Flexible / On call",
];

const PROGRAMME_RULES = [
  "Attend all scheduled volunteer sessions unless communicated otherwise in advance.",
  "Maintain respectful, professional conduct with beneficiaries, staff and fellow volunteers at all times.",
  "Follow all safety and operational guidelines during field trips and community visits.",
  "Keep all beneficiary and organisational information strictly confidential.",
  "Wear official Herizon volunteer gear during all official activities.",
  "Report any incidents, concerns or safeguarding issues to the team lead immediately.",
  "The annual membership fee of KSh 500 is non-refundable and covers volunteer trips, field and operational expenses, and equipment maintenance.",
];

const Volunteer = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [availability, setAvailability] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [paymentRef, setPaymentRef] = useState("");
  const [rulesAccepted, setRulesAccepted] = useState(false);

  const toggleArrayItem = (arr: string[], item: string, setter: (v: string[]) => void) => {
    setter(arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !phone.trim() || !location.trim() || !availability) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    if (phone.trim().length < 10) {
      toast({ title: "Please enter a valid phone number", variant: "destructive" });
      return;
    }
    if (!rulesAccepted) {
      toast({ title: "Please accept the programme rules to continue", variant: "destructive" });
      return;
    }
    if (!paymentRef.trim()) {
      toast({ title: "Please enter your M-Pesa confirmation code", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("volunteers").insert({
      full_name: fullName.trim(),
      phone: phone.trim(),
      email: email.trim() || null,
      location: location.trim(),
      availability,
      skills,
      interests,
      payment_reference: paymentRef.trim(),
      payment_status: "submitted",
      programme_rules_accepted: true,
    });

    setLoading(false);
    if (error) {
      toast({ title: "Something went wrong. Please try again.", variant: "destructive" });
      return;
    }
    setShowSuccess(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/90 backdrop-blur-md border-b border-border/50 shadow-sm">
        <div className="container flex items-center h-14 px-4 gap-3">
          <button onClick={() => navigate("/")} className="p-2 -ml-2 text-foreground hover:text-primary transition-colors" aria-label="Go back">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <HandHeart className="w-5 h-5 text-primary" />
          <h1 className="font-bold text-foreground text-lg font-display">Become a Volunteer</h1>
        </div>
      </header>

      <main className="container max-w-lg mx-auto px-4 py-8 pb-24">
        {/* Intro */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
          <p className="text-muted-foreground text-sm leading-relaxed">
            Join our community of change-makers. Fill in your details below, pay the annual membership fee, and start making a difference today.
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal details */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold font-display text-foreground">Personal details</h2>

            <div className="space-y-2">
              <Label htmlFor="fullName">Full name *</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Enter your full name" maxLength={100} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone number *</Label>
              <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07XXXXXXXX" maxLength={15} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email (optional)</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" maxLength={255} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="location" className="pl-9" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Nairobi, Mombasa" maxLength={100} required />
              </div>
            </div>
          </section>

          {/* Availability */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold font-display text-foreground flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" /> Availability *
            </h2>
            <div className="grid grid-cols-1 gap-2">
              {AVAILABILITY_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt}
                  onClick={() => setAvailability(opt)}
                  className={`text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                    availability === opt
                      ? "border-primary bg-secondary text-primary"
                      : "border-border bg-card text-foreground hover:border-primary/40"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </section>

          {/* Skills */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold font-display text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" /> Skills (select all that apply)
            </h2>
            <div className="flex flex-wrap gap-2">
              {SKILLS_OPTIONS.map((skill) => (
                <button
                  type="button"
                  key={skill}
                  onClick={() => toggleArrayItem(skills, skill, setSkills)}
                  className={`px-3 py-2 rounded-full border text-xs font-semibold transition-all ${
                    skills.includes(skill)
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </section>

          {/* Interests */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold font-display text-foreground">Areas of interest</h2>
            <div className="flex flex-wrap gap-2">
              {INTERESTS_OPTIONS.map((interest) => (
                <button
                  type="button"
                  key={interest}
                  onClick={() => toggleArrayItem(interests, interest, setInterests)}
                  className={`px-3 py-2 rounded-full border text-xs font-semibold transition-all ${
                    interests.includes(interest)
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-accent/40"
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </section>

          {/* Programme rules */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold font-display text-foreground">Programme rules</h2>
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowRules(true)} className="text-primary text-xs">
                View all rules
              </Button>
            </div>
            <div className="bg-secondary/60 border border-border rounded-xl p-4 space-y-2">
              {PROGRAMME_RULES.slice(0, 3).map((rule, i) => (
                <p key={i} className="text-xs text-muted-foreground flex gap-2">
                  <Shield className="w-3.5 h-3.5 mt-0.5 text-primary shrink-0" />
                  {rule}
                </p>
              ))}
              <p className="text-xs text-primary font-semibold cursor-pointer" onClick={() => setShowRules(true)}>
                + {PROGRAMME_RULES.length - 3} more rules…
              </p>
            </div>
            <div className="flex items-start gap-3 pt-1">
              <Checkbox
                id="rules"
                checked={rulesAccepted}
                onCheckedChange={(v) => setRulesAccepted(v === true)}
              />
              <Label htmlFor="rules" className="text-sm leading-snug text-foreground">
                I have read and accept the volunteer programme rules and responsibilities *
              </Label>
            </div>
          </section>

          {/* Payment section */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold font-display text-foreground">Membership fee — KSh 500</h2>
            <div className="bg-secondary/60 border border-border rounded-xl p-4 space-y-3">
              <p className="text-sm text-foreground font-semibold">What the fee covers:</p>
              <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside">
                <li>Official volunteer trips and transport</li>
                <li>Field and operational expenses</li>
                <li>Maintenance and servicing of Herizon's equipment</li>
              </ul>
              <div className="border-t border-border pt-3 space-y-1">
                <p className="text-sm font-semibold text-foreground">Pay via M-Pesa</p>
                <p className="text-xs text-muted-foreground">Send <strong className="text-foreground">KSh 500</strong> to:</p>
                <p className="text-lg font-bold text-primary tracking-wide">0704498457</p>
                <p className="text-xs text-muted-foreground">Name: <strong>Herizon</strong></p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentRef">M-Pesa confirmation code *</Label>
              <Input
                id="paymentRef"
                value={paymentRef}
                onChange={(e) => setPaymentRef(e.target.value.toUpperCase())}
                placeholder="e.g. SLK3A7B2XC"
                maxLength={20}
                required
              />
              <p className="text-xs text-muted-foreground">Enter the M-Pesa confirmation code from your SMS after payment.</p>
            </div>
          </section>

          {/* Privacy */}
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            Your personal information is kept private and will only be used by the Herizon team to coordinate volunteer activities.
          </p>

          <Button type="submit" size="lg" className="w-full text-base font-bold" disabled={loading}>
            {loading ? "Submitting…" : "Submit application"}
          </Button>
        </form>
      </main>

      {/* Rules dialog */}
      <Dialog open={showRules} onOpenChange={setShowRules}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">Volunteer programme rules</DialogTitle>
            <DialogDescription>Please read all rules before signing up.</DialogDescription>
          </DialogHeader>
          <ol className="space-y-3 list-decimal list-inside">
            {PROGRAMME_RULES.map((rule, i) => (
              <li key={i} className="text-sm text-foreground leading-relaxed">{rule}</li>
            ))}
          </ol>
        </DialogContent>
      </Dialog>

      {/* Success dialog */}
      <Dialog open={showSuccess} onOpenChange={(open) => { if (!open) navigate("/"); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-trust-green" /> Application submitted!
            </DialogTitle>
            <DialogDescription>
              Thank you for choosing to volunteer with Herizon, {fullName.split(" ")[0]}!
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>Your application and payment reference have been received. Our team will review your details and get back to you within <strong className="text-foreground">48 hours</strong>.</p>
            <p>We'll contact you on <strong className="text-foreground">{phone}</strong> with next steps.</p>
          </div>
          <Button onClick={() => navigate("/")} className="w-full mt-2">Back to home</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Volunteer;
