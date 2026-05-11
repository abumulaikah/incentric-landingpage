import { motion, AnimatePresence, useScroll, useTransform } from "motion/react";
import type { MotionValue } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useReducedEffects } from "../hooks/useReducedEffects";

const centerData = { id: 'center', title: 'Loyal Customer', description: 'The absolute core of the business. By aligning every facet around the customer, we achieve unparalleled advocacy and sustainable retention.' };

const middleRingData = [
  { id: 'm0', title: 'WOW Product', description: 'Creating flagship products that are innovative, relevant, and easy to talk about - solving the "good product, hard to describe" problem.' },
  { id: 'm1', title: 'WOW Service', description: 'Designing and creating services that are not only fast and accurate, but also make customers feel truly understood.' },
  { id: 'm2', title: 'WOW Marketing', description: 'Developing and executing marketing strategies that go beyond promotion to build lasting memories and relationships.' },
];

const outerRingData = [
  { id: 'o0', title: 'Culture', description: 'Creating a positive work environment through the implementation of "Culture Foundations" and Employee Engagement programs.' },
  { id: 'o1', title: 'Management', description: 'Managing goals and metrics as key success indicators using the "Sprint Break Cycle" and "Sprint Productivity System."' },
  { id: 'o2', title: 'Leadership', description: 'Developing leaders with "Conscious Leadership" who are capable of influencing teams to deliver WOW Experiences.' },
];

const helpSteps = [
  {
    eyebrow: "01",
    title: "Business & Customer Diagnosis",
    description: "We identify friction points, blind spots, and improvement opportunities across customer experience, service delivery, and business operations.",
    color: "#014FCF",
  },
  {
    eyebrow: "02",
    title: "Strategy & Experience Design",
    description: "Together with owners and teams, we shape clearer, more consistent customer experiences that stay relevant to the business goals.",
    color: "#FFBC00",
  },
  {
    eyebrow: "03",
    title: "Implementation & Growth Improvement",
    description: "We guide implementation so change does not stay on paper, but improves customer loyalty, service quality, and business growth.",
    color: "#E7EAEE",
  },
];

const polarToCartesian = (cx: number, cy: number, r: number, angle: number) => {
  const rad = (angle - 90) * Math.PI / 180.0;
  return { x: cx + (r * Math.cos(rad)), y: cy + (r * Math.sin(rad)) };
};

const createSimpleSlice = (
  cx: number, cy: number, rInner: number, rOuter: number, 
  startAngle: number, endAngle: number
) => {
  const p0 = polarToCartesian(cx, cy, rInner, startAngle);
  const p1 = polarToCartesian(cx, cy, rOuter, startAngle);
  const p2 = polarToCartesian(cx, cy, rOuter, endAngle);
  const p3 = polarToCartesian(cx, cy, rInner, endAngle);
  const largeArc = (endAngle - startAngle) <= 180 ? "0" : "1";

  return `M ${p0.x} ${p0.y} L ${p1.x} ${p1.y} A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${rInner} ${rInner} 0 ${largeArc} 0 ${p0.x} ${p0.y} Z`;
};

const createTextArc = (cx: number, cy: number, r: number, startAngle: number, endAngle: number, sweepFlag: 0|1) => {
   const start = polarToCartesian(cx, cy, r, startAngle);
   const end = polarToCartesian(cx, cy, r, endAngle);
   return `M ${start.x} ${start.y} A ${r} ${r} 0 0 ${sweepFlag} ${end.x} ${end.y}`;
}

const getTextPath = (i: number, cx: number, cy: number, r: number) => {
  if (i === 1) return createTextArc(cx, cy, r, 220, 140, 0); // Bottom
  if (i === 0) return createTextArc(cx, cy, r, 20, 100, 1);   // Top Right
  return createTextArc(cx, cy, r, 260, 340, 1);               // Top Left
}

