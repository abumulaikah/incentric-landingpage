import { motion } from "motion/react";
import { useState } from "react";

const steps = [
  {
    number: "01",
    title: "Business & Customer Diagnosis",
    description:
      "We help you identify key pain points, blind spots, and improvement opportunities across customer experience, service delivery, and operational efficiency.",
  },
  {
    number: "02",
    title: "Strategy & Experience Design",
    description:
      "Working together with your leadership team, we develop comprehensive strategies and customer experiences that are clearer, more consistent, and directly aligned with your business goals.",
  },
  {
    number: "03",
    title: "Implementation & Growth Improvement",
    description:
      "We guide your implementation process to ensure changes don't just exist on paper, but truly drive customer loyalty, service quality, and sustainable business growth.",
  },
];

export function HowWeHelp() {
  const [hoveredStep, setHoveredStep] = useState<string | null>(null);

  return (
    <section className="py-32 px-6 lg:px-12 bg-white relative overflow-hidden scroll-mt-28">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-gradient-to-bl from-brand-blue/8 to-transparent rounded-bl-full pointer-events-none -z-10 blur-3xl" />
      <div className="absolute bottom-1/4 left-0 w-1/4 h-1/4 bg-gradient-to-tr from-brand-yellow/5 to-transparent rounded-tr-full pointer-events-none -z-10 blur-3xl" />

      <div className="max-w-7xl mx-auto">
        {/* Main Grid: Left (Header) + Right (Content) */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* LEFT SIDE - Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="sticky top-32"
          >
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-brand-blue mb-6">
              SERVICES
            </p>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.15] tracking-tight text-slate-900 mb-8">
              How We Help You
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed max-w-md">
              We guide your business transformation through three strategic phases designed to drive measurable impact on customer loyalty and growth.
            </p>

            {/* Decorative line */}
            <div className="mt-12 h-1 w-20 bg-gradient-to-r from-brand-blue to-brand-yellow rounded-full" />
          </motion.div>

          {/* RIGHT SIDE - Content Cards */}
          <div className="space-y-6 lg:space-y-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.15 }}
                onMouseEnter={() => setHoveredStep(step.number)}
                onMouseLeave={() => setHoveredStep(null)}
                className="group relative"
              >
                {/* Card Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-slate-50 to-white rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Card Container */}
                <div className="relative bg-slate-50 p-8 lg:p-10 rounded-3xl border border-slate-200 group-hover:border-brand-blue/30 transition-all duration-500 shadow-md group-hover:shadow-xl group-hover:shadow-brand-blue/10 overflow-hidden">
                  {/* Number Background - Large */}
                  <div className="absolute top-4 right-6 text-8xl lg:text-9xl font-black text-slate-100 pointer-events-none select-none opacity-40 group-hover:opacity-60 transition-opacity duration-500">
                    {step.number}
                  </div>

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Number Label */}
                    <p className="text-brand-blue text-xs font-bold tracking-[0.2em] mb-3 inline-block">
                      / {step.number}
                    </p>

                    {/* Title */}
                    <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 mb-4 leading-tight tracking-tight group-hover:text-brand-blue transition-colors duration-300">
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="text-base text-slate-700 leading-relaxed group-hover:text-slate-900 transition-colors duration-300">
                      {step.description}
                    </p>
                  </div>

                  {/* Corner Accent - Top Right */}
                  <div className="absolute top-6 right-8 w-10 h-10 border-t-2 border-r-2 border-brand-blue/20 group-hover:border-brand-blue/50 transition-colors duration-500 rounded-tr-lg" />

                  {/* Corner Accent - Bottom Left */}
                  <div className="absolute bottom-6 left-8 w-8 h-8 border-b-2 border-l-2 border-brand-yellow/20 group-hover:border-brand-yellow/50 transition-colors duration-500 rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
