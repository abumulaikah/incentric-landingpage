import { motion, useScroll, useTransform } from "motion/react";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useReducedEffects } from "../hooks/useReducedEffects";

const words = [
  { text: "WOW", duration: 3000 },
  { text: "meaningful", duration: 1000 },
  { text: "unforgettable", duration: 1000 },
  { text: "stunning", duration: 1000 },
  { text: "remarkable", duration: 1000 },
  { text: "lasting", duration: 1000 },
];

function GlobeBackground() {
  const { scrollYProgress } = useScroll({
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 45]);

  return (
    <motion.div 
      style={{ y, rotate, perspective: 1500 }}
      className="absolute -right-[15%] -top-[15%] w-[1100px] h-[1100px] pointer-events-none z-0 opacity-90 mix-blend-screen"
    >
      <div className="relative w-full h-full" style={{ transformStyle: 'preserve-3d' }}>
        {/* Longitudinal lines */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={`long-${i}`}
            className="absolute inset-0 border border-brand-blue/60 rounded-full"
            style={{ 
              transformStyle: 'preserve-3d',
              rotateY: i * 15,
            }}
            animate={{ rotateY: [i * 15, i * 15 + 360] }}
            transition={{ duration: 40 + i, repeat: Infinity, ease: "linear" }}
          />
        ))}
        {/* Latitudinal lines */}
        {[...Array(8)].map((_, i) => (
          <div
            key={`lat-${i}`}
            className="absolute inset-0 border border-brand-blue/50 rounded-full"
            style={{ 
              transform: `translateZ(${(i - 4) * 130}px) scale(${1 - Math.abs(i - 4) * 0.12})`,
              top: '0',
              bottom: '0',
              left: '0',
              right: '0',
              margin: 'auto',
              width: '100%',
              height: '100%',
              borderRadius: '100%',
              transformStyle: 'preserve-3d'
            }}
          />
        ))}
        {/* Glow effect */}
        <div className="absolute inset-0 bg-brand-blue/30 rounded-full blur-[150px]" />
      </div>
    </motion.div>
  );
}

