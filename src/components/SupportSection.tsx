import { useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Clock, Send, CheckCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const responseInfo = [
  {
    icon: Clock,
    title: "Quick response",
    description: "We usually reply within 24 hours",
  },
  {
    icon: ShieldCheck,
    title: "Verified staff",
    description: "All support handled by trained team members",
  },
  {
    icon: MessageCircle,
    title: "Private & safe",
    description: "Your messages are confidential and secure",
  },
];

const SupportSection = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !message.trim()) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    if (phone.trim().length < 10) {
      toast({ title: "Please enter a valid phone number", variant: "destructive" });
      return;
    }
    if (message.trim().length < 5) {
      toast({ title: "Please write a longer message so we can help you better", variant: "destructive" });
      return;
    }
    setSuccessOpen(true);
    setName("");
    setPhone("");
    setMessage("");
  };

  return (
    <section id="support" className="py-16 px-4 bg-muted/40">
      <div className="container max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-foreground mb-3">
            Need Help?
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Our support team is here for you. Ask about donations, volunteering, deliveries, or anything else.
          </p>
        </motion.div>

        {/* Response expectations */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8"
        >
          {responseInfo.map((info) => (
            <Card key={info.title} className="border-border/60 rounded-2xl">
              <CardContent className="flex items-start gap-3 p-4">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                  <info.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{info.title}</p>
                  <p className="text-muted-foreground text-xs">{info.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Message form */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-border/60 rounded-2xl max-w-lg mx-auto">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="w-5 h-5 text-primary" />
                <h3 className="font-display font-bold text-lg text-foreground">Send us a message</h3>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="support-name">Your name (optional)</Label>
                  <Input
                    id="support-name"
                    placeholder="e.g. Jane Wanjiku"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={100}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="support-phone">Mobile number *</Label>
                  <Input
                    id="support-phone"
                    type="tel"
                    placeholder="e.g. 0712 345 678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    maxLength={15}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="support-message">How can we help? *</Label>
                  <Textarea
                    id="support-message"
                    placeholder="Tell us what you need help with…"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    maxLength={1000}
                    rows={4}
                    className="resize-none"
                  />
                </div>

                <Button type="submit" className="w-full gap-2">
                  <Send className="w-4 h-4" />
                  Send message
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>

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
              <DialogTitle className="font-display text-2xl">Message Sent! 💬</DialogTitle>
              <DialogDescription className="text-base mt-2">
                Thank you for reaching out. Our team will get back to you within 24 hours via your mobile number. Tutawasiliana!
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

export default SupportSection;
