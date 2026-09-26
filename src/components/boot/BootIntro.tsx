'use client';

/* Abertura da home: o nome "Winiston Alle" desenhado com traços SVG
   (winiston-loader.ts), que no fim entrega a tela pra cortina de pixel
   (revealPage) em vez de sair sozinho, pra ficar consistente com a navegação
   do resto do site.

   O "ligar" de verdade acontece no crachá 3D: a física do Lanyard fica
   pausada (veja `active`/`paused` em LanyardBadge.tsx e Lanyard.jsx) até o
   exato instante em que a cortina abre, então o usuário vê o crachá cair e
   assentar ao mesmo tempo em que a página é revelada — em vez de já estar
   parado atrás do overlay.

   Clique, Esc, Enter ou espaço pulam direto pro nome pronto.

   Roda toda vez que a home monta — inclusive em refresh e em navegação de
   volta pra home — não fica preso a sessionStorage. */

import { useEffect, useRef, useState } from 'react';
import { usePixelTransition } from '@/components/transition/PixelTransition';
import { playLoader, type LoaderColors } from './winiston-loader';

/* A paleta do site: branco e azul de destaque dos tokens do globals.css, mais
   um azul-céu como segunda cor, no lugar do verde do loader original, pra
   animação ficar na mesma família do resto do portfólio. */
const COLORS: LoaderColors = {
  white: '#f3f6ff',
  blue: '#5b9cff',
  green: '#7dd3fc',
};

type Phase = 'boot' | 'done';

export default function BootIntro({
  onHandOff,
}: {
  onHandOff?: () => void;
}) {
  const { revealPage, setBootActive } = usePixelTransition();
  const [phase, setPhase] = useState<Phase>('boot');
  const stageRef = useRef<HTMLDivElement>(null);
  const handedOffRef = useRef(false);

  const handOff = () => {
    if (handedOffRef.current) return;
    handedOffRef.current = true;
    /* Mesmo tick: a cortina começa a abrir, o crachá destrava, o header
       aparece e este overlay some, tudo no mesmo commit — sem gap de frame
       entre eles. */
    revealPage();
    setBootActive(false);
    onHandOff?.();
    setPhase('done');
  };

  useEffect(() => {
    /* `phase` vira 'done' sem o componente desmontar (ele só passa a
       renderizar null), então a trava de scroll tem que reagir à fase —
       uma cleanup de [] nunca dispararia enquanto o componente seguir
       montado. */
    if (phase === 'done') {
      document.body.classList.remove('boot-intro-active');
      return;
    }
    document.body.classList.add('boot-intro-active');
    return () => document.body.classList.remove('boot-intro-active');
  }, [phase]);

  useEffect(() => {
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    const stage = stageRef.current;
    if (reduced || !stage) {
      handOff();
      return;
    }

    /* A animação é marcada pelo relógio, então qualquer tarefa longa no meio
       dela vira um salto visível. As cenas 3D da home (anéis, MacBook) são
       criadas logo no começo e seguram o navegador por uns 300ms. Esperar o
       primeiro intervalo livre (no máximo 2s) tira esse engasgo de dentro da
       animação: ele acontece com a tela ainda lisa, onde não aparece. A
       animação roda 15% mais rápida para compensar a espera. */
    let loader: ReturnType<typeof playLoader> | null = null;
    const skip = () => loader?.skip();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') skip();
    };
    const pedir =
      window.requestIdleCallback ??
      (((fn: () => void) => window.setTimeout(fn, 300)) as unknown as typeof window.requestIdleCallback);
    const idle = pedir(
      () => {
        loader = playLoader(stage, { colors: COLORS, speed: 1.15, onDone: handOff });
      },
      { timeout: 2000 },
    );
    stage.addEventListener('click', skip);
    document.addEventListener('keydown', onKey);

    return () => {
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle);
      stage.removeEventListener('click', skip);
      document.removeEventListener('keydown', onKey);
      loader?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (phase === 'done') return null;

  return (
    <div className="boot-intro" role="presentation" aria-hidden="true">
      <div ref={stageRef} className="boot-intro__stage" />
    </div>
  );
}