function InteractiveDots() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let mouseX = -1000;
    let mouseY = -1000;

    interface Particle {
      x: number;
      y: number;
      baseX: number;
      baseY: number;
      size: number;
      angle: number;
      speed: number;
    }

    let particles: Particle[] = [];

    function initParticles() {
      particles = [];
      const density = 2500; // Pixels per particle (smaller = denser)
      const count = Math.floor((canvas!.width * canvas!.height) / density);

      for (let i = 0; i < count; i++) {
        const x = Math.random() * canvas!.width;
        const y = Math.random() * canvas!.height;
        particles.push({
          x: x,
          y: y,
          baseX: x,
          baseY: y,
          size: Math.random() * 0.8 + 0.2, // Smaller sizes (0.2 to 1.0)
          angle: Math.random() * Math.PI * 2, // Random direction
          speed: Math.random() * 0.2 + 0.05, // Slow constant movement
        });
      }
    }

    const setCanvasSize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.offsetWidth;
        canvas.height = parent.offsetHeight;
      } else {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
      initParticles();
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };

    window.addEventListener("resize", setCanvasSize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseout", handleMouseLeave);

    setCanvasSize();

    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const maxDistance = 200;
      const connectionDistance = 90;

      for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        
        // Idle movement
        p.baseX += Math.cos(p.angle) * p.speed;
        p.baseY += Math.sin(p.angle) * p.speed;

        // Wrap around screen boundaries
        if (p.baseX < 0) p.baseX = canvas.width;
        if (p.baseX > canvas.width) p.baseX = 0;
        if (p.baseY < 0) p.baseY = canvas.height;
        if (p.baseY > canvas.height) p.baseY = 0;

        let dx = mouseX - p.baseX;
        let dy = mouseY - p.baseY;
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        let opacity = 0.4;
        let drawSize = p.size;
        
        if (distance > 0 && distance < maxDistance) {
          let force = (maxDistance - distance) / maxDistance;
          force = force * force * (3 - 2 * force);
          
          opacity = 0.4 + (0.6 * force);
          
          let forceDirectionX = dx / distance;
          let forceDirectionY = dy / distance;
          
          p.x = p.baseX - forceDirectionX * force * 30;
          p.y = p.baseY - forceDirectionY * force * 30;
        } else {
          p.x += (p.baseX - p.x) * 0.1;
          p.y += (p.baseY - p.y) * 0.1;
        }

        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.arc(p.x, p.y, drawSize, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw lines between nearby particles if close to mouse
      if (mouseX !== -1000) {
        for (let i = 0; i < particles.length; i++) {
          const p1 = particles[i];
          const dist1 = Math.hypot(mouseX - p1.baseX, mouseY - p1.baseY);
          if (dist1 > maxDistance) continue;

          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dist2 = Math.hypot(mouseX - p2.baseX, mouseY - p2.baseY);
            if (dist2 > maxDistance) continue;

            const pDist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
            if (pDist < connectionDistance) {
              const opacity1 = 0.4 + 0.6 * ((maxDistance - dist1) / maxDistance);
              const opacity2 = 0.4 + 0.6 * ((maxDistance - dist2) / maxDistance);
              const lineOpacity = Math.min(opacity1, opacity2) * (1 - pDist / connectionDistance);
              
              ctx.beginPath();
              ctx.strokeStyle = `rgba(255, 255, 255, ${lineOpacity})`;
              ctx.lineWidth = 0.6;
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener("resize", setCanvasSize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseout", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0 mix-blend-screen opacity-100" />;
}

export function Hero() {
  const reduceEffects = useReducedEffects();
  const [index, setIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [displayText, setDisplayText] = useState("");
  const [typingSpeed, setTypingSpeed] = useState(50);

  useEffect(() => {
    const handleTyping = () => {
      const currentWord = words[index].text;
      
      if (!isDeleting) {
        // Typing phase: add one char
        const nextText = currentWord.slice(0, displayText.length + 1);
        setDisplayText(nextText);
        setTypingSpeed(70); // Slightly slower for more "natural" feel

        if (displayText === currentWord) {
          // Pause at the end of the word
          setIsDeleting(true);
          setTypingSpeed(words[index].duration);
        }
      } else {
        // Deleting phase: remove one char
        const nextText = currentWord.slice(0, displayText.length - 1);
        setDisplayText(nextText);
        setTypingSpeed(40); // Faster deletion

        if (nextText === "") {
          setIsDeleting(false);
          setIndex((prev) => (prev + 1) % words.length);
          setTypingSpeed(300); // Small pause before typing next word
        }
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [displayText, isDeleting, index, typingSpeed]);

  return (
    <section id="top" className="relative min-h-[90vh] flex flex-col justify-center items-center text-center px-6 py-20 overflow-hidden bg-slate-950 scroll-mt-28">
      {!reduceEffects && <GlobeBackground />}
      {/* Background abstract elements */}
      <div className="absolute top-1/4 left-1/4 w-[280px] h-[280px] md:w-[500px] md:h-[500px] bg-brand-blue/25 md:bg-brand-blue/30 rounded-full blur-[70px] md:blur-[120px] pointer-events-none md:mix-blend-screen" />
      <div className="absolute bottom-1/4 right-1/4 w-[260px] h-[260px] md:w-[500px] md:h-[500px] bg-brand-yellow/15 md:bg-brand-yellow/20 rounded-full blur-[70px] md:blur-[120px] pointer-events-none md:mix-blend-screen" />
      
      {/* Interactive Dots Layer */}
      {!reduceEffects && <InteractiveDots />}

      <div className="w-full max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center mt-16 lg:mt-24"
        >
          <h1 className="text-5xl md:text-7xl xl:text-[5rem] font-bold leading-[1.1] tracking-tight mb-8 text-white">
            A great product is{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-yellow to-yellow-200">
              no longer
            </span>{" "}
            enough to win.
          </h1>
        </motion.div>

        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="text-lg md:text-2xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed min-h-[4rem]"
        >
          We help you craft{" "}
          <span className={`${words[index].text === "WOW" ? "text-brand-yellow drop-shadow-[0_0_15px_rgba(255,188,0,0.8)]" : "text-white"} font-bold inline-flex items-center transition-all duration-300`}>
            {displayText}
            <span className="w-[3px] h-[1.2em] bg-brand-yellow ml-1 animate-pulse" />
          </span>{" "}
          <span className="font-bold text-white">experiences</span>
          <br />
          to grow your loyal customers.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <a href="#contact" className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-slate-900 transition-all duration-300 bg-brand-yellow rounded-full hover:scale-105 hover:shadow-[0_0_40px_rgba(255,188,0,0.4)] overflow-hidden tracking-[0.1em] text-sm md:text-base uppercase w-full sm:w-auto">
            <span className="relative z-10 flex items-center justify-center">
              Transform Your CX
              <ArrowRight className="w-5 h-5 ml-3 transition-transform duration-300 group-hover:translate-x-2" />
            </span>
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-24 flex flex-col items-center opacity-60"
        >
          <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-6">Trusted by Forward-Thinking Brands</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale">
              <span className="font-bold text-xl md:text-2xl text-white">Acme Corp</span>
              <span className="font-bold text-xl md:text-2xl text-white tracking-widest">GLOBEX</span>
              <span className="font-bold tracking-tighter text-xl md:text-2xl text-white">Soylent</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