function InteractiveWheel() {
  const [activeItem, setActiveItem] = useState<{id: string, title: string, description: string} | null>(null);
  
  const SIZE = 600;
  const CENTER = SIZE / 2;
  const R_CENTER = 85; 
  const SPACE = 4;
  const RING_THICKNESS = 96;

  const R_MID_IN = R_CENTER + SPACE;
  const R_MID_OUT = R_MID_IN + RING_THICKNESS;
  
  const R_OUT_IN = R_MID_OUT + SPACE;
  const R_OUT_OUT = R_OUT_IN + RING_THICKNESS;

  const GAP_OFFSET = 1.5; 

  const getMiddleTextRadius = (i: number) => {
     const rMid = (R_MID_IN + R_MID_OUT)/2;
     return i === 1 ? rMid - 2 : rMid + 4;
  }
  const getOuterTextRadius = (i: number) => {
     const rMid = (R_OUT_IN + R_OUT_OUT)/2;
     return i === 1 ? rMid - 2 : rMid + 4;
  }

  const handleItemClick = (item: {id: string, title: string, description: string}) => {
    setActiveItem(prev => prev?.id === item.id ? null : item);
  };

  return (
    <div className="flex flex-col items-center relative z-10 w-full mb-12">
      <div className="flex flex-col items-center text-center mb-8 md:mb-12 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="w-full flex flex-col items-center"
        >
          <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-brand-yellow mb-6">Introducing</h2>
          <p className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-white shadow-sm mb-6">
            The <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-yellow to-yellow-200">WOW</span> Experience Loop
          </p>
          
          <div className="min-h-[140px] md:min-h-[90px] flex justify-center w-full max-w-2xl px-4">
            <AnimatePresence mode="wait">
              {activeItem ? (
                <motion.div
                  key="active-item"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="w-full"
                >
                  <p className="text-lg md:text-xl font-bold text-white mb-2 tracking-tight flex items-center justify-center">
                    {activeItem.id === centerData.id && <span className="text-brand-yellow mr-3 text-lg md:text-xl">*</span>}
                    {activeItem.id.startsWith('o') && <span className="text-brand-yellow mr-3 text-base md:text-lg">#</span>}
                    {activeItem.id.startsWith('m') && <span className="text-brand-blue mr-3 text-lg md:text-xl">o</span>}
                    {activeItem.title}
                  </p>
                  <p className="text-base md:text-lg text-slate-400 leading-relaxed">
                    {activeItem.description}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="default-text"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="w-full"
                >
                  <p className="text-slate-400 text-base md:text-lg leading-relaxed">
                    A continuous framework that aligns your team's culture with your customer's journey. Creating a self-sustaining cycle of unbreakable loyalty.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      <div className="aspect-square relative max-w-[500px] mx-auto w-full group/wheel">
         {/* Subtle background glow for glass depth */}
         <div className="absolute inset-0 bg-brand-blue/5 rounded-full blur-[100px] pointer-events-none" />
         
         <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full h-full relative z-10 overflow-visible drop-shadow-[0_0_35px_rgba(1,79,207,0.15)]">
            <defs>
              {middleRingData.map((_, i) => (
                <path key={`tp-m-${i}`} id={`tp-m-${i}`} d={getTextPath(i, CENTER, CENTER, getMiddleTextRadius(i))} />
              ))}
              {outerRingData.map((_, i) => (
                <path key={`tp-o-${i}`} id={`tp-o-${i}`} d={getTextPath(i, CENTER, CENTER, getOuterTextRadius(i))} />
              ))}
            </defs>
            
            <g className="animate-spin-reverse-slow" style={{ transformOrigin: 'center' }}>
              {middleRingData.map((item, i) => {
                 const start = i * 120 + GAP_OFFSET;
                 const end = (i + 1) * 120 - GAP_OFFSET;
                 const d = createSimpleSlice(CENTER, CENTER, R_MID_IN, R_MID_OUT, start, end);
                 const isActive = activeItem?.id === item.id;
                 return (
                   <g key={item.id} onClick={() => handleItemClick(item)} className="cursor-pointer group">
                     <path 
                       d={d} 
                       strokeWidth="2"
                       className={`transition-all duration-300 ${
                         isActive 
                           ? 'fill-brand-blue/30 stroke-brand-blue drop-shadow-[0_0_15px_rgba(1,79,207,0.8)]' 
                           : 'fill-white/10 stroke-white/30 group-hover:fill-brand-blue/20 group-hover:stroke-brand-blue/40'
                       }`} 
                     />
                     <text className={`font-bold text-[18px] uppercase tracking-wider transition-colors duration-300 ${
                       isActive ? 'fill-white' : 'fill-slate-400 group-hover:fill-white'
                     }`} style={{ pointerEvents: 'none' }}>
                       <textPath href={`#tp-m-${i}`} startOffset="50%" textAnchor="middle" dominantBaseline="middle">
                          {item.title}
                       </textPath>
                     </text>
                   </g>
                 )
              })}
            </g>
            
            <g className="animate-spin-slow" style={{ transformOrigin: 'center' }}>
              {outerRingData.map((item, i) => {
                 const start = i * 120 + GAP_OFFSET;
                 const end = (i + 1) * 120 - GAP_OFFSET;
                 const d = createSimpleSlice(CENTER, CENTER, R_OUT_IN, R_OUT_OUT, start, end);
                 const isActive = activeItem?.id === item.id;
                 return (
                   <g key={item.id} onClick={() => handleItemClick(item)} className="cursor-pointer group">
                     <path 
                       d={d} 
                       strokeWidth="2"
                       className={`transition-all duration-300 ${
                         isActive 
                           ? 'fill-brand-yellow/30 stroke-brand-yellow drop-shadow-[0_0_15px_rgba(255,188,0,0.8)]' 
                           : 'fill-white/10 stroke-white/30 group-hover:fill-brand-yellow/20 group-hover:stroke-brand-yellow/40'
                       }`} 
                     />
                     <text className={`font-bold text-[22px] uppercase tracking-widest transition-colors duration-300 ${
                       isActive ? 'fill-white' : 'fill-slate-400 group-hover:fill-white'
                     }`} style={{ pointerEvents: 'none' }}>
                       <textPath href={`#tp-o-${i}`} startOffset="50%" textAnchor="middle" dominantBaseline="middle">
                          {item.title}
                       </textPath>
                     </text>
                   </g>
                 )
              })}
            </g>

            <g onClick={() => handleItemClick(centerData)} className="cursor-pointer group">
               <circle 
                 cx={CENTER} cy={CENTER} r={R_CENTER} 
                 strokeWidth="2"
                 className={`transition-all duration-300 ${
                   activeItem?.id === centerData.id 
                     ? 'fill-white/20 stroke-white drop-shadow-[0_0_30px_rgba(255,255,255,0.6)]' 
                     : 'fill-white/10 stroke-white/40 group-hover:fill-white/20 group-hover:stroke-white/50'
                 }`}
               />
               <text x={CENTER} y={CENTER - 12} className={`font-black text-[20px] transition-colors duration-300 text-center ${
                 activeItem?.id === centerData.id ? 'fill-white' : 'fill-slate-400 group-hover:fill-white'
               }`} textAnchor="middle" dominantBaseline="middle">Loyal</text>
               <text x={CENTER} y={CENTER + 16} className={`font-black text-[20px] transition-colors duration-300 text-center ${
                 activeItem?.id === centerData.id ? 'fill-white' : 'fill-slate-400 group-hover:fill-white'
               }`} textAnchor="middle" dominantBaseline="middle">Customer</text>
            </g>
         </svg>
      </div>
    </div>
  )
}

function Meteors({ number = 5 }: { number?: number }) {
  const [meteors, setMeteors] = useState<Array<{ id: number; top: number; left: number; delay: number; duration: number }>>([]);

  useEffect(() => {
    // Generate meteors
    const newMeteors = new Array(number).fill(true).map((_, i) => ({
      id: i,
      // Random starting positions across the top right of the section
      top: Math.random() * -100 - 100, 
      left: Math.random() * window.innerWidth + 200, 
      delay: i * 3 + Math.random() * 2, // 3s separation, some spread
      duration: Math.random() * 2 + 5, // 5-7s transit time
    }));
    setMeteors(newMeteors);
  }, [number]);

  return (
    <>
      {meteors.map((m) => (
        <span
          key={m.id}
          className="absolute h-[2px] w-[2px] rounded-full bg-white shadow-[0_0_10px_2px_rgba(255,255,255,0.8)] animate-meteor"
          style={{
            top: m.top,
            left: m.left,
            animationDelay: `${m.delay}s`,
            animationDuration: `${m.duration}s`,
          }}
        >
          {/* Meteor Tail - tail goes left because X-axis is pointed front-right relative to unrotated */}
          <div className="absolute top-1/2 right-[100%] h-[1px] w-[200px] -translate-y-1/2 bg-gradient-to-r from-transparent via-white/50 to-white" />
        </span>
      ))}
    </>
  );
}

function HelpStepCard({
  step,
  i,
  progress,
  range,
  targetScale,
}: {
  step: typeof helpSteps[number];
  i: number;
  progress: MotionValue<number>;
  range: [number, number];
  targetScale: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "start start"],
  });

  const scale = useTransform(progress, range, [1, targetScale]);
  const visualScale = useTransform(scrollYProgress, [0, 1], [1.14, 1]);
  const visualY = useTransform(scrollYProgress, [0, 1], [40, 0]);
  const isLightCard = step.color === "#E7EAEE";

  return (
    <div ref={cardRef} className="h-[78vh] min-h-[560px] md:h-[86vh]">
      <motion.article
        style={{ scale, top: `calc(5rem + ${i * 18}px)` }}
        className={`sticky mx-auto grid w-full max-w-6xl overflow-hidden rounded-[1.75rem] border p-6 shadow-[0_30px_90px_rgba(0,0,0,0.28)] md:grid-cols-[1fr_0.9fr] md:p-10 ${
          isLightCard ? "border-slate-300/40 text-slate-950" : "border-white/15 text-white"
        }`}
      >
        <div className="absolute inset-0" style={{ backgroundColor: step.color }} />
        <div className={`absolute inset-0 ${isLightCard ? "bg-white/55" : "bg-slate-950/10"}`} />

        <div className="relative z-10 flex min-h-[280px] flex-col justify-between gap-10 md:min-h-[420px]">
          <div>
            <p className={`mb-6 text-xs font-black uppercase tracking-[0.32em] ${isLightCard ? "text-brand-blue" : "text-white/70"}`}>
              {step.eyebrow}
            </p>
            <h3 className={`max-w-2xl text-3xl font-black leading-tight tracking-tight md:text-5xl ${isLightCard ? "text-slate-950" : "text-white"}`}>
              {step.title}
            </h3>
          </div>
          <p className={`max-w-xl text-base leading-relaxed md:text-xl ${isLightCard ? "text-slate-700" : "text-white/78"}`}>
            {step.description}
          </p>
        </div>

        <div className="relative z-10 mt-8 flex items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-white/10 md:mt-0">
          <motion.div
            style={{ scale: visualScale, y: visualY }}
            className={`relative aspect-square w-full max-w-[360px] rounded-full border ${
              isLightCard ? "border-brand-blue/20 bg-brand-blue/10" : "border-white/20 bg-white/10"
            }`}
          >
            <div className={`absolute inset-[12%] rounded-full border-2 ${isLightCard ? "border-brand-blue/25" : "border-white/25"}`} />
            <div className={`absolute inset-[27%] rounded-full ${isLightCard ? "bg-brand-blue" : "bg-white"}`} />
            <div className={`absolute left-1/2 top-1/2 h-[120%] w-6 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-full ${isLightCard ? "bg-brand-yellow" : "bg-brand-yellow"}`} />
            <span className={`absolute bottom-8 left-8 text-7xl font-black tracking-tight ${isLightCard ? "text-brand-blue/15" : "text-white/15"}`}>
              {step.eyebrow}
            </span>
          </motion.div>
        </div>
      </motion.article>
    </div>
  );
}

function HowWeHelp() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  return (
    <div ref={containerRef} className="relative z-10 mt-16 md:mt-28">
      <div className="mx-auto mb-12 max-w-4xl text-center md:mb-18">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-5 text-xs font-black uppercase tracking-[0.32em] text-brand-yellow"
        >
          How We Help
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.08 }}
          className="text-4xl font-black leading-tight tracking-tight text-white md:text-6xl"
        >
          From diagnosis to measurable growth.
        </motion.h2>
      </div>

      <div className="relative">
        {helpSteps.map((step, i) => {
          const targetScale = 1 - (helpSteps.length - i) * 0.035;
          return (
            <HelpStepCard
              key={step.title}
              step={step}
              i={i}
              progress={scrollYProgress}
              range={[i * 0.2, 1]}
              targetScale={targetScale}
            />
          );
        })}
      </div>
    </div>
  );
}

