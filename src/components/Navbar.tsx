import { motion } from "motion/react";
import { useState, useEffect } from "react";
import logoBlue from "../assets/logos/incentric-logo-blue.png";
import logoWhite from "../assets/logos/incentric-logo-white.png";

const navLinks = [
  { label: "The Logic", href: "#logic" },
  { label: "The Framework", href: "#framework" },
  { label: "Team", href: "#team" },
];

export function Navbar() {
  const [isDarkText, setIsDarkText] = useState(false);

  useEffect(() => {
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
  }, []);

  return (
    <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      {/* Glass Background - Increased blur and adjusted opacity for better readability */}
      <div className={`absolute w-full max-w-5xl h-16 backdrop-blur-3xl border shadow-[0_8px_32px_rgba(0,0,0,0.1)] rounded-full pointer-events-auto transition-colors duration-500 ${isDarkText ? 'bg-white/40 border-black/5' : 'bg-slate-950/40 border-white/10'}`} />
      
      <motion.nav 
        className={`pointer-events-auto w-full max-w-5xl h-16 flex items-center justify-between px-6 lg:px-8 relative z-10 transition-colors duration-500 ${isDarkText ? 'text-slate-900' : 'text-white'}`}
      >
        <div className="flex items-center">
          <a href="#top" className="flex items-center space-x-2 hover:opacity-80 transition-opacity" aria-label="Back to top">
            <img
              src={isDarkText ? logoBlue : logoWhite}
              alt="Incentric"
              className="h-7 w-auto max-w-[150px] object-contain transition-opacity duration-500 md:h-9 md:max-w-[190px]"
            />
          </a>
        </div>
        
        <div className="flex items-center space-x-4 md:space-x-8 text-xs md:text-sm font-bold">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="hidden sm:inline-block hover:opacity-70 transition-opacity">
              {link.label}
            </a>
          ))}
          <a href="#contact" className={`px-5 py-2 rounded-full hover:scale-105 transition-all uppercase tracking-[0.1em] text-[10px] md:text-xs font-bold ${isDarkText ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
            Start Now
          </a>
        </div>
      </motion.nav>
    </div>
  );
}
