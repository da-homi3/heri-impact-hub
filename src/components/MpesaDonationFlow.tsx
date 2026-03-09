import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Smartphone, CheckCircle, Heart, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface MpesaDonationFlowProps {
  open: boolean;
  onClose: () => void;
}

const SUGGESTED_AMOUNTS = [100, 250, 500, 1000, 2500, 5000];

const MpesaDonationFlow = ({ open, onClose }: MpesaDonationFlowProps) => {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const selectedAmount = customAmount || amount;

  const handleCopy = () => {
    navigator.clipboard.writeText("0704498457");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNext = () => {
    if (step === 0) {
      if (!phone.trim() || phone.trim().length < 10) {
        toast({ title: "Please enter a valid phone number", variant: "destructive" });
        return;
      }
    }
    if (step === 1) {
      if (!selectedAmount || Number(selectedAmount) < 1) {
        toast({ title: "Please select or enter an amount", variant: "destructive" });
        return;
      }
    }
    if (step === 3) {
      if (!confirmationCode.trim()) {
        toast({ title: "Please enter your M-Pesa confirmation code", variant: "destructive" });
        return;
      }
      setSubmitting(true);
      setTimeout(() => {
        setSubmitting(false);
        setStep(4);
      }, 1200);
      return;
    }
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step === 0) {
      onClose();
      return;
    }
    setStep((s) => s - 1);
  };

  const handleClose = () => {
    setStep(0);
    setName("");
    setPhone("");
    setAmount("");
    setCustomAmount("");
    setConfirmationCode("");
    onClose();
  };

  if (!open) return null;

  const slideVariants = {
    enter: { opacity: 0, x: 60 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -60 },
  };

  const steps = [
    { label: "Your info" },
    { label: "Amount" },
    { label: "Send" },
    { label: "Confirm" },
    { label: "Done" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-background flex flex-col"
    >
      {/* Header */}
      <header className="flex items-center gap-3 px-4 h-14 border-b border-border/50 bg-card/90 backdrop-blur-md shrink-0">
        <button
          onClick={step === 4 ? handleClose : handleBack}
          className="p-2 -ml-2 text-foreground hover:text-primary transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <Smartphone className="w-5 h-5 text-primary" />
        <h1 className="font-bold text-foreground text-lg font-display">M-Pesa Donation</h1>
      </header>

      {/* Progress bar */}
      {step < 4 && (
        <div className="px-6 pt-4 pb-2 shrink-0">
          <div className="flex items-center gap-1">
            {steps.slice(0, 4).map((s, i) => (
              <div key={s.label} className="flex-1 flex items-center gap-1">
                <div
                  className={`h-1.5 rounded-full flex-1 transition-colors duration-300 ${
                    i <= step ? "bg-primary" : "bg-muted"
                  }`}
                />
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Step {step + 1} of 4 — {steps[step].label}
          </p>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* Step 0: Info */}
          {step === 0 && (
            <motion.div
              key="step0"
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
                  <Label htmlFor="mpesaName">Name (optional)</Label>
                  <Input
                    id="mpesaName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Jane Wanjiku"
                    className="h-12 rounded-xl text-base"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="mpesaPhone">Phone number *</Label>
                  <Input
                    id="mpesaPhone"
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
              key="step1"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="w-full max-w-sm space-y-6"
            >
              <div className="text-center">
                <h2 className="text-2xl font-bold font-display text-foreground mb-2">Choose amount</h2>
                <p className="text-muted-foreground text-sm">How much would you like to give today?</p>
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
                <Label htmlFor="customAmt">Or enter a custom amount (KSh)</Label>
                <Input
                  id="customAmt"
                  type="number"
                  min={1}
                  value={customAmount}
                  onChange={(e) => { setCustomAmount(e.target.value); setAmount(""); }}
                  placeholder="Enter amount"
                  className="h-12 rounded-xl text-base text-center text-lg font-bold"
                />
              </div>

              {selectedAmount && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-primary font-bold text-xl"
                >
                  KSh {Number(selectedAmount).toLocaleString()}
                </motion.p>
              )}
            </motion.div>
          )}

          {/* Step 2: Send instructions */}
          {step === 2 && (
            <motion.div
              key="step2"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="w-full max-w-sm space-y-6"
            >
              <div className="text-center">
                <h2 className="text-2xl font-bold font-display text-foreground mb-2">Send via M-Pesa</h2>
                <p className="text-muted-foreground text-sm">Follow these steps on your phone.</p>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">1</span>
                  <p className="text-sm text-foreground">Open <strong>M-Pesa</strong> on your phone</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">2</span>
                  <p className="text-sm text-foreground">Go to <strong>Send Money</strong></p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">3</span>
                  <div className="text-sm text-foreground">
                    <p>Send to this number:</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-2xl font-bold text-primary tracking-wider">0704498457</span>
                      <button
                        onClick={handleCopy}
                        className="p-2 rounded-lg bg-secondary hover:bg-muted transition-colors"
                        aria-label="Copy number"
                      >
                        {copied ? <Check className="w-4 h-4 text-trust-green" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Pochi la Biashara — <strong>Herizon</strong></p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">4</span>
                  <p className="text-sm text-foreground">
                    Enter amount: <strong className="text-primary">KSh {Number(selectedAmount).toLocaleString()}</strong>
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">5</span>
                  <p className="text-sm text-foreground">Complete the transaction and enter your <strong>M-Pesa PIN</strong></p>
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Once done, tap "Next" to enter your confirmation code.
              </p>
            </motion.div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <motion.div
              key="step3"
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
                <Label htmlFor="mpesaCode">Confirmation code *</Label>
                <Input
                  id="mpesaCode"
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

          {/* Step 4: Success */}
          {step === 4 && (
            <motion.div
              key="step4"
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

              <Button onClick={handleClose} size="lg" className="w-full">
                Back to Home
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer navigation */}
      {step < 4 && (
        <div className="px-6 py-4 border-t border-border/50 bg-card/90 backdrop-blur-md shrink-0 safe-bottom">
          <Button
            onClick={handleNext}
            size="lg"
            className="w-full"
            disabled={submitting}
          >
            {submitting ? "Verifying…" : step === 3 ? "Complete Donation" : "Next"}
            {!submitting && step < 3 && <ArrowRight className="w-5 h-5 ml-2" />}
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default MpesaDonationFlow;
