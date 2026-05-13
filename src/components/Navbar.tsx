import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import logoBlue from "../assets/logos/incentric-logo-blue.png";
import logoWhite from "../assets/logos/incentric-logo-white.png";

const navLinks = [
  { label: "Services", href: "/services" },
  { label: "Workshop", href: "/workshop" },
  { label: "Blog", href: "/blog" },
];

interface NavbarProps {
  theme?: "auto" | "light" | "dark";
}

export function Navbar({ theme = "auto" }: NavbarProps) {
  const [isDarkText, setIsDarkText] = useState(theme === "light");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (theme !== "auto") {
      setIsDarkText(theme === "light");
      return;
    }

    // Determine overlapping sections
    const handleScroll = () => {
      const navCenter = 32 + 24; // top-6 (24px) + half of h-16 (32px) = 56px from top
      const elements = document.elementsFromPoint(window.innerWidth / 2, navCenter);
      
      let foundTheme = false;
      for (const el of elements) {
        if (el.tagName.toLowerCase() === 'section') {
          // Check the background color or specific classes
          const className = el.className || '';
          if (className.includes('bg-white') || className.includes('bg-slate-50')) {
            setIsDarkText(true);
            foundTheme = true;
          } else if (className.includes('bg-slate-950') || className.includes('bg-slate-900')) {
            setIsDarkText(false);
            foundTheme = true;
          }
          break; // Stop at the first section found
        }
      }
      
      // Fallback if no section matched
      if (!foundTheme) {
        // Assume dark text if we are near the top and it's a light page? Actually Hero is slate-950
        // We'll leave it as current state
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Trigger once on mount
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [theme]);

  return (
    <div className="fixed top-5 left-0 right-0 z-50 flex justify-center px-5 pointer-events-none sm:top-6 sm:px-4">
      {/* Glass Background - Increased blur and adjusted opacity for better readability */}
      <div className={`absolute w-[calc(100%-2.5rem)] max-w-5xl h-14 backdrop-blur-3xl border shadow-[0_8px_32px_rgba(0,0,0,0.1)] rounded-full pointer-events-auto transition-colors duration-500 sm:w-full sm:h-16 ${isDarkText ? 'bg-white/40 border-black/5' : 'bg-slate-950/40 border-white/10'}`} />
      
      <motion.nav 
        className={`pointer-events-auto w-full max-w-5xl h-14 flex items-center justify-between px-5 relative z-10 transition-colors duration-500 sm:h-16 sm:px-6 lg:px-8 ${isDarkText ? 'text-slate-900' : 'text-white'}`}
      >
        <div className="flex items-center">
          <a href="/#top" className="flex items-center space-x-2 hover:opacity-80 transition-opacity" aria-label="Back to top" onClick={() => setIsMenuOpen(false)}>
            <img
              src={isDarkText ? logoBlue.src : logoWhite.src}
              alt="Incentric"
              className="h-6 w-auto max-w-[132px] object-contain transition-opacity duration-500 sm:h-7 sm:max-w-[150px] md:h-9 md:max-w-[190px]"
            />
          </a>
        </div>
        
        <div className="flex items-center space-x-4 md:space-x-8 text-xs md:text-sm font-bold">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="hidden sm:inline-block hover:opacity-70 transition-opacity">
              {link.label}
            </a>
          ))}
          <a href="/#contact" className={`hidden px-4 py-2 rounded-full hover:scale-105 transition-all uppercase tracking-[0.1em] text-[10px] font-bold sm:inline-block sm:px-5 md:text-xs ${isDarkText ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
            Start Now
          </a>
          <button
            type="button"
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors sm:hidden ${isDarkText ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? <X size={18} strokeWidth={2.5} /> : <Menu size={18} strokeWidth={2.5} />}
          </button>
        </div>
      </motion.nav>

      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          className={`pointer-events-auto absolute top-16 z-10 w-[calc(100%-2.5rem)] overflow-hidden rounded-3xl border p-2 shadow-[0_20px_60px_rgba(15,23,42,0.18)] backdrop-blur-3xl sm:hidden ${isDarkText ? 'border-black/5 bg-white/90 text-slate-950' : 'border-white/10 bg-slate-950/90 text-white'}`}
        >
          <div className="flex flex-col">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-2xl px-4 py-3 text-sm font-bold transition-colors hover:bg-white/10"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <a
              href="/#contact"
              className={`mt-2 rounded-full px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.1em] ${isDarkText ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Start Now
            </a>
          </div>
        </motion.div>
      )}
    </div>
  );
}
