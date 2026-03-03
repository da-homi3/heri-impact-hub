import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const RefreshBlob = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Can't prevent default reliably, but we show blob on key combo
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // F5 or Ctrl+R / Cmd+R
      if (e.key === "F5" || ((e.ctrlKey || e.metaKey) && e.key === "r")) {
        e.preventDefault();
        setVisible(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const handleStay = () => setVisible(false);
  const handleRefresh = () => window.location.reload();

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-foreground/20 backdrop-blur-sm"
          onClick={handleStay}
        >
          <motion.div
            initial={{ scale: 0, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0, y: 40 }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
            onClick={(e) => e.stopPropagation()}
            className="flex flex-col items-center gap-3"
          >
            {/* Blob character */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
              className="relative"
            >
              <svg width="120" height="110" viewBox="0 0 120 110" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Blob body */}
                <motion.path
                  d="M60 10C30 10 10 35 10 60C10 85 30 100 60 100C90 100 110 85 110 60C110 35 90 10 60 10Z"
                  fill="hsl(var(--primary))"
                  animate={{
                    d: [
                      "M60 10C30 10 10 35 10 60C10 85 30 100 60 100C90 100 110 85 110 60C110 35 90 10 60 10Z",
                      "M60 8C25 12 8 38 12 62C16 88 32 102 60 100C88 98 108 82 108 58C108 32 92 6 60 8Z",
                      "M60 10C30 10 10 35 10 60C10 85 30 100 60 100C90 100 110 85 110 60C110 35 90 10 60 10Z",
                    ],
                  }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                />
                {/* Eyes */}
                <circle cx="44" cy="52" r="5" fill="hsl(var(--primary-foreground))" />
                <circle cx="76" cy="52" r="5" fill="hsl(var(--primary-foreground))" />
                {/* Pupils */}
                <motion.circle
                  cx="45" cy="53" r="2.5"
                  fill="hsl(var(--foreground))"
                  animate={{ cx: [45, 43, 45, 47, 45] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                />
                <motion.circle
                  cx="77" cy="53" r="2.5"
                  fill="hsl(var(--foreground))"
                  animate={{ cx: [77, 75, 77, 79, 77] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                />
                {/* Blush */}
                <circle cx="36" cy="62" r="5" fill="hsl(var(--pink-glow))" opacity="0.5" />
                <circle cx="84" cy="62" r="5" fill="hsl(var(--pink-glow))" opacity="0.5" />
                {/* Mouth - cute smile */}
                <path d="M50 68 Q60 76 70 68" stroke="hsl(var(--primary-foreground))" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              </svg>
            </motion.div>

            {/* Speech bubble */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card border border-border rounded-2xl px-6 py-4 shadow-lg text-center max-w-[240px] relative"
            >
              {/* Bubble arrow */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-card border-l border-t border-border rotate-45" />
              <p className="text-foreground font-bold text-sm mb-1 relative z-10">Wait, don't go! 🥺</p>
              <p className="text-muted-foreground text-xs relative z-10">Are you sure you want to refresh?</p>

              <div className="flex gap-2 mt-4 relative z-10">
                <button
                  onClick={handleStay}
                  className="flex-1 bg-primary text-primary-foreground text-xs font-bold py-2.5 rounded-xl hover:opacity-90 transition-opacity"
                >
                  I'll stay ❤️
                </button>
                <button
                  onClick={handleRefresh}
                  className="flex-1 bg-muted text-muted-foreground text-xs font-semibold py-2.5 rounded-xl hover:bg-muted/80 transition-colors"
                >
                  Refresh
                </button>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RefreshBlob;
