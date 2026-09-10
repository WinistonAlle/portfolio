import type { Metadata } from 'next';
import Projects from '@/components/Projects';

export const metadata: Metadata = {
  title: 'Projetos — Winiston Alle',
  description:
    'Um pouco do meu trabalho: projetos de cliente, produtos próprios, trabalhos de faculdade e o que ainda está em construção.',
};

export default function ProjetosPage() {
  return (
    <main className="relative z-10 flex-1">
      <Projects />
    </main>
  );
}
