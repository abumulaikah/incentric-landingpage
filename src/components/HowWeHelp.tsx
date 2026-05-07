import { motion } from "motion/react";

const steps = [
  {
    number: "01",
    title: "Business & Customer Diagnosis",
    description:
      "Kami membantu mengidentifikasi titik masalah, blind spot, dan peluang perbaikan dari sisi customer experience, service, dan operational bisnis.",
  },
  {
    number: "02",
    title: "Strategy & Experience Design",
    description:
      "Bersama owner dan tim, kami menyusun strategi serta pengalaman customer yang lebih jelas, konsisten, dan relevan dengan tujuan bisnis.",
  },
  {
    number: "03",
    title: "Implementation & Growth Improvement",
    description:
      "Kami mendampingi proses implementasi agar perubahan tidak hanya berjalan di atas kertas, tetapi benar-benar meningkatkan loyalitas customer, kualitas service, dan pertumbuhan bisnis.",
  },
];

export function HowWeHelp() {
  return (
    <section className="py-32 px-6 lg:px-12 bg-white relative overflow-hidden scroll-mt-28">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-brand-blue/5 to-transparent rounded-br-full pointer-events-none -z-10 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-brand-yellow/5 to-transparent rounded-tl-full pointer-events-none -z-10 blur-3xl" />

      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="mb-20 lg:mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight text-slate-900">
              How We Help You
            </h2>
          </motion.div>
        </div>

        {/* Steps Grid */}
        <div className="grid lg:grid-cols-1 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/0 via-brand-blue/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative bg-slate-50 p-8 lg:p-12 rounded-3xl border border-slate-100/50 hover:border-brand-blue/20 transition-all duration-500 shadow-sm hover:shadow-lg hover:shadow-brand-blue/10">
                {/* Step Number - Large Background */}
                <div className="absolute top-6 right-6 lg:top-8 lg:right-8 text-7xl lg:text-8xl font-black text-slate-100 pointer-events-none select-none">
                  {step.number}
                </div>

                {/* Content */}
                <div className="relative z-10 max-w-2xl">
                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
                    {step.title}
                  </h3>

                  <p className="text-base md:text-lg text-slate-600 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Accent line */}
                  <div className="mt-6 h-1 w-12 bg-gradient-to-r from-brand-blue to-brand-yellow rounded-full" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
