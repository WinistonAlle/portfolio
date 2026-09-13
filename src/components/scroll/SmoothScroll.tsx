'use client';

/* Rolagem inercial (Lenis) para o site inteiro.
 *
 * Lenis não substitui a barra de rolagem por transform: ele continua rolando
 * a janela de verdade, só que interpolado a cada frame. Isso importa aqui
 * porque metade dos efeitos da página lê `window.scrollY` ou mede
 * `getBoundingClientRect()` (partículas, timeline, iPhone, portal do
 * MacBook) — com uma solução baseada em transform, todos eles quebrariam.
 *
 * Três lugares do site mexem na rolagem na mão e precisam falar com o Lenis,
 * senão ele desfaz o que eles fizeram no frame seguinte:
 *
 *  1. o portal do MacBook zera a rolagem ao terminar o zoom (jumpScrollTo)
 *  2. o boot da home trava a rolagem por CSS enquanto roda
 *  3. troca de página põe a rolagem no topo
 */

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';
import { usePixelTransition } from '@/components/transition/PixelTransition';

/* Singleton em módulo: quem precisa pular a rolagem não é componente React
   nem está na árvore abaixo daqui, então contexto não serviria. */
let lenis: Lenis | null = null;

/**
 * Põe a rolagem em `top` na hora, sem interpolar. Use no lugar de
 * `window.scrollTo({ behavior: 'instant' })`: com o Lenis rodando, o
 * scrollTo nativo é desfeito no frame seguinte, porque o destino interno
 * dele continua sendo o de antes.
 */
export function jumpScrollTo(top: number) {
  if (lenis) {
    lenis.scrollTo(top, { immediate: true, force: true });
    return;
  }
  window.scrollTo({ top, behavior: 'instant' as ScrollBehavior });
}

/**
 * Leva ao topo e ignora a rolagem que ainda está chegando.
 *
 * Existe por causa da entrada da home. Ao terminar a abertura do MacBook, o
 * espaçador de ~420vh é removido e o conteúdo volta ao fluxo no mesmo quadro —
 * mas quem rolou até ali ainda tem inércia no dedo e no Lenis. Antes isso não
 * fazia diferença: a home não tinha altura nenhuma abaixo do hero, então a
 * rolagem sobrando não tinha pra onde ir.
 *
 * Com a home em página única ela tem: medido, a pessoa atravessava a abertura e
 * era despejada no RODAPÉ da página, pulando o hero e as quatro seções.
 *
 * A janela de graça resolve segurando o Lenis por um instante depois do salto.
 * Curta de propósito: é só o tempo de a inércia morrer, e travar mais que isso
 * viraria uma página que não responde ao dedo.
 */
export function ancorarNoTopo() {
  if (!lenis) {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    return;
  }

  lenis.stop();
  /* `force` porque `stop()` bloquearia também este scrollTo. */
  lenis.scrollTo(0, { immediate: true, force: true });

  /* A espera é pela rolagem PARAR, não por um tempo fixo.
     Um temporizador de alguns centésimos não serve: atravessar a abertura leva
     uns dois segundos de dedo contínuo, e quando ele expirava o resto da
     rolagem entrava e levava a pessoa ao rodapé do mesmo jeito. Aqui cada novo
     evento adia a liberação; ela só acontece depois de um instante de silêncio. */
  const OCIOSO = 180;
  const TETO = 3000; // nunca deixar a página presa, aconteça o que acontecer

  let ocioso = 0;
  const eventos = ['wheel', 'touchmove', 'keydown'] as const;

  const liberar = () => {
    window.clearTimeout(ocioso);
    window.clearTimeout(teto);
    for (const e of eventos) window.removeEventListener(e, adiar);
    lenis?.start();
  };

  const adiar = () => {
    window.clearTimeout(ocioso);
    ocioso = window.setTimeout(liberar, OCIOSO);
  };

  const teto = window.setTimeout(liberar, TETO);
  for (const e of eventos) window.addEventListener(e, adiar, { passive: true });
  adiar();
}

/* Trava e destrava a rolagem da página.
 *
 * Os dois passos são necessários. O `overflow: hidden` no body segura a
 * rolagem nativa, e o `lenis.stop()` segura o loop do Lenis, que roda por
 * conta própria e continuaria rolando com o body travado.
 *
 * Quem usa: o visualizador ampliado da moldura de projeto. O boot da home tem
 * o caminho dele, pelo `bootActive`, porque lá a trava começa antes de este
 * componente montar. */
export function setScrollLocked(locked: boolean) {
  document.body.classList.toggle('scroll-locked', locked);
  if (!lenis) return;
  if (locked) lenis.stop();
  else lenis.start();
}

export default function SmoothScroll() {
  const pathname = usePathname();
  const { bootActive } = usePixelTransition();

  useEffect(() => {
    /* Quem pediu menos movimento fica com a rolagem nativa do sistema. */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    lenis = new Lenis({
      /* O padrão é observar o <html>, e aqui o <html> tem h-full: a caixa
         dele fica travada na altura da viewport, então o ResizeObserver do
         Lenis nunca dispara e o limite de rolagem congela no que a página
         media quando carregou. Qualquer coisa que cresça depois (fonte que
         chega, canvas que se dimensiona, vídeo, ou o próprio HMR em dev)
         passava a ficar inalcançável no fim da página. O <body> não tem
         altura fixa, só min-height, então a altura dele acompanha o
         conteúdo e o observer volta a funcionar. */
      content: document.body,
      /* lerp em vez de duration: a rolagem persegue o destino a uma fração
         por frame, então gestos curtos respondem na hora e gestos longos
         deslizam. Duration daria o mesmo tempo para os dois. */
      lerp: 0.085,
      wheelMultiplier: 1,
      /* Toque fica nativo: o iOS já rola com inércia própria, e sincronizar
         os dois deixa o dedo com atraso. */
      syncTouch: false,
      autoRaf: true,
    });

    return () => {
      lenis?.destroy();
      lenis = null;
    };
  }, []);

  /* O boot trava a rolagem no CSS (body.boot-intro-active). O Lenis precisa
     parar junto: parado, ele ignora a roda em vez de acumular destino e dar
     um salto quando a trava sai. */
  useEffect(() => {
    if (!lenis) return;
    if (bootActive) lenis.stop();
    else lenis.start();
  }, [bootActive]);

  /* Troca de página: o Next põe a rolagem no topo por conta dele, e sem
     avisar o Lenis a página voltaria rolando para onde estava. */
  useEffect(() => {
    lenis?.scrollTo(0, { immediate: true, force: true });
  }, [pathname]);

  return null;
}
