'use client';

import { useEffect, useRef, useState } from 'react';

/* Entrada acompanha o scroll direto (scrub), não dispara uma vez só: o
 * quanto o filho já saiu de fora da página é função da posição do elemento
 * na viewport, recalculada a cada frame de scroll. Sobe e desce nos dois
 * sentidos, sem transition brigando com o rAF.
 *
 * Era o SlideInLeft do mockup de iPhone; virou genérico porque os blocos de
 * /projetos alternam de lado e precisavam do mesmo movimento espelhado.
 *
 * Quem entra pela direita sai da largura da página enquanto está fora, então
 * o container precisa de `overflow-x: clip`, senão a página inteira ganha
 * barra de rolagem horizontal por causa de um elemento que ninguém vê.
 */

/** Altura de tela (0 = topo, 1 = base) onde o elemento começa a entrar. */
const ENTERS_AT = 1.12;
/** Altura de tela em que ele já chegou no lugar, inteiro e parado. Alto de
 *  propósito: ele termina a entrada ainda na metade de baixo da tela, com
 *  folga para ser assistido antes de sair por cima. */
const ARRIVES_AT = 0.72;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
/* smoothstep: o scrub é por frame, então a suavização vem daqui, não de
   transition, que ficaria sempre atrasada em relação ao dedo. */
const ease = (n: number) => n * n * (3 - 2 * n);

export default function SlideIn({
  children,
  className,
  from = 'left',
  /** Distância de onde ele parte, em % da própria largura. */
  distance = 120,
}: {
  children: React.ReactNode;
  className?: string;
  from?: 'left' | 'right';
  distance?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (reduced) {
      setProgress(1);
      return;
    }

    const update = () => {
      rafRef.current = 0;
      const rect = node.getBoundingClientRect();
      const vh = window.innerHeight;
      /* Medido pelo centro do elemento, não pelo topo, para a chegada não
         mudar de hora conforme a altura do conteúdo. */
      const center = (rect.top + rect.bottom) / 2;
      const p = (ENTERS_AT - center / vh) / (ENTERS_AT - ARRIVES_AT);
      setProgress(ease(clamp01(p)));
    };

    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const offset = (1 - progress) * (from === 'left' ? -distance : distance);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transform: `translateX(${offset}%)`,
        opacity: progress,
      }}
    >
      {children}
    </div>
  );
}
