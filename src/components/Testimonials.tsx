import { motion } from "motion/react";

const testimonials = [
  {
    quote: "Incentric completely reframed how we look at customer support. We stopped seeing it as a cost center.",
    author: "Sarah D.",
    role: "VP of Operations",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop",
    logo: "TechCorp"
  },
  {
    quote: "Using the WOW Experience Loop, our customer LTV shot up by 40% in just two quarters.",
    author: "Michael T.",
    role: "Founder & CEO",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=800&auto=format&fit=crop",
    logo: "GrowthInc"
  },
  {
    quote: "They didn't just give us a strategy, they helped us build a culture. Our team is obsessed.",
    author: "Eleanor R.",
    role: "Head of Marketing",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=800&auto=format&fit=crop",
    logo: "Brandify"
  },
  {
     quote: "The integration between product and service is seamless. It feels like magic to our users.",
     author: "David L.",
     role: "Chief Product Officer",
     image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800&auto=format&fit=crop",
     logo: "InnovateCo"
  },
  {
     quote: "Retention is no longer a metric we chase; it's a natural byproduct of how we operate now.",
     author: "Jessica M.",
     role: "Customer Success Lead",
     image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=800&auto=format&fit=crop",
     logo: "ServiceNow"
  }
];

export function Testimonials() {
  return (
    <section className="py-32 bg-slate-50 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:24px_24px]"></div>
      
      <div className="container mx-auto px-6 lg:px-12 max-w-7xl relative z-10">
        <div className="text-center mb-24">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-slate-900"
          >
            We're biased.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-blue-500">Don't listen to us.</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-sm text-slate-500 uppercase tracking-[0.2em] font-bold"
          >
            Hear it from our partners
          </motion.p>
        </div>

        <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar relative w-full pt-4 pb-16 -mx-6 px-6 lg:-mx-12 lg:px-12">
          {testimonials.map((item, index) => (
            <div key={index} className="shrink-0 pr-6 md:pr-8 snap-center">
              <div className="w-[280px] md:w-[340px] aspect-[4/5] rounded-[2rem] overflow-hidden relative group cursor-pointer shadow-xl shadow-slate-300/40 border border-white/40">
                {/* Background Image */}
                <img src={item.image} alt={item.author} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />

                {/* Gradient Overlay */}
                <div className="absolute inset-x-0 bottom-0 top-1/4 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

                {/* Logo (Top Left) */}
                <div className="absolute top-6 left-6 text-white/90 font-bold text-[13px] tracking-widest uppercase flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="w-3 h-3 rounded-full bg-white"></span>
                  </div>
                  {item.logo}
                </div>

                {/* Play Button Overlay (Top Right) */}
                <div className="absolute top-6 right-6 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 transform translate-x-0 md:translate-x-2 md:group-hover:translate-x-0 z-10">
                  <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white pl-1 shadow-[0_0_15px_rgba(0,0,0,0.2)] border border-white/30 hover:bg-white/40 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                      <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>

                {/* Content (Bottom) */}
                <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col justify-end translate-y-0 md:translate-y-4 md:group-hover:translate-y-0 transition-transform duration-500">
                  <div className="text-4xl text-brand-yellow mb-1 leading-none font-serif opacity-80">"</div>
                  <p className="text-white text-xl md:text-2xl font-bold leading-tight mb-6 text-shadow-sm">
                    {item.quote}
                  </p>
                  <div>
                    <p className="text-white font-semibold text-lg">{item.author}</p>
                    <p className="text-white/70 text-sm font-medium">{item.role}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
