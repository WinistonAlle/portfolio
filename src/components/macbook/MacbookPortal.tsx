'use client';

/* A home abre dentro do MacBook: só a moldura sobre o fundo animado, sem
 * header nem conteúdo solto. Rolando, o zoom entra na tela até o site assumir
 * a página inteira, e a partir daí a navegação é normal.
 *
 * Duas fases, e a segunda é a parte que costuma dar errado:
 *
 *  1. Zoom. O conteúdo fica `fixed`, ocupando a viewport, e começa reduzido
 *     (escala --s0) recortado pelo retângulo da tela do MacBook. A escala vai
 *     até 1, então ele termina em tamanho natural, não ampliado.
 *  2. Entrada. Ao completar, o espaçador some, o conteúdo volta para o fluxo
 *     e a rolagem é levada a zero no mesmo frame. A troca é invisível porque
 *     nos dois lados dela o topo do conteúdo está no topo da tela: antes
 *     porque ele estava preso ali em escala 1, depois porque a página está no
 *     começo. É de mão única de propósito — voltar para o zoom exigiria
 *     desfazer esse pulo de rolagem a cada quadro, e o efeito é uma entrada,
 *     não um estado em que se fica indo e voltando.
 *
 * O espaçador precisa medir o percurso mais uma tela: com o conteúdo fora do
 * fluxo, ele é a única altura que o documento tem, e sem essa sobra a rolagem
 * disponível acabaria antes de o zoom completar.
 */

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { MacbookPro } from './MacbookPro';
import Header from '@/components/Header';
import { usePixelTransition } from '@/components/transition/PixelTransition';
import { jumpScrollTo } from '@/components/scroll/SmoothScroll';

/* Geometria da tela dentro do SVG (viewBox 650x400). */
const SCREEN_W_RATIO = 501.22 / 650;
const SCREEN_ASPECT = 501.22 / 323.85;
const SVG_ASPECT = 400 / 650;
/* A tela não é centrada no SVG: fica 4,19% da altura acima do meio. */
const SCREEN_Y_OFFSET = ((21.32 + 345.17) / 2 - 400 / 2) / 400;

export default function MacbookPortal({
  children,
  startScale = 0.56,
  /** Quanta rolagem o zoom consome, em porcentagem da altura da tela. */
  travelVh = 130,
}: {
  children: React.ReactNode;
  startScale?: number;
  travelVh?: number;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const [entered, setEntered] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const { setChromeHidden, bootActive } = usePixelTransition();

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (reduced) {
      /* Sem animação: entra direto no site. */
      root.style.setProperty('--p', '1');
      setEntered(true);
      return;
    }

    const update = () => {
      rafRef.current = 0;
      const travel = (travelVh / 100) * window.innerHeight;
      const p =
        travel > 0 ? Math.min(1, Math.max(0, window.scrollY / travel)) : 1;
      root.style.setProperty('--p', p.toFixed(4));
      if (p >= 1) setEntered(true);
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
  }, [travelVh]);

  /* O MacBook sobe para dentro de quadro quando o boot termina. A espera
     curta é para ele entrar com a cortina de pixel já abrindo, e não atrás
     dela ainda fechada. */
  useEffect(() => {
    if (bootActive) {
      setRevealed(false);
      return;
    }
    const timer = window.setTimeout(() => setRevealed(true), 260);
    return () => window.clearTimeout(timer);
  }, [bootActive]);

  /* O header real (do layout raiz) só aparece depois de entrar: enquanto o
     MacBook está em quadro, quem aparece é a cópia renderizada dentro da
     tela do notebook, logo abaixo. */
  useEffect(() => {
    setChromeHidden(!entered);
    return () => setChromeHidden(false);
  }, [entered, setChromeHidden]);

  /* No mesmo quadro em que o conteúdo volta ao fluxo, a rolagem vai a zero.
     Antes disso ele estava preso no topo da tela em escala 1, então o topo do
     conteúdo já era o topo da tela: com a página no começo, continua sendo, e
     a troca não aparece. Em layout effect para acontecer antes da pintura. */
  useLayoutEffect(() => {
    if (entered) jumpScrollTo(0);
  }, [entered]);

  return (
    <div
      ref={rootRef}
      className={`portal${entered ? ' portal--entered' : ''}${revealed ? ' portal--revealed' : ''}`}
      style={
        {
          '--p': 0,
          '--s0': startScale,
          '--screen-ratio': SCREEN_W_RATIO,
          '--screen-aspect': SCREEN_ASPECT,
          '--svg-aspect': SVG_ASPECT,
          '--screen-offset': SCREEN_Y_OFFSET,
        } as React.CSSProperties
      }
    >
      {/* Espaçador: única altura do documento durante o zoom, por isso o
          percurso mais uma tela. Some assim que o site assume a página. */}
      {!entered && (
        <div
          className="portal__rail"
          style={{ height: `calc(${travelVh}vh + 100svh)` }}
        />
      )}

      {/* A moldura fica atrás do conteúdo: o SVG é feito de paths cheios, não
          tem buraco onde fica a tela, então por cima ele taparia tudo. */}
      <MacbookPro className="portal__frame text-transparent" />

      <div className="portal__viewport">
        <div className="portal__screen">
          <div className="portal__content">
            {/* Antes de entrar, o header mora aqui dentro, como se fosse o
                topo do site rodando na tela do notebook. Some ao entrar: o
                header real do layout assume a partir daí. */}
            {!entered && <Header inPortal />}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
