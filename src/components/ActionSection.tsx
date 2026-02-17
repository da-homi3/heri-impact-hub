import { motion } from "framer-motion";
import { HandHeart, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const ActionSection = () => {
  const navigate = useNavigate();
  return (
    <section id="help" className="py-16 px-4 bg-background">
      <div className="container max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Volunteer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-primary rounded-2xl p-8 text-center"
        >
          <HandHeart className="w-10 h-10 mx-auto text-primary-foreground mb-4" />
          <h3 className="text-2xl font-bold font-display text-primary-foreground mb-2">Become a Volunteer</h3>
          <p className="text-primary-foreground/80 text-sm mb-6">
            Join our network of change-makers. Sort donations, deliver supplies, or mentor in your community.
          </p>
          <Button variant="outline" className="border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground" onClick={() => navigate("/volunteer")}>
            Join Us
          </Button>
        </motion.div>

        {/* Request Help */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="bg-secondary rounded-2xl p-8 text-center border border-border/60"
        >
          <HelpCircle className="w-10 h-10 mx-auto text-primary mb-4" />
          <h3 className="text-2xl font-bold font-display text-foreground mb-2">Request Help</h3>
          <p className="text-muted-foreground text-sm mb-6">
            Need support? Submit a confidential request for clothing, food, school supplies or essentials.
          </p>
          <Button variant="default">
            Request Support
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default ActionSection;
