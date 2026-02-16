import { useState } from "react";
import { Home, Heart, Users, MessageCircle, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { icon: Home, label: "Home", href: "#" },
  { icon: Heart, label: "Donate", href: "#donate" },
  { icon: Users, label: "Team", href: "#team" },
  { icon: MessageCircle, label: "Support", href: "#support" },
];

const MobileNav = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-md border-b border-border/50 shadow-sm">
        <div className="container flex items-center justify-between h-14 px-4">
          <a href="#" className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary" fill="currentColor" />
            <span className="font-bold text-foreground text-lg">Herizon</span>
          </a>
          <button
            onClick={() => setOpen(!open)}
            className="p-2 text-foreground hover:text-primary transition-colors"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <AnimatePresence>
          {open && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden bg-card border-b border-border/50"
            >
              <div className="px-4 py-3 space-y-1">
                {navItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground hover:bg-secondary transition-colors"
                  >
                    <item.icon className="w-5 h-5 text-primary" />
                    <span className="font-semibold">{item.label}</span>
                  </a>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* Bottom tab bar for mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border/50 sm:hidden safe-bottom" aria-label="Main navigation">
        <div className="flex justify-around items-center h-16 px-2">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-primary transition-colors py-1 px-3"
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-semibold">{item.label}</span>
            </a>
          ))}
        </div>
      </nav>
    </>
  );
};

export default MobileNav;
