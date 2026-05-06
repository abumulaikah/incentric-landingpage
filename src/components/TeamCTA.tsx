import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";

interface TeamMember {
  id: number;
  name: string;
  role: string;
  image: string;
  size: "small" | "medium" | "large";
}

const team: TeamMember[] = [
  { id: 1, name: "Alex Bennett", role: "Founder & CEO", image: "https://xsgames.co/randomusers/assets/avatars/male/1.jpg", size: "large" },
  { id: 2, name: "Sarah Chen", role: "Head of CX", image: "https://xsgames.co/randomusers/assets/avatars/female/2.jpg", size: "medium" },
  { id: 3, name: "Michael Ross", role: "Behavioral Lead", image: "https://xsgames.co/randomusers/assets/avatars/male/3.jpg", size: "small" },
  { id: 4, name: "Elena Petrova", role: "Design Director", image: "https://xsgames.co/randomusers/assets/avatars/female/4.jpg", size: "medium" },
  { id: 5, name: "David Okafor", role: "UX Strategist", image: "https://xsgames.co/randomusers/assets/avatars/male/5.jpg", size: "small" },
  { id: 6, name: "Maya Lin", role: "Service Designer", image: "https://xsgames.co/randomusers/assets/avatars/female/6.jpg", size: "medium" },
  { id: 7, name: "James Wilson", role: "Product Manager", image: "https://xsgames.co/randomusers/assets/avatars/male/7.jpg", size: "large" },
  { id: 8, name: "Sofia Gaitan", role: "Customer Insights", image: "https://xsgames.co/randomusers/assets/avatars/female/8.jpg", size: "small" },
  { id: 9, name: "Kenzo Tanaka", role: "Data Scientist", image: "https://xsgames.co/randomusers/assets/avatars/male/9.jpg", size: "medium" },
  { id: 10, name: "Amara Singh", role: "CX Analyst", image: "https://xsgames.co/randomusers/assets/avatars/female/10.jpg", size: "small" },
  { id: 11, name: "Liam O'Connor", role: "Creative Producer", image: "https://xsgames.co/randomusers/assets/avatars/male/11.jpg", size: "medium" },
  { id: 12, name: "Isabella Vucci", role: "UI Designer", image: "https://xsgames.co/randomusers/assets/avatars/female/12.jpg", size: "small" },
  { id: 13, name: "Gabriel Souza", role: "Motion Architect", image: "https://xsgames.co/randomusers/assets/avatars/male/13.jpg", size: "medium" },
  { id: 14, name: "Hanna Schmidt", role: "Process Design", image: "https://xsgames.co/randomusers/assets/avatars/female/14.jpg", size: "small" },
  { id: 15, name: "Noah Williams", role: "Client Partner", image: "https://xsgames.co/randomusers/assets/avatars/male/15.jpg", size: "medium" },
];

function TeamCard({ member, className }: { member: TeamMember, className?: string }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      layout
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={() => setIsHovered(!isHovered)}
      className={`relative rounded-3xl overflow-hidden bg-slate-100 cursor-pointer group ${className} min-h-[200px] md:min-h-[250px]`}
    >
      <motion.img
        src={member.image}
        alt={member.name}
        className="w-full h-full object-cover transition-all duration-500"
        initial={{ scale: 1.1 }}
        animate={{ 
          scale: [1.1, 1.12, 1.1],
          x: [0, 5, 0],
          y: [0, -5, 0]
        }}
        transition={{ 
          duration: 10 + member.id % 4, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      />
      
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-xl z-20"
          >
            <p className="text-slate-900 font-bold text-sm md:text-base leading-tight">{member.role}</p>
            <p className="text-slate-500 text-xs md:text-sm mt-1">{member.name}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute inset-0 bg-brand-blue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </motion.div>
  );
}

export function TeamCTA() {
  return (
    <section id="team" className="py-24 lg:py-40 bg-[#e7eaee] relative overflow-hidden scroll-mt-28">
      <div className="container mx-auto px-6 mb-16 text-center">
        <motion.span 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-brand-blue font-bold uppercase tracking-[0.3em] text-xs mb-4 block"
        >
          Our Collective
        </motion.span>
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight"
        >
          Meet Our Team
        </motion.h2>
      </div>

      <div className="relative flex flex-col gap-8">
        {/* First Row - Moving Left */}
        <div className="flex overflow-hidden group">
          <motion.div 
            animate={{ x: [0, "-50%"] }}
            transition={{ 
              duration: 60, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="flex gap-6 whitespace-nowrap"
          >
            {[...team, ...team].map((member, idx) => (
              <TeamCard 
                key={`${member.id}-${idx}`} 
                member={member} 
                className="w-[300px] md:w-[400px] flex-shrink-0 !rounded-2xl" 
              />
            ))}
          </motion.div>
        </div>

        {/* Second Row - Moving Right */}
        <div className="flex overflow-hidden group">
          <motion.div 
            initial={{ x: "-50%" }}
            animate={{ x: 0 }}
            transition={{ 
              duration: 75, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="flex gap-6 whitespace-nowrap"
          >
            {[...team.slice().reverse(), ...team.slice().reverse()].map((member, idx) => (
              <TeamCard 
                key={`${member.id}-rev-${idx}`} 
                member={member} 
                className="w-[300px] md:w-[400px] flex-shrink-0 !rounded-2xl" 
              />
            ))}
          </motion.div>
        </div>
      </div>


    </section>
  );
}
