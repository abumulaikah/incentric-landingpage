import { motion, useMotionValue, useSpring } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { useEffect } from "react";
import { useReducedEffects } from "../hooks/useReducedEffects";

function RotatingText() {
  const text = "CONTACT US | GET IN TOUCH | START A PROJECT | ";
  const characters = text.split("");
  const radius = 85; 

  return (
    <motion.div
      className="relative w-40 h-40 md:w-52 md:h-52 flex items-center justify-center"
      animate={{ rotate: 360 }}
      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
    >
      {characters.map((char, i) => (
        <span
          key={i}
          className="absolute font-black uppercase tracking-tighter text-slate-950 text-[10px] md:text-[12px]"
          style={{
            transform: `rotate(${i * (360 / characters.length)}deg) translateY(-${radius}px)`,
          }}
        >
          {char}
        </span>
      ))}
    </motion.div>
  );
}

function FractalGlass() {
  const reduceEffects = useReducedEffects();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  useEffect(() => {
    if (reduceEffects) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      mouseX.set((clientX / innerWidth - 0.5) * 100);
      mouseY.set((clientY / innerHeight - 0.5) * 100);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY, reduceEffects]);

  if (reduceEffects) return null;

  return (
    <div className="absolute inset-0 z-1 pointer-events-none overflow-hidden">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            x: springX,
            y: springY,
            rotate: i * 45,
            scale: 1 + i * 0.1,
          }}
          className="absolute inset-0 backdrop-blur-[24px] bg-white/5 border border-white/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}

export function Footer() {
  const tickerText = "INCENTRIC ";
  
  return (
    <footer id="contact" className="bg-[#e7eaee] text-slate-950 min-h-[70vh] flex flex-col justify-center relative overflow-hidden pt-20 border-t border-slate-200 scroll-mt-28">
      {/* Seamless Looping Background Text */}
      <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full overflow-hidden whitespace-nowrap opacity-[0.08] select-none pointer-events-none">
        <motion.div
          animate={{ x: [0, "-50%"] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="flex gap-20 whitespace-nowrap"
        >
          {[...Array(4)].map((_, i) => (
            <span key={i} className="text-[35vw] font-black uppercase tracking-tighter leading-none">
              {tickerText}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Fractal Glass Effect Layer */}
      <FractalGlass />

      {/* Central Interactive Element */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        <motion.a
          href="mailto:hello@incentric.studio?subject=Start%20a%20Project"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative group"
          aria-label="Start a project by email"
        >
          <div className="relative w-44 h-44 md:w-64 md:h-64 rounded-full flex items-center justify-center transition-all duration-700">
            {/* Rotating Circular Text */}
            <RotatingText />
            
            {/* Center Arrow with Spring Animation */}
            <motion.div
              className="absolute bg-[#ffbc00] rounded-full p-5 md:p-7 flex items-center justify-center z-10 shadow-2xl"
              whileHover={{ rotate: 45, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <ArrowUpRight className="w-8 h-8 md:w-12 md:h-12 text-slate-950" />
            </motion.div>
          </div>
        </motion.a>
      </div>

      {/* Bottom Minimal Footer */}
      <div className="absolute bottom-12 left-0 w-full px-12 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] uppercase tracking-[0.3em] text-slate-400 z-20">
        <div className="flex gap-12 text-center md:text-left font-bold">
          <span>Twitter (X)</span>
          <span>LinkedIn</span>
          <a href="mailto:hello@incentric.studio" className="hover:text-slate-950 transition-colors">Email</a>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12 font-medium">
          <span>&copy; {new Date().getFullYear()} INCENTRIC STUDIO</span>
          <div className="flex gap-8">
            <span>Privacy</span>
            <span>Terms</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
