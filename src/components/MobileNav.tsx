import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Heart, ShoppingBag, HandHeart, MessageCircle, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MobileNav = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Heart, label: "Donate", path: "/donate" },
    { icon: ShoppingBag, label: "Shop", path: "/shop" },
    { icon: HandHeart, label: "Volunteer", path: "/volunteer" },
    { icon: MessageCircle, label: "Support", path: "/support" },
  ];

  const handleNav = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <>
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-md border-b border-border/50 shadow-sm">
        <div className="container flex items-center justify-between h-14 px-4">
          <button onClick={() => navigate("/")} className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary" fill="currentColor" />
            <span className="font-bold text-foreground text-lg">Herizon</span>
          </button>
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
                  <button
                    key={item.label}
                    onClick={() => handleNav(item.path)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                      location.pathname === item.path
                        ? "bg-secondary text-primary font-bold"
                        : "text-foreground hover:bg-secondary"
                    }`}
                  >
                    <item.icon className="w-5 h-5 text-primary" />
                    <span className="font-semibold">{item.label}</span>
                  </button>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* Bottom tab bar for mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border/50 sm:hidden safe-bottom" aria-label="Main navigation">
        <div className="flex justify-around items-center h-16 px-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.label}
                onClick={() => handleNav(item.path)}
                className={`flex flex-col items-center gap-0.5 py-1 px-2 transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className={`text-[10px] ${isActive ? "font-bold" : "font-semibold"}`}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default MobileNav;
