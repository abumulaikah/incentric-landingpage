import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Comparison } from './components/Comparison';
import { Framework } from './components/Framework';
import { Testimonials } from './components/Testimonials';
import { TeamCTA } from './components/TeamCTA';
import { Footer } from './components/Footer';
import { motion } from 'motion/react';

export default function App() {
  return (
    <div className="font-sans text-slate-900 min-h-screen bg-slate-50 flex flex-col selection:bg-brand-yellow selection:text-slate-900 overflow-x-hidden">
      <Navbar />
      <main className="flex-1 w-full flex flex-col">
        <Hero />
        <Comparison />
        <Framework />
        <Testimonials />
        <TeamCTA />
        <Footer />
      </main>
    </div>
  );
}