export function Framework() {
  const reduceEffects = useReducedEffects();

  return (
    <section id="framework" className="py-32 px-6 lg:px-12 bg-slate-950 relative overflow-hidden scroll-mt-28">
      {/* Deep Space Background */}
      <div className="absolute inset-0 bg-slate-950 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-950 to-slate-950"></div>
        {/* Star layers */}
        {!reduceEffects && (
          <>
            <div className="absolute inset-0 opacity-40 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0ibm9uZSIvPjxjaXJjbGUgY3g9IjM1IiBjeT0iNTYiIHI9IjAuNSIgZmlsbD0iI2ZmZiIvPjxjaXJjbGUgY3g9IjE3MCIgY3k9IjEyMCIgcj0iMC41IiBmaWxsPSIjZmZmIi8+PGNpcmNsZSBjeD0iMjgwIiBjeT0iODAiIHI9IjEuNSIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIwLjUiLz48Y2lyY2xlIGN4PSIzNTAiIGN5PSIyNTAiIHI9IjEiIGZpbGw9IiNmZmYiLz48Y2lyY2xlIGN4PSI4MCIgY3k9IjMzMCIgcj0iMSIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIwLjciLz48Y2lyY2xlIGN4PSIyMjAiIGN5PSIzOTAiIHI9IjAuNSIgZmlsbD0iI2ZmZiIvPjxjaXJjbGUgY3g9IjI1MCIgY3k9IjIyMCIgcj0iMSIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==')] animate-[pulse_6s_ease-in-out_infinite]"></div>
            <div className="absolute inset-0 opacity-30 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MDAiIGhlaWdodD0iNTAwIj48cmVjdCB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgZmlsbD0ibm9uZSIvPjxjaXJjbGUgY3g9IjE1MCIgY3k9IjI1MCIgcj0iMiIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIwLjMiLz48Y2lyY2xlIGN4PSI0NTAiIGN5PSIxMjAiIHI9IjEiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC41Ii8+PGNpcmNsZSBjeD0iNzAiIGN5PSI0MTAiIHI9IjEuNSIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIwLjgiLz48Y2lyY2xlIGN4PSIzODAiIGN5PSIzMTAiIHI9IjAuNSIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIwLjYiLz48L3N2Zz4=')] [background-size:250px_250px] animate-[pulse_4s_ease-in-out_infinite_reverse]"></div>
          </>
        )}
      </div>
      <div className="absolute top-1/4 right-0 w-[280px] h-[280px] md:w-[500px] md:h-[500px] bg-brand-blue/10 rounded-full blur-[70px] md:blur-[120px] pointer-events-none md:mix-blend-screen" />
      <div className="absolute bottom-1/4 left-1/4 w-[260px] h-[260px] md:w-[500px] md:h-[500px] bg-brand-yellow/5 rounded-full blur-[70px] md:blur-[120px] pointer-events-none md:mix-blend-screen" />
      
      {/* Meteors */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <Meteors number={reduceEffects ? 3 : 5} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10 pt-12">
        <InteractiveWheel />
        <HowWeHelp />
      </div>
    </section>
  );
}
