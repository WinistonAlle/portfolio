'use client';

import { useEffect, useMemo, useRef, useState, type PointerEvent } from 'react';

/* Parte interativa das certificações: filtro por instituição, índice numerado
   e o cartão de credencial que mostra o item sob o cursor (ou com foco).

   Os dados chegam prontos do servidor (data por extenso já no idioma), então
   este arquivo não importa nada de `@/data`: mesma regra do ProjectGrid.

   Movimento, arquétipo Corporate do site: curva (0.2, 0, 0, 1), hover abaixo
   de 120ms, entrada das linhas em cascata de 30ms (12 linhas = 360ms, dentro
   do teto de 500ms). Camadas: primária = linha ativa e troca do cartão;
   secundária = inclinação do cartão e número aceso; ambiente = brilho lento
   no fundo do cartão. Com movimento reduzido, tudo isso some e sobra a troca
   de conteúdo seca. */

export type CertItem = {
  id: string;
  n: string;
  name: string;
  issuer: string;
  mark: string;
  year: string;
  issued: string;
  url?: string;
};

type Tab = { key: string; label: string; total: number };

type Labels = {
  filterLabel: string;
  issuedIn: string;
  verify: string;
  newTab: string;
  countOne: string;
  countMany: string;
};

export default function CertificationsIndex({
  items,
  tabs,
  labels,
}: {
  items: CertItem[];
  tabs: Tab[];
  labels: Labels;
}) {
  const [filter, setFilter] = useState(tabs[0]?.key ?? 'all');
  const [activeId, setActiveId] = useState(items[0]?.id);
  /* 'idle' = linhas visíveis sem animar (é como chega do servidor).
     'wait' = seção ainda abaixo da tela: linhas escondidas até aparecer.
     'play' = cascata rodando. Só esconde o que está fora da tela, então
     ninguém vê a lista piscar. */
  const [phase, setPhase] = useState<'idle' | 'wait' | 'play'>('idle');
  const [round, setRound] = useState(0);
  const listRef = useRef<HTMLOListElement>(null);

  const visible = useMemo(
    () => (filter === tabs[0]?.key ? items : items.filter((i) => i.issuer === filter)),
    [filter, items, tabs],
  );
  const active = visible.find((i) => i.id === activeId) ?? visible[0];

  useEffect(() => {
    const el = listRef.current;
    if (!el || el.getBoundingClientRect().top < window.innerHeight) return;
    setPhase('wait');
    /* Rolagem e não IntersectionObserver: um salto grande (tecla End, link
       de âncora) passa por cima da lista sem ela nunca cruzar a tela, o
       observer não dispara e as linhas ficariam escondidas pra sempre.
       "Já chegou ou já passou" cobre os dois casos. */
    const check = () => {
      if (el.getBoundingClientRect().top > window.innerHeight * 0.85) return;
      setPhase('play');
      window.removeEventListener('scroll', check);
    };
    window.addEventListener('scroll', check, { passive: true });
    return () => window.removeEventListener('scroll', check);
  }, []);

  const choose = (key: string) => {
    if (key === filter) return;
    setFilter(key);
    setRound((r) => r + 1);
    setPhase('play');
  };

  /* Holofote da linha: posição do cursor em variável CSS, sem re-render. */
  const spot = (e: PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--sx', `${e.clientX - r.left}px`);
  };

  return (
    <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16">
      <div>
        <div role="group" aria-label={labels.filterLabel} className="flex flex-wrap gap-2.5">
          {tabs.map(({ key, label, total }) => {
            const on = filter === key;
            return (
              <button
                key={key}
                type="button"
                aria-pressed={on}
                onClick={() => choose(key)}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[0.8rem] font-medium transition-colors ${
                  on
                    ? 'border-accent/55 bg-accent/10 text-foreground'
                    : 'border-line text-muted hover:border-white/25 hover:text-foreground'
                }`}
              >
                {label}
                <span className="text-[0.6rem] tabular-nums opacity-70">{total}</span>
              </button>
            );
          })}
        </div>

        <p aria-live="polite" className="sr-only">
          {visible.length} {visible.length === 1 ? labels.countOne : labels.countMany}
        </p>

        <ol
          ref={listRef}
          key={round}
          data-phase={phase}
          className="cert-list mt-6 border-t border-line"
          onPointerLeave={() => setActiveId(visible[0]?.id)}
        >
          {visible.map((c, i) => {
            const on = c.id === active?.id;
            const body = (
              <>
                <span className="cert-n font-mono text-[0.7rem] tabular-nums">{c.n}</span>
                <span className="cert-main min-w-0">
                  <span className="cert-name block font-display text-[0.98rem] leading-snug font-medium text-pretty">
                    {c.name}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted">
                    {c.issuer}
                    <span className="sr-only">, {c.issued}</span>
                  </span>
                </span>
                <span aria-hidden="true" className="font-mono text-xs text-muted tabular-nums">
                  {c.year}
                </span>
                {c.url && <span className="sr-only"> ({labels.newTab})</span>}
              </>
            );
            const common = {
              className: 'cert-row',
              'data-on': on || undefined,
              onPointerEnter: () => setActiveId(c.id),
              onPointerMove: spot,
            };
            return (
              <li key={c.id} style={{ ['--i' as string]: i }} className="cert-item border-b border-line">
                {c.url ? (
                  <a
                    {...common}
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onFocus={() => setActiveId(c.id)}
                  >
                    {body}
                  </a>
                ) : (
                  <div {...common}>{body}</div>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      {active && <CredentialCard item={active} labels={labels} total={items.length} />}
    </div>
  );
}

/* O cartão repete o que a linha já diz (e a data completa já está na linha
   para leitor de tela), por isso é aria-hidden: é vitrine, não conteúdo. */
function CredentialCard({ item, labels, total }: { item: CertItem; labels: Labels; total: number }) {
  const tilt = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    e.currentTarget.style.setProperty('--rx', `${(-y * 6).toFixed(2)}deg`);
    e.currentTarget.style.setProperty('--ry', `${(x * 8).toFixed(2)}deg`);
    e.currentTarget.style.setProperty('--gx', `${((x + 0.5) * 100).toFixed(1)}%`);
  };
  const reset = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.style.setProperty('--rx', '0deg');
    e.currentTarget.style.setProperty('--ry', '0deg');
  };

  return (
    <div aria-hidden="true" className="hidden lg:block">
      <div className="sticky top-28 [perspective:900px]">
        <div className="cert-card" onPointerMove={tilt} onPointerLeave={reset}>
          <div className="cert-card__glow" />
          <div key={item.id} className="cert-card__body">
            <div className="flex items-start justify-between">
              <span className="cert-seal font-display">{item.mark}</span>
              <span className="font-mono text-[0.65rem] tracking-[0.14em] text-muted tabular-nums">
                {item.n} / {String(total).padStart(2, '0')}
              </span>
            </div>

            <p className="mt-10 font-mono text-[0.65rem] tracking-[0.18em] text-muted uppercase">
              {item.issuer}
            </p>
            <p className="mt-2 font-display text-[1.35rem] leading-[1.15] font-semibold tracking-[-0.01em] text-balance">
              {item.name}
            </p>

            <div className="cert-perf mt-8" />

            <div className="mt-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-[0.7rem] text-muted">{labels.issuedIn}</p>
                <p className="mt-0.5 font-display text-sm font-medium first-letter:uppercase">{item.issued}</p>
              </div>
              {item.url && (
                <span className="font-display text-xs font-medium text-accent">{labels.verify} ↗</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
