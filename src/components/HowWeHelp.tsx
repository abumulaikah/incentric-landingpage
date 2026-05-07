import { motion } from "motion/react";

const steps = [
  {
    number: "01",
    title: "Business & Customer Diagnosis",
    description:
      "Kami membantu mengidentifikasi titik masalah, blind spot, dan peluang perbaikan dari sisi customer experience, service, dan operational bisnis.",
    features: [
      "CUSTOMER JOURNEY MAPPING",
      "PAIN POINT ANALYSIS",
      "OPERATIONAL ASSESSMENT",
      "COMPETITIVE BENCHMARKING",
    ],
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop",
  },
  {
    number: "02",
    title: "Strategy & Experience Design",
    description:
      "Bersama owner dan tim, kami menyusun strategi serta pengalaman customer yang lebih jelas, konsisten, dan relevan dengan tujuan bisnis.",
    features: [
      "STRATEGIC ROADMAP DESIGN",
      "EXPERIENCE ARCHITECTURE",
      "SERVICE BLUEPRINT CREATION",
      "CUSTOMER-CENTRIC FRAMEWORKS",
    ],
    image: "https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=600&h=400&fit=crop",
  },
  {
    number: "03",
    title: "Implementation & Growth Improvement",
    description:
      "Kami mendampingi proses implementasi agar perubahan tidak hanya berjalan di atas kertas, tetapi benar-benar meningkatkan loyalitas customer, kualitas service, dan pertumbuhan bisnis.",
    features: [
      "IMPLEMENTATION ROADMAP",
      "TEAM ENABLEMENT PROGRAMS",
      "PERFORMANCE TRACKING SYSTEMS",
      "CONTINUOUS IMPROVEMENT CYCLES",
    ],
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop",
  },
];

export function HowWeHelp() {
  return (
    <section className="py-32 px-6 lg:px-12 bg-slate-950 relative overflow-hidden scroll-mt-28">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-brand-blue/10 to-transparent rounded-bl-full pointer-events-none -z-10 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-brand-yellow/5 to-transparent rounded-tr-full pointer-events-none -z-10 blur-3xl" />

      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="mb-8 lg:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-brand-yellow mb-4">
              SERVICES
            </p>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight text-white mb-6">
              How We Help You
            </h2>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl leading-relaxed">
              Kami mendampingi transformasi bisnis Anda melalui tiga tahap strategis yang terukur dan berdampak langsung pada pertumbuhan.
            </p>
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
              transition={{ duration: 0.8, delay: index * 0.15 }}
              className="group"
            >
              <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
                {/* Content - Left side */}
                <div className="flex flex-col justify-between">
                  <div>
                    {/* Number */}
                    <div className="mb-6">
                      <p className="text-brand-yellow text-sm font-bold tracking-[0.2em] mb-3">
                        / {step.number}
                      </p>
                      <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight">
                        {step.title}
                      </h3>
                    </div>

                    {/* Description */}
                    <p className="text-base md:text-lg text-slate-400 leading-relaxed mb-8">
                      {step.description}
                    </p>
                  </div>

                  {/* Features List */}
                  <div className="space-y-3">
                    {step.features.map((feature, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.15 + i * 0.05 }}
                        className="flex items-center gap-3 text-slate-500 group/feature hover:text-brand-yellow transition-colors duration-300"
                      >
                        <div className="w-1 h-1 rounded-full bg-brand-blue group-hover/feature:bg-brand-yellow transition-colors duration-300" />
                        <p className="text-xs font-medium tracking-wider">{feature}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Image - Right side */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.15 + 0.1 }}
                  className="relative h-80 lg:h-full min-h-[400px] rounded-2xl overflow-hidden border border-slate-800 group-hover:border-brand-blue/50 transition-all duration-500 shadow-2xl"
                >
                  {/* Image */}
                  <img
                    src={step.image}
                    alt={step.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />

                  {/* Corner accent */}
                  <div className="absolute top-6 right-6 w-12 h-12 border-t-2 border-r-2 border-brand-yellow/30 group-hover:border-brand-yellow/60 transition-colors duration-500" />
                </motion.div>
              </div>

              {/* Divider */}
              {index < steps.length - 1 && (
                <div className="mt-12 lg:mt-16 h-px bg-gradient-to-r from-slate-800 via-brand-blue/20 to-transparent" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
