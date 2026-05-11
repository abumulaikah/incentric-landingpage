import { motion, useScroll, useTransform } from "motion/react";
import type { MotionValue } from "motion/react";
import { useRef } from "react";

const steps = [
  {
    number: "01",
    title: "Business & Customer Diagnosis",
    description:
      "We help identify key pain points, blind spots, and improvement opportunities across customer experience, service delivery, and business operations.",
    color: "#014FCF",
  },
  {
    number: "02",
    title: "Strategy & Experience Design",
    description:
      "Together with business owners and teams, we design clearer, more consistent customer strategies and experiences that stay relevant to the business goals.",
    color: "#FFBC00",
  },
  {
    number: "03",
    title: "Implementation & Growth Improvement",
    description:
      "We guide implementation so change does not stay on paper, but improves customer loyalty, service quality, and sustainable business growth.",
    color: "#E7EAEE",
  },
];

function ServiceCard({
  step,
  index,
  progress,
  targetScale,
}: {
  step: typeof steps[number];
  index: number;
  progress: MotionValue<number>;
  targetScale: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "start start"],
  });

  const scale = useTransform(progress, [index * 0.2, 1], [1, targetScale]);
  const accentScale = useTransform(scrollYProgress, [0, 1], [1.18, 1]);
  const accentY = useTransform(scrollYProgress, [0, 1], [36, 0]);
  const isYellow = step.color === "#FFBC00";
  const isLight = step.color === "#E7EAEE";

  return (
    <div ref={cardRef} className="h-[76vh] min-h-[520px] md:h-[82vh]">
      <motion.article
        style={{ scale, top: `calc(6rem + ${index * 18}px)` }}
        className={`sticky grid min-h-[440px] overflow-hidden rounded-[1.75rem] border p-7 shadow-[0_28px_80px_rgba(15,23,42,0.16)] md:grid-cols-[1fr_0.82fr] md:p-10 ${
          isLight ? "border-slate-300 text-slate-950" : "border-white/20 text-white"
        }`}
      >
        <div className="absolute inset-0" style={{ backgroundColor: step.color }} />
        <div className={`absolute inset-0 ${isYellow ? "bg-white/10" : isLight ? "bg-white/55" : "bg-slate-950/8"}`} />

        <div className="relative z-10 flex flex-col justify-between gap-12">
          <div>
            <p className={`mb-6 text-xs font-black uppercase tracking-[0.32em] ${isLight ? "text-brand-blue" : "text-white/75"}`}>
              / {step.number}
            </p>
            <h3 className={`max-w-2xl text-3xl font-black leading-tight tracking-tight md:text-5xl ${isLight ? "text-slate-950" : "text-white"}`}>
              {step.title}
            </h3>
          </div>
          <p className={`max-w-xl text-base leading-relaxed md:text-xl ${isLight ? "text-slate-700" : "text-white/82"}`}>
            {step.description}
          </p>
        </div>

        <div className="relative z-10 mt-10 flex min-h-[220px] items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-white/10 md:mt-0">
          <motion.div
            style={{ scale: accentScale, y: accentY }}
            className={`relative aspect-square w-full max-w-[320px] rounded-full ${
              isLight ? "bg-brand-blue/10" : "bg-white/10"
            }`}
          >
            <div className={`absolute inset-[10%] rounded-full border-2 ${isLight ? "border-brand-blue/25" : "border-white/25"}`} />
            <div className={`absolute inset-[26%] rounded-full ${isLight ? "bg-brand-blue" : "bg-white/90"}`} />
            <div className="absolute left-1/2 top-1/2 h-[118%] w-5 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-full bg-brand-yellow" />
            <span className={`absolute bottom-7 left-7 text-7xl font-black tracking-tight ${isLight ? "text-brand-blue/15" : "text-white/18"}`}>
              {step.number}
            </span>
          </motion.div>
        </div>
      </motion.article>
    </div>
  );
}

export function HowWeHelp() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  return (
    <section id="services" className="relative overflow-hidden bg-white px-6 py-28 scroll-mt-28 lg:px-12 lg:py-36">
      <div className="absolute right-0 top-0 h-1/2 w-1/3 rounded-bl-full bg-gradient-to-bl from-brand-blue/8 to-transparent blur-3xl" />
      <div className="absolute bottom-1/4 left-0 h-1/4 w-1/4 rounded-tr-full bg-gradient-to-tr from-brand-yellow/8 to-transparent blur-3xl" />

      <div ref={containerRef} className="relative z-10 mx-auto max-w-7xl">
        <div className="grid gap-14 lg:grid-cols-[0.86fr_1.14fr] lg:gap-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:sticky lg:top-32 lg:h-fit"
          >
            <p className="mb-6 text-sm font-black uppercase tracking-[0.3em] text-brand-blue">
              How We Help
            </p>
            <h2 className="mb-8 text-5xl font-black leading-[1.08] tracking-tight text-slate-950 md:text-6xl lg:text-7xl">
              From Diagnosis to Measurable Growth
            </h2>
            <p className="max-w-md text-lg leading-relaxed text-slate-600">
              We guide business transformation through three practical phases designed to improve loyalty, service quality, and growth.
            </p>
            <div className="mt-12 h-1 w-20 rounded-full bg-gradient-to-r from-brand-blue to-brand-yellow" />
          </motion.div>

          <div className="relative">
            {steps.map((step, index) => (
              <ServiceCard
                key={step.number}
                step={step}
                index={index}
                progress={scrollYProgress}
                targetScale={1 - (steps.length - index) * 0.035}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
