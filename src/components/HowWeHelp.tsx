import { motion, useScroll, useTransform } from "motion/react";
import type { MotionValue } from "motion/react";
import { useRef } from "react";

const steps = [
  {
    number: "01",
    title: "Business & Customer Diagnosis",
    description:
      "We help identify key pain points, blind spots, and improvement opportunities across customer experience, service delivery, and business operations.",
    accent: "#014FCF",
  },
  {
    number: "02",
    title: "Strategy & Experience Design",
    description:
      "Together with business owners and teams, we design clearer, more consistent customer strategies and experiences that stay relevant to the business goals.",
    accent: "#FFBC00",
  },
  {
    number: "03",
    title: "Implementation & Growth Improvement",
    description:
      "We guide implementation so change does not stay on paper, but improves customer loyalty, service quality, and sustainable business growth.",
    accent: "#8FB7FF",
  },
];

function ServiceCard({
  step,
  index,
  progress,
}: {
  step: typeof steps[number];
  index: number;
  progress: MotionValue<number>;
}) {
  const enterStart = index === 0 ? 0 : 0.12 + index * 0.15;
  const enterEnd = index === 0 ? 0.01 : enterStart + 0.18;
  const y = useTransform(progress, [enterStart, enterEnd], index === 0 ? ["0%", "0%"] : ["115%", "0%"]);
  const scale = useTransform(progress, [enterEnd, 1], index === 0 ? [1, 1] : [1, 1 - (steps.length - index - 1) * 0.025]);
  const accentScale = useTransform(progress, [enterStart, enterEnd], [1.16, 1]);
  const accentY = useTransform(progress, [enterStart, enterEnd], [34, 0]);

  return (
    <motion.article
      style={{ scale, y, top: index * 12, zIndex: index + 10 }}
      className="absolute inset-x-0 top-0 grid min-h-[500px] overflow-hidden rounded-[1.75rem] border border-white/12 bg-slate-950 p-7 text-white shadow-[0_34px_110px_rgba(2,6,23,0.34)] md:grid-cols-[1fr_0.82fr] md:p-10"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(255,255,255,0.12),transparent_34%),linear-gradient(135deg,#020617_0%,#0f172a_54%,#111827_100%)]" />
      <div className="absolute right-[-12%] top-[-28%] h-[420px] w-[420px] rounded-full blur-[100px]" style={{ backgroundColor: step.accent, opacity: 0.2 }} />
      <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-white/30 to-transparent" />

      <div className="relative z-10 flex flex-col justify-between gap-12">
        <div>
          <p className="mb-6 text-xs font-black uppercase tracking-[0.32em] text-white/60">
            / {step.number}
          </p>
          <h3 className="max-w-2xl text-3xl font-black leading-tight tracking-tight text-white md:text-5xl">
            {step.title}
          </h3>
        </div>
        <p className="max-w-xl text-base leading-relaxed text-slate-300 md:text-xl">
          {step.description}
        </p>
      </div>

      <div className="relative z-10 mt-10 flex min-h-[240px] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] md:mt-0">
        <motion.div
          style={{ scale: accentScale, y: accentY }}
          className="relative aspect-square w-full max-w-[320px] rounded-full bg-white/[0.04]"
        >
          <div className="absolute inset-[10%] rounded-full border-2 border-white/15" />
          <div className="absolute inset-[26%] rounded-full" style={{ backgroundColor: step.accent }} />
          <div className="absolute left-1/2 top-1/2 h-[118%] w-5 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-full bg-white/80" />
          <span className="absolute bottom-7 left-7 text-7xl font-black tracking-tight text-white/12">
            {step.number}
          </span>
        </motion.div>
      </div>
    </motion.article>
  );
}

export function HowWeHelp() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  return (
    <section id="services" className="relative bg-white px-6 py-28 scroll-mt-28 lg:px-12 lg:py-36">
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
            <p className="mb-6 text-sm font-bold uppercase tracking-[0.3em] text-brand-blue">
              How We Help
            </p>
            <h2 className="mb-8 text-4xl font-bold leading-tight tracking-tight text-slate-950 md:text-5xl lg:text-6xl">
              From Diagnosis to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-blue-500">
                Measurable Growth
              </span>
            </h2>
            <p className="max-w-md text-lg leading-relaxed text-slate-600">
              We guide business transformation through three practical phases designed to improve loyalty, service quality, and growth.
            </p>
            <div className="mt-12 h-1 w-20 rounded-full bg-gradient-to-r from-brand-blue to-brand-yellow" />
          </motion.div>

          <div className="relative min-h-[250vh]">
            <div className="sticky top-32 h-[620px] md:top-36 md:h-[640px]">
              {steps.map((step, index) => (
                <ServiceCard
                  key={step.number}
                  step={step}
                  index={index}
                  progress={scrollYProgress}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
