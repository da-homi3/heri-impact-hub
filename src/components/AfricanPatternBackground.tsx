/**
 * African-inspired geometric pattern overlay (Kente / Adinkra / Ndebele motifs).
 * Renders only in dark mode — black background with warm gold outlines.
 */
const AfricanPatternBackground = () => {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 hidden dark:block"
    >
      {/* Solid black base */}
      <div className="absolute inset-0 bg-background" />

      {/* Tiled SVG pattern with gold outlines */}
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.18]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="african-kente"
            x="0"
            y="0"
            width="160"
            height="160"
            patternUnits="userSpaceOnUse"
          >
            {/* Diamonds */}
            <path
              d="M80 10 L150 80 L80 150 L10 80 Z"
              fill="none"
              stroke="hsl(var(--warm-gold))"
              strokeWidth="1.2"
            />
            <path
              d="M80 35 L125 80 L80 125 L35 80 Z"
              fill="none"
              stroke="hsl(var(--warm-gold))"
              strokeWidth="1"
            />
            {/* Inner Adinkra-style cross */}
            <path
              d="M80 60 L80 100 M60 80 L100 80"
              stroke="hsl(var(--warm-gold))"
              strokeWidth="1"
              strokeLinecap="round"
            />
            {/* Corner triangles (Ndebele) */}
            <path d="M0 0 L20 0 L0 20 Z" fill="none" stroke="hsl(var(--warm-gold))" strokeWidth="1" />
            <path d="M160 0 L140 0 L160 20 Z" fill="none" stroke="hsl(var(--warm-gold))" strokeWidth="1" />
            <path d="M0 160 L20 160 L0 140 Z" fill="none" stroke="hsl(var(--warm-gold))" strokeWidth="1" />
            <path d="M160 160 L140 160 L160 140 Z" fill="none" stroke="hsl(var(--warm-gold))" strokeWidth="1" />
            {/* Dots */}
            <circle cx="80" cy="80" r="2" fill="hsl(var(--warm-gold))" />
            <circle cx="0" cy="80" r="1.5" fill="hsl(var(--warm-gold))" />
            <circle cx="160" cy="80" r="1.5" fill="hsl(var(--warm-gold))" />
            <circle cx="80" cy="0" r="1.5" fill="hsl(var(--warm-gold))" />
            <circle cx="80" cy="160" r="1.5" fill="hsl(var(--warm-gold))" />
          </pattern>

          <radialGradient id="african-fade" cx="50%" cy="50%" r="75%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0.35" />
          </radialGradient>

          <mask id="african-mask">
            <rect width="100%" height="100%" fill="url(#african-fade)" />
          </mask>
        </defs>

        <rect
          width="100%"
          height="100%"
          fill="url(#african-kente)"
          mask="url(#african-mask)"
        />
      </svg>

      {/* Subtle gold glow accents */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-warm-gold/10 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-warm-gold/10 blur-3xl" />
    </div>
  );
};

export default AfricanPatternBackground;
