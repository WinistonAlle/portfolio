'use client';

/* Linha do tempo vertical com a linha acendendo tipo fita de LED conforme a
 * página rola (mesma família visual do filete do header: gradiente do accent
 * com glow).
 *
 * Todo o movimento sai de três variáveis CSS escritas por frame, direto no
 * DOM via ref, sem estado do React: re-renderizar cinco cartões a cada frame
 * de scroll seria caro à toa, e o desenho todo é CSS puro em cima delas.
 *
 *  --fill   (na raiz)  0 a 1, o quanto da fita já acendeu
 *  --p      (no item)  0 a 1, entrada do cartão, com suavização
 *  --lit    (no item)  0 a 1, faixa curta: o ponto acende quando a cabeça do
 *                      LED passa por ele, então acender e passar são o mesmo
 *                      instante
 *
 * A referência de tudo é a "linha de leitura" (READ_LINE): é onde a cabeça
 * do LED fica, e é contra ela que cada ponto se mede. Como a fita começa no
 * primeiro ponto e termina no último (não nas bordas da caixa), a cabeça
 * encosta exatamente em cada marcador na hora em que ele acende.
 */

import { useEffect, useRef } from 'react';
import { TIMELINE } from '@/data/timeline';

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
/* smoothstep: o scrub é por frame, então a suavização entra aqui, não em
   transition (transition brigaria com a escrita a cada quadro). */
const ease = (n: number) => n * n * (3 - 2 * n);

/** Fração da altura da tela onde fica a cabeça do LED. Quanto mais baixo na
 *  tela (número maior), mais cedo na rolagem cada ponto acende: o marcador
 *  acende assim que sobe da base, não só quando chega perto do meio. */
const READ_LINE = 0.76;
/** Quanto o cartão percorre, em fração de tela, até estar todo dentro. */
const CARD_SPAN = 0.34;
/** Faixa, em px, em que o ponto sai de apagado para aceso. */
const NODE_BAND = 44;

export default function Timeline() {
  const rootRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLLIElement | null)[]>([]);
  const rafRef = useRef(0);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const items = itemsRef.current.filter(
      (item): item is HTMLLIElement => item !== null,
    );
    if (!items.length) return;

    const nodes = items.map((item) =>
      item.querySelector<HTMLElement>('.timeline__node'),
    );

    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (reduced) {
      /* Sem animação: tudo já aceso e no lugar. */
      root.style.setProperty('--fill', '1');
      items.forEach((item) => {
        item.style.setProperty('--p', '1');
        item.style.setProperty('--lit', '1');
      });
      return;
    }

    const update = () => {
      rafRef.current = 0;

      const rootRect = root.getBoundingClientRect();
      const vh = window.innerHeight;
      /* Linha de leitura em coordenadas da própria caixa da timeline. */
      const readY = vh * READ_LINE - rootRect.top;

      const centers = nodes.map((node, i) => {
        const target = node ?? items[i];
        const rect = target.getBoundingClientRect();
        return rect.top + rect.height / 2 - rootRect.top;
      });

      const start = centers[0];
      const end = centers[centers.length - 1];
      const span = Math.max(1, end - start);

      root.style.setProperty('--led-top', `${start}px`);
      root.style.setProperty('--led-span', `${span}px`);
      root.style.setProperty('--fill', clamp01((readY - start) / span).toFixed(4));

      items.forEach((item, i) => {
        const center = centers[i];
        const p = ease(clamp01(1 - (center - readY) / (vh * CARD_SPAN)));
        const lit = clamp01(0.5 + (readY - center) / NODE_BAND);
        item.style.setProperty('--p', p.toFixed(4));
        item.style.setProperty('--lit', lit.toFixed(4));
      });
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

  return (
    <div className="timeline" ref={rootRef}>
      {/* Trilho apagado + fita acesa por cima. Fora da <ol> porque lista só
          aceita <li> como filho. */}
      <div className="timeline__rail" aria-hidden="true">
        <div className="timeline__led" />
      </div>

      <ol className="timeline__list">
        {TIMELINE.map((entry, i) => (
          <li
            key={entry.id}
            ref={(el) => {
              itemsRef.current[i] = el;
            }}
            className={`timeline__item timeline__item--${
              i % 2 === 0 ? 'left' : 'right'
            }${entry.current ? ' timeline__item--current' : ''}`}
          >
            <span className="timeline__node" aria-hidden="true" />
            <span className="timeline__branch" aria-hidden="true" />

            <time className="timeline__when" dateTime={entry.iso}>
              <span className="timeline__month">{entry.month}</span>
              <span className="timeline__year">{entry.year}</span>
            </time>

            <article className="timeline__card">
              <h3 className="timeline__role">{entry.role}</h3>
              <p className="timeline__place">{entry.place}</p>
              <p className="timeline__line">{entry.line}</p>
              {entry.current && (
                <p className="timeline__now">
                  <span className="timeline__now-dot" aria-hidden="true" />
                  Onde estou hoje
                </p>
              )}
            </article>
          </li>
        ))}
      </ol>
    </div>
  );
}
