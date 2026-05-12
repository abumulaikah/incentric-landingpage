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
  const targetScale = 1 - (steps.length - index - 1) * 0.04;
  const start = index * 0.25;
  const scale = useTransform(progress, [start, 1], [1, targetScale]);

  return (
    <div className="sticky top-0 flex h-screen items-center justify-center">
      <motion.article
        style={{ scale, top: index * 30, zIndex: index + 1, transformOrigin: "top center" }}
        className="relative flex h-[min(620px,calc(100svh-7rem))] min-h-[460px] w-full overflow-hidden rounded-[1.75rem] border border-white/12 bg-slate-950 p-8 text-white shadow-[0_34px_110px_rgba(2,6,23,0.34)] sm:min-h-[500px] md:h-[min(640px,calc(100svh-8rem))] md:p-12 lg:min-h-[520px]"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(255,255,255,0.12),transparent_34%),linear-gradient(135deg,#020617_0%,#0f172a_54%,#111827_100%)]" />
        <div className="absolute right-[-12%] top-[-28%] h-[420px] w-[420px] rounded-full blur-[100px]" style={{ backgroundColor: step.accent, opacity: 0.2 }} />
        <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-white/30 to-transparent" />

        <div className="relative z-10 flex min-h-0 w-full flex-col justify-between gap-10">
          <div className="relative pt-10 md:pt-14">
            <span className="pointer-events-none absolute -left-3 -top-6 select-none text-[8rem] font-bold leading-none tracking-tight text-slate-400/30 sm:text-[10rem] md:-top-10 md:text-[13rem]">
              {step.number}
            </span>
            <h3 className="relative z-10 max-w-2xl text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
              {step.title}
            </h3>
          </div>
          <div>
            <div className="mb-7 h-1 w-16 rounded-full" style={{ backgroundColor: step.accent }} />
            <p className="max-w-2xl text-base leading-relaxed text-slate-300 md:text-lg lg:text-xl">
              {step.description}
            </p>
          </div>
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
    <section id="services" className="relative bg-white px-6 py-16 scroll-mt-28 lg:px-12 lg:py-24">
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
          </motion.div>

          <div className="relative">
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
    </section>
  );
}
