'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/* Entrada em cascata das pílulas quando a seção chega na tela. Só esconde o
   que ainda está abaixo da tela, então ninguém vê nada piscar. Rolagem e não
   IntersectionObserver: um salto grande (tecla End) passa por cima sem a
   lista cruzar a tela e o observer nunca dispararia. */
export default function CertificationsReveal({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<'idle' | 'wait' | 'play'>('idle');

  useEffect(() => {
    const el = ref.current;
    if (!el || el.getBoundingClientRect().top < window.innerHeight) return;
    setPhase('wait');
    const check = () => {
      if (el.getBoundingClientRect().top > window.innerHeight * 0.85) return;
      setPhase('play');
      window.removeEventListener('scroll', check);
    };
    window.addEventListener('scroll', check, { passive: true });
    return () => window.removeEventListener('scroll', check);
  }, []);

  return (
    <div ref={ref} data-phase={phase} className={className}>
      {children}
    </div>
  );
}
