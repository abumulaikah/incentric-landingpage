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
  const cardOffset = index * 32;
  const enterRanges = [
    [0, 0.01],
    [0.26, 0.46],
    [0.52, 0.72],
  ];
  const [enterStart, enterEnd] = enterRanges[index];
  const y = useTransform(
    progress,
    [enterStart, enterEnd, 1],
    index === 0 ? [cardOffset, cardOffset, cardOffset] : [620, cardOffset, cardOffset],
  );
  const scale = useTransform(
    progress,
    [0, enterRanges[1][1], enterRanges[2][1], 1],
    index === 0
      ? [1, 0.965, 0.93, 0.93]
      : index === 1
        ? [1, 1, 0.965, 0.965]
        : [1, 1, 1, 1],
  );
  const accentScale = useTransform(progress, [enterStart, enterEnd], [1.12, 1]);
  const accentY = useTransform(progress, [enterStart, enterEnd], [28, 0]);

  return (
    <motion.article
      style={{ scale, y, zIndex: index + 1, transformOrigin: "top center" }}
      className="absolute inset-x-0 top-0 grid h-[min(620px,calc(100svh-7rem))] min-h-[460px] overflow-hidden rounded-[1.75rem] border border-white/12 bg-slate-950 p-6 text-white shadow-[0_34px_110px_rgba(2,6,23,0.34)] sm:min-h-[500px] md:h-[min(640px,calc(100svh-8rem))] md:grid-cols-[1fr_0.82fr] md:p-10 lg:min-h-[520px]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(255,255,255,0.12),transparent_34%),linear-gradient(135deg,#020617_0%,#0f172a_54%,#111827_100%)]" />
      <div className="absolute right-[-12%] top-[-28%] h-[420px] w-[420px] rounded-full blur-[100px]" style={{ backgroundColor: step.accent, opacity: 0.2 }} />
      <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-white/30 to-transparent" />

      <div className="relative z-10 flex min-h-0 flex-col justify-between gap-8 md:gap-12">
        <div>
          <p className="mb-4 text-xs font-black uppercase tracking-[0.32em] text-white/60 md:mb-6">
            / {step.number}
          </p>
          <h3 className="max-w-2xl text-2xl font-black leading-tight tracking-tight text-white sm:text-3xl md:text-4xl lg:text-5xl">
            {step.title}
          </h3>
        </div>
        <p className="max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base md:text-lg lg:text-xl">
          {step.description}
        </p>
      </div>

      <div className="relative z-10 mt-6 flex min-h-[150px] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] sm:min-h-[190px] md:mt-0 md:min-h-[240px]">
        <motion.div
          style={{ scale: accentScale, y: accentY }}
          className="relative aspect-square w-[min(72vw,300px)] max-w-[320px] rounded-full bg-white/[0.04] md:w-full"
        >
          <div className="absolute inset-[10%] rounded-full border-2 border-white/15" />
          <div className="absolute inset-[26%] rounded-full" style={{ backgroundColor: step.accent }} />
          <div className="absolute left-1/2 top-1/2 h-[112%] w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-full bg-white/80 sm:w-5" />
          <span className="absolute bottom-5 left-5 text-6xl font-black tracking-tight text-white/12 sm:bottom-7 sm:left-7 sm:text-7xl">
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
    <section id="services" className="relative bg-white px-6 py-20 scroll-mt-28 lg:px-12 lg:py-28">
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

          <div className="relative min-h-[330vh]">
            <div className="sticky top-20 h-[calc(100svh-5rem)] lg:top-24 lg:h-[calc(100svh-6rem)]">
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
