import { motion } from "motion/react";
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

interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  size: number;
  angle: number;
  speed: number;
  vx: number;
  vy: number;
}

interface GridCell {
  particles: Particle[];
}

function InteractiveDots() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef<Map<string, GridCell>>(new Map());
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let frameCount = 0;
    const TARGET_FPS = 60;
    const FRAME_SKIP = 1; // Render every frame

    // Grid configuration
    const GRID_SIZE = 150; // Larger grid cells for fewer calculations
    const MAX_DISTANCE = 200;
    const CONNECTION_DISTANCE = 90;

    function getGridKey(x: number, y: number): string {
      const gridX = Math.floor(x / GRID_SIZE);
      const gridY = Math.floor(y / GRID_SIZE);
      return `${gridX},${gridY}`;
    }

    function initParticles() {
      particlesRef.current = [];
      gridRef.current.clear();

      // Adaptive density based on window size
      const screenArea = canvas.width * canvas.height;
      let density = 4000; // Reduced from 2500

      // Further reduce for mobile-like devices
      if (canvas.width < 1024) {
        density = 6000;
      } else if (screenArea > 2000000) {
        density = 3500; // Large screens
      }

      const count = Math.floor(screenArea / density);

      for (let i = 0; i < count; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const particle: Particle = {
          x,
          y,
          baseX: x,
          baseY: y,
          size: Math.random() * 0.6 + 0.2,
          angle: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.15 + 0.03,
          vx: 0,
          vy: 0,
        };
        particlesRef.current.push(particle);
      }
    }

    function rebuildGrid() {
      gridRef.current.clear();
      for (const particle of particlesRef.current) {
        const key = getGridKey(particle.baseX, particle.baseY);
        if (!gridRef.current.has(key)) {
          gridRef.current.set(key, { particles: [] });
        }
        gridRef.current.get(key)!.particles.push(particle);
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
      rebuildGrid();
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
    };

    window.addEventListener("resize", setCanvasSize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseout", handleMouseLeave);

    setCanvasSize();

    // Performance: Track FPS
    let lastTime = performance.now();
    let fps = 0;

    function animate() {
      frameCount++;

      // Only render on interval
      if (frameCount % FRAME_SKIP === 0) {
        // FPS calculation (every 30 frames)
        if (frameCount % 30 === 0) {
          const now = performance.now();
          fps = Math.round(1000 / ((now - lastTime) / 30));
          lastTime = now;
        }

        if (!ctx || !canvas) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const mouseX = mouseRef.current.x;
        const mouseY = mouseRef.current.y;

        // Update particles
        for (let i = 0; i < particlesRef.current.length; i++) {
          const p = particlesRef.current[i];

          // Idle movement
          p.baseX += Math.cos(p.angle) * p.speed;
          p.baseY += Math.sin(p.angle) * p.speed;

          // Wrap around screen boundaries
          if (p.baseX < 0) p.baseX = canvas.width;
          if (p.baseX > canvas.width) p.baseX = 0;
          if (p.baseY < 0) p.baseY = canvas.height;
          if (p.baseY > canvas.height) p.baseY = 0;

          const dx = mouseX - p.baseX;
          const dy = mouseY - p.baseY;
          const distSq = dx * dx + dy * dy;
          const maxDistSq = MAX_DISTANCE * MAX_DISTANCE;

          let opacity = 0.35;

          if (distSq > 0 && distSq < maxDistSq) {
            const distance = Math.sqrt(distSq);
            const force =
              (MAX_DISTANCE - distance) / MAX_DISTANCE;
            const smoothForce = force * force * (3 - 2 * force);

            opacity = 0.35 + 0.65 * smoothForce;

            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;

            p.x = p.baseX - forceDirectionX * smoothForce * 30;
            p.y = p.baseY - forceDirectionY * smoothForce * 30;
          } else {
            p.x += (p.baseX - p.x) * 0.12;
            p.y += (p.baseY - p.y) * 0.12;
          }

          // Draw particle
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw connections only if mouse is active
        if (mouseX !== -1000 && mouseY !== -1000) {
          // Get nearby grid cells
          const mouseGridKey = getGridKey(mouseX, mouseY);
          const [mx, my] = mouseGridKey.split(",").map(Number);

          const nearbyParticles: Particle[] = [];

          // Check 3x3 grid around mouse
          for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
              const key = `${mx + dx},${my + dy}`;
              const cell = gridRef.current.get(key);
              if (cell) {
                nearbyParticles.push(...cell.particles);
              }
            }
          }

          // Draw lines between nearby particles
          for (let i = 0; i < nearbyParticles.length; i++) {
            const p1 = nearbyParticles[i];
            const dist1Sq =
              (mouseX - p1.baseX) ** 2 + (mouseY - p1.baseY) ** 2;
            const maxDistSq = MAX_DISTANCE * MAX_DISTANCE;

            if (dist1Sq > maxDistSq) continue;

            for (let j = i + 1; j < nearbyParticles.length; j++) {
              const p2 = nearbyParticles[j];
              const pDistSq = (p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2;

              if (pDistSq < CONNECTION_DISTANCE * CONNECTION_DISTANCE) {
                const dist1 = Math.sqrt(dist1Sq);
                const dist2Sq =
                  (mouseX - p2.baseX) ** 2 + (mouseY - p2.baseY) ** 2;
                const dist2 = Math.sqrt(dist2Sq);

                if (dist2 > MAX_DISTANCE) continue;

                const opacity1 =
                  0.35 +
                  0.65 *
                    ((MAX_DISTANCE - dist1) /
                      MAX_DISTANCE);
                const opacity2 =
                  0.35 +
                  0.65 *
                    ((MAX_DISTANCE - dist2) /
                      MAX_DISTANCE);

                const pDist = Math.sqrt(pDistSq);
                const lineOpacity =
                  Math.min(opacity1, opacity2) *
                  (1 - pDist / CONNECTION_DISTANCE);

                ctx.strokeStyle = `rgba(255, 255, 255, ${lineOpacity})`;
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
              }
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

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0 mix-blend-screen opacity-100"
    />
  );
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
        setTypingSpeed(70);

        if (displayText === currentWord) {
          // Pause at the end of the word
          setIsDeleting(true);
          setTypingSpeed(words[index].duration);
        }
      } else {
        // Deleting phase: remove one char
        const nextText = currentWord.slice(0, displayText.length - 1);
        setDisplayText(nextText);
        setTypingSpeed(40);

        if (nextText === "") {
          setIsDeleting(false);
          setIndex((prev) => (prev + 1) % words.length);
          setTypingSpeed(300);
        }
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [displayText, isDeleting, index, typingSpeed]);

  return (
    <section
      id="top"
      className="relative min-h-[90vh] flex flex-col justify-center items-center text-center px-6 py-20 overflow-hidden bg-slate-950 scroll-mt-28"
    >
      {/* Background abstract elements - Gradient Orbs instead of 3D Globe */}
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
          <span
            className={`${
              words[index].text === "WOW"
                ? "text-brand-yellow drop-shadow-[0_0_15px_rgba(255,188,0,0.8)]"
                : "text-white"
            } font-bold inline-flex items-center transition-all duration-100`}
          >
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
          <a
            href="#contact"
            className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-slate-900 transition-all duration-300 bg-brand-yellow rounded-full hover:scale-105 hover:shadow-[0_20px_40px_rgba(255,188,0,0.3)]"
          >
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
          <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-6">
            Trusted by Forward-Thinking Brands
          </p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale">
            <span className="font-bold text-xl md:text-2xl text-white">
              Acme Corp
            </span>
            <span className="font-bold text-xl md:text-2xl text-white tracking-widest">
              GLOBEX
            </span>
            <span className="font-bold tracking-tighter text-xl md:text-2xl text-white">
              Soylent
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
