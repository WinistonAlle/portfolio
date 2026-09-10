'use client';

/* Intro estilo "primeira ligada" — boot com nome + barra de progresso, que
   entrega a tela pra cortina de pixel (revealPage) no final, em vez de um
   fade simples, pra ficar consistente com a navegação do resto do site.

   O "ligar" de verdade acontece no crachá 3D: a física do Lanyard fica
   pausada (veja `active`/`paused` em LanyardBadge.tsx e Lanyard.jsx) até o
   exato instante em que a cortina abre, então o usuário vê o crachá cair e
   assentar ao mesmo tempo em que a página é revelada — em vez de já estar
   parado atrás do overlay.

   Roda toda vez que a home monta — inclusive em refresh e em navegação de
   volta pra home — não fica preso a sessionStorage. */

import { useEffect, useRef, useState } from 'react';
import { usePixelTransition } from '@/components/transition/PixelTransition';

const NAME = 'Winiston Alle';
const BOOT_MS = 2600;
const BOOT_ENTRANCE_MS = 500;

type Phase = 'boot' | 'done';

export default function BootIntro({
  onHandOff,
}: {
  onHandOff?: () => void;
}) {
  const { revealPage, setBootActive } = usePixelTransition();
  const [phase, setPhase] = useState<Phase>('boot');
  const [progress, setProgress] = useState(0);
  const [bootReady, setBootReady] = useState(false);
  const handedOffRef = useRef(false);
  const skippedRef = useRef(false);

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

  /* fase boot — entra, depois a barra de progresso enche até o handoff */
  useEffect(() => {
    if (skippedRef.current) return;

    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (reduced) {
      handOff();
      return;
    }

    const entrance = window.setTimeout(
      () => setBootReady(true),
      BOOT_ENTRANCE_MS,
    );

    let raf = 0;
    let start = 0;
    const tick = (now: number) => {
      if (!start) start = now;
      const t = Math.min(1, (now - start) / BOOT_MS);
      setProgress(t);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        handOff();
      }
    };
    const startTimer = window.setTimeout(() => {
      raf = requestAnimationFrame(tick);
    }, BOOT_ENTRANCE_MS);

    return () => {
      window.clearTimeout(entrance);
      window.clearTimeout(startTimer);
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (phase === 'done') return null;

  return (
    <div className="boot-intro" role="presentation" aria-hidden="true">
      <div
        className={`boot-intro__boot${bootReady ? ' boot-intro__boot--in' : ''}`}
      >
        <span className="boot-intro__name">{NAME}</span>
        <div className="boot-intro__bar">
          <div
            className="boot-intro__bar-fill"
            style={{ transform: `scaleX(${progress})` }}
          />
        </div>
        <span className="boot-intro__percent">
          {Math.round(progress * 100)}%
        </span>
      </div>
    </div>
  );
}
