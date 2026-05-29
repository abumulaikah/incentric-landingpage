import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import logoBlue from "../assets/logos/incentric-logo-blue.png";
import logoWhite from "../assets/logos/incentric-logo-white.png";
import { WHATSAPP_URL } from "../lib/contact";

const navLinks = [
  {
    label: "Services",
    href: "/services",
    groups: [
      {
        label: "Surveys",
        items: [
          { label: "Employee Engagement", href: "/services/employee-engagement" },
          { label: "NPS", href: "/services/nps" },
        ],
      },
      {
        label: "In-house Training",
        items: [
          { label: "Conscious Leadership", href: "/services#conscious-leadership" },
          { label: "Sprint Productivity System", href: "/services#sprint-productivity-system" },
          { label: "CRM", href: "/services#crm" },
        ],
      },
      {
        label: "Implementation Program",
        items: [
          { label: "CRM Architecture", href: "/services#crm-architecture" },
          { label: "WOW Experience Loop", href: "/services#wow-experience-loop" },
          { label: "Business Operating System by Coda", href: "/services#business-operating-system-by-coda" },
        ],
      },
    ],
  },
  {
    label: "Workshop",
    href: "/workshop",
    groups: [
      {
        label: "Workshop",
        items: [
          { label: "The Founder", href: "/workshop#the-founder" },
          { label: "CRM Mastery", href: "/workshop#crm-mastery" },
          { label: "Service Experience", href: "/workshop#service-experience" },
        ],
      },
    ],
  },
  {
    label: "Products",
    href: "/#products",
    groups: [
      {
        label: "Books",
        items: [
          { label: "Breaktime", href: "/#breaktime" },
          { label: "Seni Merawat Pelanggan", href: "/#seni-merawat-pelanggan" },
        ],
      },
      {
        label: "Apps",
        items: [{ label: "Apps", href: "/#apps" }],
      },
    ],
  },
  { label: "Blog", href: "/blog" },
];

interface NavbarProps {
  theme?: "auto" | "light" | "dark";
}

export function Navbar({ theme = "auto" }: NavbarProps) {
  const [isDarkText, setIsDarkText] = useState(theme === "light");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

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
      <div className={`absolute w-[calc(100%-2.5rem)] max-w-7xl h-14 backdrop-blur-3xl border shadow-[0_8px_32px_rgba(0,0,0,0.1)] rounded-full pointer-events-auto transition-colors duration-500 sm:w-full sm:h-16 ${isDarkText ? 'bg-white/40 border-black/5' : 'bg-slate-950/40 border-white/10'}`} />
      
      <motion.nav 
        className={`pointer-events-auto w-full max-w-7xl h-14 flex items-center justify-between px-5 relative z-10 transition-colors duration-500 sm:h-16 sm:px-6 lg:px-8 ${isDarkText ? 'text-slate-900' : 'text-white'}`}
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
            <div
              key={link.href}
              className="relative hidden sm:block"
            >
              <a
                href={link.href}
                className="inline-flex items-center gap-1 py-4 hover:opacity-70 transition-opacity"
                aria-haspopup={"groups" in link && link.groups ? "menu" : undefined}
                aria-expanded={"groups" in link && link.groups ? openDropdown === link.href : undefined}
                onClick={(event) => {
                  if ("groups" in link && link.groups) {
                    event.preventDefault();
                    setOpenDropdown((current) => {
                      const next = current === link.href ? null : link.href;
                      if (!next) setOpenSubmenu(null);
                      return next;
                    });
                  }
                }}
              >
                {link.label}
                {"groups" in link && link.groups && (
                  <ChevronDown
                    size={14}
                    strokeWidth={2.5}
                    className={`transition-transform ${openDropdown === link.href ? 'rotate-180' : ''}`}
                  />
                )}
              </a>
              {"groups" in link && link.groups && (
                <div className={`absolute left-1/2 top-full w-80 -translate-x-1/2 rounded-2xl border p-2 text-left shadow-[0_20px_60px_rgba(15,23,42,0.18)] backdrop-blur-3xl transition-all duration-200 ${openDropdown === link.href ? 'visible translate-y-0 opacity-100' : 'invisible translate-y-2 opacity-0'} ${isDarkText ? 'border-black/5 bg-white/95 text-slate-950' : 'border-white/10 bg-slate-950/95 text-white'}`}>
                  <div className="space-y-1">
                    {link.groups.map((group) => (
                      <div key={group.label}>
                        <button
                          type="button"
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-bold transition-colors ${openSubmenu === group.label ? (isDarkText ? 'bg-slate-100' : 'bg-white/10') : ''} ${isDarkText ? 'hover:bg-slate-100' : 'hover:bg-white/10'}`}
                          aria-expanded={openSubmenu === group.label}
                          onClick={() => setOpenSubmenu((current) => (current === group.label ? null : group.label))}
                        >
                          {group.label}
                          <ChevronDown
                            size={15}
                            strokeWidth={2.5}
                            className={`transition-transform ${openSubmenu === group.label ? 'rotate-180' : ''}`}
                          />
                        </button>
                        {openSubmenu === group.label && (
                          <div className="mt-1 grid gap-1 pl-3">
                            {group.items.map((item) => (
                              <a
                                key={item.href}
                                href={item.href}
                                className={`block rounded-xl px-3 py-2 text-sm font-bold transition-colors ${isDarkText ? 'hover:bg-slate-100' : 'hover:bg-white/10'}`}
                              >
                                {item.label}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className={`hidden px-4 py-2 rounded-full hover:scale-105 transition-all uppercase tracking-[0.1em] text-[10px] font-bold sm:inline-block sm:px-5 md:text-xs ${isDarkText ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
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
              <div key={link.href}>
                <a
                  href={link.href}
                  className={`block rounded-2xl px-4 py-3 text-sm font-bold transition-colors ${isDarkText ? 'hover:bg-slate-100' : 'hover:bg-white/10'}`}
                  onClick={(event) => {
                    if ("groups" in link && link.groups) {
                      event.preventDefault();
                      setOpenDropdown((current) => {
                        const next = current === link.href ? null : link.href;
                        if (!next) setOpenSubmenu(null);
                        return next;
                      });
                      return;
                    }
                    setIsMenuOpen(false);
                  }}
                >
                  {link.label}
                </a>
                {"groups" in link && link.groups && openDropdown === link.href && (
                  <div className="px-4 pb-3">
                    {link.groups.map((group) => (
                      <div key={group.label} className="mt-2">
                        <button
                          type="button"
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-bold transition-colors ${isDarkText ? 'hover:bg-slate-100' : 'hover:bg-white/10'}`}
                          aria-expanded={openSubmenu === group.label}
                          onClick={() => setOpenSubmenu((current) => (current === group.label ? null : group.label))}
                        >
                          {group.label}
                          <ChevronDown size={15} strokeWidth={2.5} className={`transition-transform ${openSubmenu === group.label ? 'rotate-180' : ''}`} />
                        </button>
                        {openSubmenu === group.label && (
                          <div className="mt-1 grid gap-1 pl-3">
                            {group.items.map((item) => (
                              <a
                                key={item.href}
                                href={item.href}
                                className={`rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${isDarkText ? 'hover:bg-slate-100' : 'hover:bg-white/10'}`}
                                onClick={() => {
                                  setIsMenuOpen(false);
                                  setOpenDropdown(null);
                                  setOpenSubmenu(null);
                                }}
                              >
                                {item.label}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
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
