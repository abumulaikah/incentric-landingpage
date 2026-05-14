import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Comparison } from './components/Comparison';
import { Framework } from './components/Framework';
import { HowWeHelp } from './components/HowWeHelp';
import { Testimonials } from './components/Testimonials';
import { TeamCTA } from './components/TeamCTA';
import { Footer } from './components/Footer';

export default function App() {
  return (
    <div className="brand-app flex flex-col">
      <Navbar />
      <main className="flex-1 w-full flex flex-col">
        <Hero />
        <Comparison />
        <Framework />
        <HowWeHelp />
        <Testimonials />
        <TeamCTA />
        <Footer />
      </main>
    </div>
  );
}
