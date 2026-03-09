import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Smartphone,
  CheckCircle,
  Heart,
  Copy,
  Check,
  Shield,
  Clock,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const SUGGESTED_AMOUNTS = [100, 250, 500, 1000, 2500, 5000];

const POCHI_STEPS = [
  {
    number: 1,
    title: "Open M-Pesa",
    description: "Go to your Safaricom SIM toolkit or M-Pesa app on your phone.",
  },
  {
    number: 2,
    title: "Select 'Send Money'",
    description: "From the M-Pesa menu, choose the 'Send Money' option.",
  },
  {
    number: 3,
    title: "Enter the number",
    description: "Type in the Pochi la Biashara number shown below.",
    highlight: true,
  },
  {
    number: 4,
    title: "Enter the amount",
    description: "Key in the amount you'd like to donate (e.g. KSh 500).",
  },
  {
    number: 5,
    title: "Enter your M-Pesa PIN",
    description: "Confirm the transaction with your 4-digit M-Pesa PIN.",
  },
  {
    number: 6,
    title: "Receive confirmation",
    description: "You'll get an SMS with a confirmation code. Come back here and paste it to complete your donation.",
  },
];

const PochiDonation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [activeView, setActiveView] = useState<"guide" | "donate">("guide");

  // Donation flow state
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const selectedAmount = customAmount || amount;

  const handleCopy = () => {
    navigator.clipboard.writeText("0704498457");
    setCopied(true);
    toast({ title: "Number copied to clipboard!" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNext = () => {
    if (step === 0 && (!phone.trim() || phone.trim().length < 10)) {
      toast({ title: "Please enter a valid phone number", variant: "destructive" });
      return;
    }
    if (step === 1 && (!selectedAmount || Number(selectedAmount) < 1)) {
      toast({ title: "Please select or enter an amount", variant: "destructive" });
      return;
    }
    if (step === 2 && !confirmationCode.trim()) {
      toast({ title: "Please enter your M-Pesa confirmation code", variant: "destructive" });
      return;
    }
    if (step === 2) {
      setSubmitting(true);
      setTimeout(() => {
        setSubmitting(false);
        setStep(3);
      }, 1200);
      return;
    }
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step === 0) {
      setActiveView("guide");
      return;
    }
    setStep((s) => s - 1);
  };

  const handleReset = () => {
    setStep(0);
    setName("");
    setPhone("");
    setAmount("");
    setCustomAmount("");
    setConfirmationCode("");
    setActiveView("guide");
  };

  const slideVariants = {
    enter: { opacity: 0, x: 60 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -60 },
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/90 backdrop-blur-md border-b border-border/50 shadow-sm">
        <div className="container flex items-center h-14 px-4 gap-3">
          <button
            onClick={() => (activeView === "donate" && step > 0 ? handleBack() : navigate("/donate"))}
            className="p-2 -ml-2 text-foreground hover:text-primary transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Smartphone className="w-5 h-5 text-primary" />
          <h1 className="font-bold text-foreground text-lg font-display">Pochi la Biashara</h1>
        </div>
      </header>

      <main className="pb-20">
        <AnimatePresence mode="wait">
          {activeView === "guide" ? (
            <motion.div
              key="guide"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="container max-w-lg mx-auto px-4 py-8"
            >
              {/* Hero card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 text-center mb-8 relative overflow-hidden"
              >
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-full bg-primary-foreground/20 flex items-center justify-center mx-auto mb-4">
                    <Smartphone className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h2 className="text-2xl font-bold font-display text-primary-foreground mb-2">
                    Donate via Pochi la Biashara
                  </h2>
                  <p className="text-primary-foreground/85 text-sm max-w-sm mx-auto">
                    Send your donation directly through M-Pesa's Pochi la Biashara. It's safe, instant, and every shilling goes to supporting our community.
                  </p>
                </div>
              </motion.div>

              {/* Pochi number card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card border-2 border-primary/20 rounded-2xl p-6 text-center mb-6"
              >
                <p className="text-sm text-muted-foreground mb-2">Send to this number</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-3xl sm:text-4xl font-bold text-primary tracking-wider font-display">
                    0704498457
                  </span>
                  <button
                    onClick={handleCopy}
                    className="p-2.5 rounded-xl bg-secondary hover:bg-muted transition-colors"
                    aria-label="Copy number"
                  >
                    {copied ? (
                      <Check className="w-5 h-5 text-trust-green" />
                    ) : (
                      <Copy className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Pochi la Biashara — <strong className="text-foreground">Herizon</strong>
                </p>
              </motion.div>

              {/* Step-by-step guide */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-8"
              >
                <h3 className="text-xl font-bold font-display text-foreground mb-4 text-center">
                  How to donate step by step
                </h3>
                <div className="space-y-3">
                  {POCHI_STEPS.map((s, i) => (
                    <motion.div
                      key={s.number}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 + i * 0.08 }}
                      className="bg-card border border-border/50 rounded-xl p-4 flex items-start gap-4"
                    >
                      <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                        {s.number}
                      </span>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground text-sm">{s.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>
                        {s.highlight && (
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-lg font-bold text-primary tracking-wide">0704498457</span>
                            <button
                              onClick={handleCopy}
                              className="p-1.5 rounded-lg bg-secondary hover:bg-muted transition-colors"
                              aria-label="Copy number"
                            >
                              {copied ? (
                                <Check className="w-3.5 h-3.5 text-trust-green" />
                              ) : (
                                <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Trust badges */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-3 gap-3 mb-8"
              >
                <div className="bg-card border border-border/50 rounded-xl p-3 text-center">
                  <Shield className="w-5 h-5 text-trust-green mx-auto mb-1" />
                  <p className="text-[10px] text-muted-foreground font-medium">Safe & Secure</p>
                </div>
                <div className="bg-card border border-border/50 rounded-xl p-3 text-center">
                  <Clock className="w-5 h-5 text-primary mx-auto mb-1" />
                  <p className="text-[10px] text-muted-foreground font-medium">Instant Transfer</p>
                </div>
                <div className="bg-card border border-border/50 rounded-xl p-3 text-center">
                  <Heart className="w-5 h-5 text-destructive mx-auto mb-1" />
                  <p className="text-[10px] text-muted-foreground font-medium">100% Goes to Help</p>
                </div>
              </motion.div>

              {/* FAQ */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-secondary/40 border border-border/50 rounded-2xl p-5 mb-8"
              >
                <div className="flex items-center gap-2 mb-3">
                  <HelpCircle className="w-5 h-5 text-primary" />
                  <h4 className="font-bold text-foreground text-sm">Frequently asked questions</h4>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">What is Pochi la Biashara?</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      It's a Safaricom M-Pesa service that allows you to send money to small businesses and organisations like Herizon, just like sending money to a friend.
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Is my donation safe?</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Yes! Pochi la Biashara is a verified Safaricom service. Your transaction is protected by M-Pesa's security systems.
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Will I get a receipt?</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      You'll receive an M-Pesa SMS confirmation immediately. Once you share the code with us, we'll also send you a digital thank-you receipt.
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">What's the minimum amount?</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Any amount is welcome! Even KSh 10 makes a difference. There are no minimum or maximum limits from our side.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* CTA */}
              <div className="sticky bottom-4">
                <Button
                  size="lg"
                  className="w-full shadow-lg"
                  onClick={() => setActiveView("donate")}
                >
                  <Heart className="w-5 h-5" />
                  I've sent my donation — Confirm now
                </Button>
                <p className="text-center text-[10px] text-muted-foreground mt-2">
                  Already sent via M-Pesa? Tap above to share your confirmation code.
                </p>
              </div>
            </motion.div>
          ) : (
            /* Donation confirmation flow */
            <motion.div
              key="donate"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col min-h-[calc(100vh-3.5rem)]"
            >
              {/* Progress */}
              {step < 3 && (
                <div className="px-6 pt-4 pb-2 shrink-0">
                  <div className="flex items-center gap-1">
                    {["Your info", "Amount", "Confirm"].map((label, i) => (
                      <div key={label} className="flex-1">
                        <div
                          className={`h-1.5 rounded-full transition-colors duration-300 ${
                            i <= step ? "bg-primary" : "bg-muted"
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Step {step + 1} of 3 — {["Your info", "Amount", "Confirm"][step]}
                  </p>
                </div>
              )}

              <div className="flex-1 flex flex-col items-center justify-center px-6 overflow-y-auto">
                <AnimatePresence mode="wait">
                  {/* Step 0: Info */}
                  {step === 0 && (
                    <motion.div
                      key="s0"
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.3 }}
                      className="w-full max-w-sm space-y-6"
                    >
                      <div className="text-center">
                        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                          <Heart className="w-8 h-8 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold font-display text-foreground mb-2">Your details</h2>
                        <p className="text-muted-foreground text-sm">So we can send you a receipt and say thank you.</p>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="pName">Name (optional)</Label>
                          <Input
                            id="pName"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Jane Wanjiku"
                            className="h-12 rounded-xl text-base"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="pPhone">Phone number *</Label>
                          <Input
                            id="pPhone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="07XXXXXXXX"
                            required
                            className="h-12 rounded-xl text-base"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 1: Amount */}
                  {step === 1 && (
                    <motion.div
                      key="s1"
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.3 }}
                      className="w-full max-w-sm space-y-6"
                    >
                      <div className="text-center">
                        <h2 className="text-2xl font-bold font-display text-foreground mb-2">How much did you send?</h2>
                        <p className="text-muted-foreground text-sm">Select or enter the amount you donated.</p>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {SUGGESTED_AMOUNTS.map((a) => (
                          <button
                            key={a}
                            onClick={() => { setAmount(String(a)); setCustomAmount(""); }}
                            className={`py-4 rounded-xl border-2 font-bold text-lg transition-all ${
                              amount === String(a) && !customAmount
                                ? "border-primary bg-secondary text-primary scale-105"
                                : "border-border bg-card text-foreground hover:border-primary/40"
                            }`}
                          >
                            {a.toLocaleString()}
                          </button>
                        ))}
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="cAmt">Or enter a custom amount (KSh)</Label>
                        <Input
                          id="cAmt"
                          type="number"
                          min={1}
                          value={customAmount}
                          onChange={(e) => { setCustomAmount(e.target.value); setAmount(""); }}
                          placeholder="Enter amount"
                          className="h-12 rounded-xl text-base text-center text-lg font-bold"
                        />
                      </div>
                      {selectedAmount && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-primary font-bold text-xl">
                          KSh {Number(selectedAmount).toLocaleString()}
                        </motion.p>
                      )}
                    </motion.div>
                  )}

                  {/* Step 2: Confirmation code */}
                  {step === 2 && (
                    <motion.div
                      key="s2"
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.3 }}
                      className="w-full max-w-sm space-y-6"
                    >
                      <div className="text-center">
                        <h2 className="text-2xl font-bold font-display text-foreground mb-2">Confirm payment</h2>
                        <p className="text-muted-foreground text-sm">Enter the M-Pesa confirmation code from your SMS.</p>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="mCode">Confirmation code *</Label>
                        <Input
                          id="mCode"
                          value={confirmationCode}
                          onChange={(e) => setConfirmationCode(e.target.value.toUpperCase())}
                          placeholder="e.g. SLK3A7B2XC"
                          maxLength={20}
                          className="h-14 rounded-xl text-center text-xl font-bold tracking-widest"
                        />
                      </div>
                      <div className="bg-secondary/60 border border-border rounded-xl p-4 text-center">
                        <p className="text-sm text-muted-foreground">Amount sent</p>
                        <p className="text-2xl font-bold text-primary">KSh {Number(selectedAmount).toLocaleString()}</p>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Success */}
                  {step === 3 && (
                    <motion.div
                      key="s3"
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.3 }}
                      className="w-full max-w-sm text-center space-y-6"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                      >
                        <CheckCircle className="w-20 h-20 text-trust-green mx-auto" />
                      </motion.div>
                      <div>
                        <h2 className="text-3xl font-bold font-display text-foreground mb-2">Asante sana! 🎉</h2>
                        <p className="text-muted-foreground text-base">
                          Your generous donation of <strong className="text-primary">KSh {Number(selectedAmount).toLocaleString()}</strong> has been received. You're making a real difference in someone's life today.
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        You'll receive an SMS confirmation shortly. Thank you for choosing to support someone today. ❤️
                      </p>
                      <Button onClick={handleReset} size="lg" className="w-full">
                        Back to Guide
                      </Button>
                      <Button variant="outline" onClick={() => navigate("/")} size="lg" className="w-full">
                        Back to Home
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer nav */}
              {step < 3 && (
                <div className="px-6 py-4 border-t border-border/50 bg-card/90 backdrop-blur-md shrink-0">
                  <Button onClick={handleNext} size="lg" className="w-full" disabled={submitting}>
                    {submitting ? "Verifying…" : step === 2 ? "Complete Donation" : "Next"}
                    {!submitting && step < 2 && <ArrowRight className="w-5 h-5 ml-2" />}
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default PochiDonation;
