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
