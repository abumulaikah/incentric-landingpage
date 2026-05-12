import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { useReducedEffects } from "../hooks/useReducedEffects";

interface TeamMember {
  id: number;
  name: string;
  role: string;
  image: string;
}

const teamImages = import.meta.glob("../assets/team/*.jpg", {
  eager: true,
  import: "default",
}) as Record<string, string | { src: string }>;

const getTeamImage = (fileName: string) => {
  const image = teamImages[`../assets/team/${fileName}`];
  return typeof image === "string" ? image : image.src;
};

const team: TeamMember[] = [
  { id: 1, name: "Arisdiansah", role: "CEO", image: getTeamImage("arisdiansah.jpg") },
  { id: 2, name: "Yana Sandhi", role: "COO", image: getTeamImage("yana.jpg") },
  { id: 3, name: "Ronald Healtha", role: "Service Experience Consultant", image: getTeamImage("ronald.jpg") },
  { id: 4, name: "Wahyu Teguh", role: "CRM Ecosystem Designer", image: getTeamImage("wahyu.jpg") },
  { id: 5, name: "Al Fitra N", role: "CX Analyst", image: getTeamImage("fitra.jpg") },
  { id: 6, name: "Yusuf Siddiq", role: "CX Researcher", image: getTeamImage("yusuf.jpg") },
  { id: 7, name: "Hidayatullah", role: "Tech Support", image: getTeamImage("dayat.jpg") },
  { id: 8, name: "Akbar Pratama", role: "Visual Designer", image: getTeamImage("akbar.jpg") },
  { id: 9, name: "Safrudin Azis", role: "Videographer", image: getTeamImage("azis.jpg") },
  { id: 10, name: "Dhimas Bekti", role: "Video Editor", image: getTeamImage("dhimas.jpg") },
  { id: 11, name: "Putri Dewi", role: "Client Relation Officer", image: getTeamImage("putri.jpg") },
  { id: 12, name: "Ambarwati", role: "Operations Assistant", image: getTeamImage("ambar.jpg") },
  { id: 13, name: "Sheis Aisyah", role: "Marketing Officer", image: getTeamImage("sheis.jpg") },
];

function TeamCard({ member, className, reduceEffects }: { member: TeamMember, className?: string, reduceEffects: boolean }) {
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
        initial={reduceEffects ? false : { scale: 1.1 }}
        animate={reduceEffects ? undefined : { 
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
  const reduceEffects = useReducedEffects();
  const firstRow = [...team, ...team];
  const secondRow = [...team.slice().reverse(), ...team.slice().reverse()];

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
              duration: reduceEffects ? 75 : 60, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="flex gap-6 whitespace-nowrap"
          >
            {firstRow.map((member, idx) => (
              <TeamCard 
                key={`${member.id}-${idx}`} 
                member={member} 
                reduceEffects={reduceEffects}
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
              duration: reduceEffects ? 90 : 75, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="flex gap-6 whitespace-nowrap"
          >
            {secondRow.map((member, idx) => (
              <TeamCard 
                key={`${member.id}-rev-${idx}`} 
                member={member} 
                reduceEffects={reduceEffects}
                className="w-[300px] md:w-[400px] flex-shrink-0 !rounded-2xl" 
              />
            ))}
          </motion.div>
        </div>
      </div>


    </section>
  );
}
