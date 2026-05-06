import { motion, useMotionValue, useTransform, animate, useScroll } from "motion/react";
import type { MotionValue } from "motion/react";
import { useEffect, useState, useRef } from "react";

function Counter({ from, to, delay = 0 }: { from: number; to: number; delay?: number }) {
  const count = useMotionValue(from);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    const controls = animate(count, to, { duration: 1.5, ease: "easeOut", delay });
    return controls.stop;
  }, [count, to, delay]);

  return <motion.span>{rounded}</motion.span>;
}

interface CharacterProps {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
  targetColor?: string;
}

function Character({ children, progress, range, targetColor = "#0f172a" }: CharacterProps) {
  const color = useTransform(progress, range, ["#e2e8f0", targetColor]); // slate-200 to target color
  return <motion.span style={{ color }}>{children}</motion.span>;
}

const metrics = [
  {
    id: "retention",
    label: "Customer Retention",
    product: 32,
    wow: 94,
  },
  {
    id: "advocacy",
    label: "Brand Advocacy",
    product: 15,
    wow: 78,
  },
  {
    id: "ltv",
    label: "LTV Growth",
    product: 20,
    wow: 85,
  },
];

export function Comparison() {
  const [hoveredMetric, setHoveredMetric] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.8", "start 0.2"]
  });

  const text = "Don't just build a better product. Build a better experience.";
  const characters = text.split("");

  return (
    <section id="logic" className="py-32 px-6 lg:px-12 bg-white relative overflow-hidden scroll-mt-28" ref={containerRef}>
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-b from-brand-blue/5 to-transparent rounded-bl-full pointer-events-none -z-10 blur-3xl"></div>
      
      <div className="max-w-7xl w-full mx-auto grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        <motion.div
           initial={{ opacity: 0, x: -30 }}
           whileInView={{ opacity: 1, x: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.8 }}
        >
          <div className="text-4xl md:text-5xl lg:text-7xl font-bold leading-[1.1] tracking-tight mb-8">
            {characters.map((char, i) => {
              const start = i / characters.length;
              const end = (i + 1) / characters.length;
              // "better experience." part starts at index 43
              const isBluePart = i >= 43;
              return (
                <Character 
                  key={i} 
                  progress={scrollYProgress} 
                  range={[start, end]}
                  targetColor={isBluePart ? "#014FCF" : "#0f172a"}
                >
                  {char}
                </Character>
              );
            })}
          </div>
          <p className="text-lg text-slate-600 leading-relaxed max-w-lg">
            Loyalty is earned through memorable, meaningful experiences.
          </p>
        </motion.div>

        <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           whileInView={{ opacity: 1, scale: 1 }}
           viewport={{ once: true }}
           transition={{ duration: 0.8, delay: 0.2 }}
           className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-brand-blue to-blue-300 rounded-[2.5rem] rotate-2 scale-[1.03] opacity-5 blur-xl transition-all duration-500"></div>
          
          <div className="bg-white p-8 md:p-12 rounded-[2.5rem] relative z-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100/50 group/card">
            
            {/* Legend */}
            <div className="flex items-center gap-6 mb-10 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Product Only</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-brand-blue shadow-[0_0_10px_rgba(37,99,235,0.4)]"></div>
                <span className="text-xs font-bold uppercase tracking-widest text-brand-blue">WOW Experience</span>
              </div>
            </div>

            <div className="flex flex-col gap-8">
              {metrics.map((metric, i) => (
                <div 
                  key={metric.id}
                  className={`relative flex flex-col gap-3 transition-all duration-500 ${hoveredMetric && hoveredMetric !== metric.id ? 'opacity-40 grayscale' : 'opacity-100'}`}
                  onMouseEnter={() => setHoveredMetric(metric.id)}
                  onMouseLeave={() => setHoveredMetric(null)}
                >
                  <span className="text-sm font-bold text-slate-800 tracking-tight">{metric.label}</span>
                  
                  {/* Product Bar */}
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-3 bg-slate-50 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: `${metric.product}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, ease: "easeOut", delay: i * 0.2 }}
                        className="h-full bg-slate-200 rounded-full"
                      />
                    </div>
                    <span className="w-12 text-right text-xs font-bold text-slate-400">
                      <Counter from={0} to={metric.product} delay={i * 0.2} />%
                    </span>
                  </div>

                  {/* WOW Bar */}
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-5 bg-blue-50 rounded-full overflow-hidden p-0.5">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: `${metric.wow}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5, ease: "easeOut", delay: i * 0.2 + 0.3 }}
                        className="h-full bg-gradient-to-r from-brand-blue to-blue-400 rounded-full relative overflow-hidden"
                      >
                         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                      </motion.div>
                    </div>
                    <span className="w-12 text-right text-lg font-black text-brand-blue tracking-tighter">
                      <Counter from={0} to={metric.wow} delay={i * 0.2 + 0.3} />%
                    </span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}
