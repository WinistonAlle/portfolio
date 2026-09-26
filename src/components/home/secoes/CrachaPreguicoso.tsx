'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { usePixelTransition } from '@/components/transition/PixelTransition';

/* O crachá 3D na home, montado tarde e pausado quando ninguém olha.
 *
 * Ele é o componente mais caro do site: three, fiber, drei e o rapier em wasm,
 * mais o modelo do cartão. Na página "sobre mim" isso se paga, porque ele é a
 * abertura e é o que a pessoa foi ver. Na home ele mora abaixo do hero, e
 * carregá-lo junto com a página significaria disputar CPU e rede com a abertura
 * 3D do MacBook — que é justamente o momento em que a animação precisa estar
 * lisa.
 *
 * Duas travas, e elas resolvem coisas diferentes:
 *
 * 1. MONTAR TARDE, MAS NUM MOMENTO OCIOSO: montar custa mais de um segundo
 *    de trabalho travado (contexto WebGL, shaders, o rapier em wasm, o
 *    modelo). Quando isso acontecia só ao chegar perto da tela, caía bem no
 *    meio da rolagem e era o maior engasgo do site. Agora ele monta no
 *    primeiro momento ocioso DEPOIS que o loading termina e a cortina abre
 *    (a pessoa está lendo o hero, parada) ou ao chegar perto, o que vier
 *    primeiro. Só "ocioso" não basta: o navegador considera o loading
 *    ocioso, e aí a montagem travava a animação do nome no meio.
 * 2. PAUSAR FORA DE QUADRO: o `active` do LanyardBadge vira `paused` na física
 *    do Rapier. Sem isso, o crachá continuaria simulando corda e colisão o
 *    tempo todo depois de montado, inclusive com a pessoa lendo o contato lá
 *    embaixo.
 */

const LanyardBadge = dynamic(() => import('@/components/lanyard/LanyardBadge'), {
  ssr: false,
  loading: () => <div className="h-full w-full" aria-hidden />,
});

export default function CrachaPreguicoso() {
  const alvo = useRef<HTMLDivElement>(null);
  const [montado, setMontado] = useState(false);
  const [emQuadro, setEmQuadro] = useState(false);
  const { bootActive } = usePixelTransition();

  useEffect(() => {
    const el = alvo.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') {
      setMontado(true);
      setEmQuadro(true);
      return;
    }

    /* Dois observadores porque as perguntas são diferentes: "já posso começar
       a baixar?" tem uma tela de antecedência, e "está visível agora?" é
       exato. Um só, com a margem grande, manteria a física rodando por uma
       tela inteira depois de o crachá sair de vista. */
    const paraMontar = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setMontado(true);
        paraMontar.disconnect();
      },
      { rootMargin: '100% 0px' },
    );

    const paraPausar = new IntersectionObserver(
      ([e]) => setEmQuadro(e.isIntersecting),
      { rootMargin: '10% 0px' },
    );

    paraMontar.observe(el);
    paraPausar.observe(el);

    return () => {
      paraMontar.disconnect();
      paraPausar.disconnect();
    };
  }, []);

  /* Ocioso, e só depois do loading: espera a cortina de pixels abrir
     (~1,5s depois do fim do boot) e então pede um intervalo livre. O timeout
     do requestIdleCallback garante que acontece mesmo numa página que nunca
     fica 100% parada. */
  useEffect(() => {
    if (bootActive || montado) return;
    let idle = 0;
    const espera = window.setTimeout(() => {
      const pedir =
        window.requestIdleCallback ??
        (((fn: () => void) => window.setTimeout(fn, 1)) as unknown as typeof window.requestIdleCallback);
      idle = pedir(() => setMontado(true), { timeout: 4000 });
    }, 2500);
    return () => {
      window.clearTimeout(espera);
      if (idle && window.cancelIdleCallback) window.cancelIdleCallback(idle);
    };
  }, [bootActive, montado]);

  return (
    <div ref={alvo} className="h-full w-full">
      {montado ? <LanyardBadge active={emQuadro} /> : null}
    </div>
  );
}
