import Hero from '@/components/Hero';
import Projects from '@/components/Projects';

export default function Home() {
  return (
    <main className="relative z-10 flex-1">
      <Hero />
      <Projects />
    </main>
  );
}
