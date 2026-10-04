'use client';

import { useEffect, useRef, useState, type PointerEvent } from 'react';

/* Parede de quadros em 3D, só com CSS (nada de WebGL: são 12 itens repetidos
   e a regra do site é 60fps).

   Profundidade: a parede inteira gira poucos graus seguindo o cursor, e cada
   quadro mora numa profundidade diferente (--z), então eles se deslocam entre
   si como numa parede de verdade vista de lado. Cada quadro também pende um
   pouquinho torto (--rot), como quadro pendurado na mão, e endireita quando
   o cursor chega.

   Movimento, arquétipo Corporate do site, curva (0.2, 0, 0, 1):
   primária = quadro em foco sai da parede; secundária = reflexo no vidro e
   os vizinhos recuando; ambiente = luz de galeria seguindo o cursor.
   Entrada: os quadros "são pendurados" em cascata de 30ms (12 = 360ms). */

export type WallItem = {
  id: string;
  name: string;
  issuer: string;
  issued: string;
  faceDate: string;
  url?: string;
};

/* Fixos, não aleatórios: o servidor e o navegador precisam desenhar igual. */
const ROT = [-1.1, 0.7, -0.4, 1, 0.5, -0.9, 0.8, -0.3, 1.1, -0.7, 0.3, -1];
const Z = [0, 28, 12, 40, 20, 4, 34, 16, 26, 8, 38, 14];
const DROP = [0, 1.4, 0.5, 1.9, 0.9, 0.2, 1.6, 0.6, 0.3, 1.8, 0.8, 1.2];

export default function CertWall({
  items,
  labels,
}: {
  items: WallItem[];
  labels: { newTab: string; view: string };
}) {
  const wallRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<'idle' | 'wait' | 'play'>('idle');

  useEffect(() => {
    const el = wallRef.current;
    if (!el || el.getBoundingClientRect().top < window.innerHeight) return;
    setPhase('wait');
    /* Rolagem e não IntersectionObserver: um salto grande (tecla End) passa
       por cima da parede sem ela cruzar a tela e o observer nunca dispararia. */
    const check = () => {
      if (el.getBoundingClientRect().top > window.innerHeight * 0.8) return;
      setPhase('play');
      window.removeEventListener('scroll', check);
    };
    window.addEventListener('scroll', check, { passive: true });
    return () => window.removeEventListener('scroll', check);
  }, []);

  /* Só variável CSS, sem re-render: o navegador faz o resto na GPU. */
  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    const s = e.currentTarget.style;
    s.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
    s.setProperty('--my', `${(y * 100).toFixed(1)}%`);
    s.setProperty('--wy', `${((x - 0.5) * 7).toFixed(2)}deg`);
    s.setProperty('--wx', `${((0.5 - y) * 4).toFixed(2)}deg`);
  };
  const leave = (e: PointerEvent<HTMLDivElement>) => {
    const s = e.currentTarget.style;
    s.setProperty('--wy', '0deg');
    s.setProperty('--wx', '0deg');
  };

  const glare = (e: PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--gx', `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
  };

  return (
    <div ref={wallRef} className="cert-wall" data-phase={phase} onPointerMove={move} onPointerLeave={leave}>
      <div className="cert-wall__light" aria-hidden="true" />
      <ul className="cert-wall__plane">
        {items.map((c, i) => {
          const frame = (
            <>
              <span className="cert-frame" aria-hidden="true">
                <span className="cert-frame__mat">
                  <Face item={c} />
                  <span className="cert-frame__glass" />
                </span>
              </span>
              <span className="cert-plaque">
                <span className="cert-plaque__name">{c.name}</span>
                <span className="cert-plaque__meta">
                  {c.issuer} · {c.issued}
                </span>
                {c.url && (
                  <span className="cert-plaque__cta">
                    {labels.view} <span aria-hidden="true">↗</span>
                    <span className="sr-only"> ({labels.newTab})</span>
                  </span>
                )}
              </span>
            </>
          );
          return (
            <li
              key={c.id}
              className="cert-hang"
              style={{
                ['--i' as string]: i,
                ['--rot' as string]: `${ROT[i % ROT.length]}deg`,
                ['--z' as string]: `${Z[i % Z.length]}px`,
                ['--drop' as string]: `${DROP[i % DROP.length]}rem`,
              }}
            >
              {c.url ? (
                <a href={c.url} target="_blank" rel="noopener noreferrer" className="cert-piece" onPointerMove={glare}>
                  {frame}
                </a>
              ) : (
                <div className="cert-piece" onPointerMove={glare}>
                  {frame}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* Miniatura do certificado no estilo de cada instituição. É uma lembrança do
   papel, não uma cópia: sem assinatura, CNPJ nem código de verificação. */
function Face({ item }: { item: WallItem }) {
  if (item.issuer === 'Anthropic') {
    return (
      <span className="cert-face cert-face--anthropic">
        <span className="cf-kicker">Certificate of Completion</span>
        <span className="cf-rule" />
        <span className="cf-small">This certifies that</span>
        <span className="cf-person">Winiston Alle</span>
        <span className="cf-small">has completed</span>
        <span className="cf-course">{item.name}</span>
        <span className="cf-foot">
          <span>Anthropic</span>
          <span>{item.faceDate}</span>
        </span>
      </span>
    );
  }
  if (item.issuer === 'Asimov Academy') {
    return (
      <span className="cert-face cert-face--asimov">
        <span className="cf-watermark">ASIMOV</span>
        <span className="cf-kicker">Certificado de conclusão</span>
        <span className="cf-small">Certificamos que</span>
        <span className="cf-person">Winiston Alle</span>
        <span className="cf-small">Concluiu o curso</span>
        <span className="cf-course">{item.name}</span>
        <span className="cf-foot">
          <span>Asimov Academy</span>
          <span>{item.faceDate}</span>
        </span>
      </span>
    );
  }
  return (
    <span className="cert-face cert-face--d2l">
      <span className="cf-band" />
      <span className="cf-kicker">Certificado</span>
      <span className="cf-small">Conferido a</span>
      <span className="cf-person">Winiston Alle</span>
      <span className="cf-course">{item.name}</span>
      <span className="cf-foot">
        <span>{item.issuer}</span>
        <span>{item.faceDate}</span>
      </span>
    </span>
  );
}
