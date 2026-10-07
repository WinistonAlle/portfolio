'use client';

/* O LED que corre pelo trilho da stack no celular, igual ao da linha do tempo
 * (Timeline.tsx): a fita acende conforme a página rola, com a cabeça mais
 * clara onde a leitura está, e cada pilar acende quando a fita chega nele.
 *
 * É um componente à parte, e minúsculo, pra StackLista continuar sendo de
 * servidor: aqui vai só o trilho e o efeito de rolagem. Ele escreve `--fill`
 * no trilho e `--lit` em cada pilar; o desenho todo é CSS.
 */

import { useEffect, useRef } from 'react';

/** Altura da tela (0 a 1) onde fica a "linha de leitura". */
const LINHA = 0.7;
/** Faixa, em px, em que o ponto do pilar vai de apagado a aceso. */
const FAIXA = 44;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

export default function StackLed() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const trilho = ref.current;
    const arvore = trilho?.parentElement;
    if (!trilho || !arvore) return;
    const pilares = [...arvore.querySelectorAll<HTMLElement>('.stack-lista__pilar')];

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      trilho.style.setProperty('--fill', '1');
      pilares.forEach((p) => p.style.setProperty('--lit', '1'));
      return;
    }

    let raf = 0;
    const atualizar = () => {
      raf = 0;
      const r = trilho.getBoundingClientRect();
      /* Lista escondida (computador): nada a fazer. */
      if (!r.height) return;
      const leitura = window.innerHeight * LINHA;
      trilho.style.setProperty('--fill', clamp01((leitura - r.top) / r.height).toFixed(4));
      for (const p of pilares) {
        const no = p.querySelector('.stack-lista__no') ?? p;
        const n = no.getBoundingClientRect();
        const centro = n.top + n.height / 2;
        p.style.setProperty('--lit', clamp01(0.5 + (leitura - centro) / FAIXA).toFixed(4));
      }
    };
    const aoRolar = () => {
      if (!raf) raf = requestAnimationFrame(atualizar);
    };

    atualizar();
    window.addEventListener('scroll', aoRolar, { passive: true });
    window.addEventListener('resize', aoRolar);
    return () => {
      window.removeEventListener('scroll', aoRolar);
      window.removeEventListener('resize', aoRolar);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <span ref={ref} className="stack-lista__trilho" aria-hidden="true">
      <span className="stack-lista__led" />
    </span>
  );
}
