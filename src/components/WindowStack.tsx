'use client';

/* Três janelas de sistema empilhadas, cada uma com a barra de abas inteira
   visível: a aba acesa é a da janela da frente, então a pilha girando parece
   alguém alternando de aba. Clicar leva ao lugar que a aba promete. */

import { useEffect, useRef, useState } from 'react';
import CardSwap, { Card } from '@/components/cardswap/CardSwap';
import { usePixelTransition } from '@/components/transition/PixelTransition';
import { PROJECTS } from '@/data/projects';

type Tab = {
  id: string;
  file: string;
  href: string;
};

const TABS: Tab[] = [
  { id: 'sobre', file: 'sobre-mim.md', href: '/sobre-mim' },
  { id: 'projetos', file: 'projetos.tsx', href: '/projetos' },
  { id: 'producao', file: 'producao.log', href: '/projetos' },
];

function TabBar({ active }: { active: string }) {
  return (
    <div className="win__bar">
      <span className="win__dots" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span className="win__tabs">
        {TABS.map((tab) => (
          <span
            key={tab.id}
            className="win__tab"
            data-active={tab.id === active}
          >
            {tab.file}
          </span>
        ))}
      </span>
    </div>
  );
}

function AboutPane() {
  return (
    <div className="flex h-full flex-col gap-6">
      <p className="max-w-2xl text-lg leading-relaxed lg:text-2xl">
        <span className="font-semibold">Winiston Alle</span>
        <span className="text-muted">
          {' '}
          — desenvolvedor full-stack. Construo o sistema inteiro e continuo
          responsável por ele depois que entra no ar.
        </span>
      </p>
      <ul className="grid max-w-2xl gap-3 border-t border-line pt-6 font-mono text-xs text-muted lg:gap-4 lg:pt-8 lg:text-sm">
        <li>· do schema do banco até o último pixel</li>
        <li>· ERP legado sem cerimônia</li>
        <li>· produção {'>'} demonstração</li>
        <li>· quem escreveu é quem atende quando quebra</li>
      </ul>
    </div>
  );
}

function ProjectsPane() {
  return (
    <ul className="flex h-full flex-col divide-y divide-line">
      {PROJECTS.map((project) => (
        <li
          key={project.slug}
          className="flex flex-1 items-center gap-3 first:pt-0 last:pb-0"
        >
          <span className="font-mono text-xs text-accent lg:text-sm">
            {project.n}
          </span>
          <span className="font-semibold lg:text-xl">{project.name}</span>
          <span className="truncate font-mono text-[0.65rem] text-muted lg:text-xs">
            {project.tags.slice(0, 2).join(' · ')}
          </span>
        </li>
      ))}
    </ul>
  );
}

/* Nada de número inventado aqui: cada linha repete um fato que já está escrito
   em outro lugar da página. */
const LOG = [
  ['catalogo-funcionarios', '255 funcionários usando'],
  ['pdv-loja', 'venda, recibo e pedido no ERP'],
  ['totem-loja', 'autoatendimento em produção'],
  ['wmove', 'SaaS multi-tenant, 18 telas'],
];

function ProductionPane() {
  return (
    <div className="flex h-full flex-col font-mono text-xs lg:text-sm">
      {LOG.map(([name, note]) => (
        <p key={name} className="flex flex-1 items-center gap-3">
          <span className="inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
          <span className="text-foreground/85">{name}</span>
          <span className="truncate text-muted">{note}</span>
        </p>
      ))}
      <p className="border-t border-line pt-4 text-[0.65rem] text-muted lg:pt-6 lg:text-xs">
        nenhum deles é demonstração — todos com gente usando
      </p>
    </div>
  );
}

const PANES: Record<string, React.ReactNode> = {
  sobre: <AboutPane />,
  projetos: <ProjectsPane />,
  producao: <ProductionPane />,
};

/* A janela é lateral: começa na borda esquerda da coluna e termina passando da
   borda direita da tela. `V` é esse vão visível (coluna + o que sobra até a
   janela do navegador); tudo o mais sai daí, inclusive o quanto o conjunto
   precisa andar para a direita para o corte cair fora da tela. */
const measureStack = (columnWidth: number, gutter: number) => {
  const visible = columnWidth + gutter;
  const w = Math.round(visible * 1.18);
  return {
    w,
    h: Math.round(w * 0.66),
    dist: Math.round(w * 0.075),
    vdist: Math.round(w * 0.07),
    shift: Math.round(gutter + visible * 0.1),
  };
};

type StackSize = ReturnType<typeof measureStack>;

export default function WindowStack() {
  const { navigate } = usePixelTransition();
  const stageRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<StackSize | null>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const measure = () => {
      const rect = stage.getBoundingClientRect();
      /* Abaixo de md a pilha não cabe sem ficar ilegível — some, e a seção
         fica só com o texto. */
      if (!rect.width || window.innerWidth < 768) {
        setSize(null);
        return;
      }
      const viewport = document.documentElement.clientWidth;
      const next = measureStack(rect.width, Math.max(0, viewport - rect.right));
      setSize((current) =>
        current?.w === next.w && current.shift === next.shift ? current : next,
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  const openTab = (index: number) => {
    navigate(TABS[index].href);
  };

  /* overflow-x-clip na seção: a caixa de layout dos cartões (antes do
     transform do gsap) estoura a coluna e põe scroll horizontal na página
     inteira, mesmo sem nada aparecer fora da tela. O eixo y fica visível — é
     por lá que a janela cai. A seção é larga o bastante para não cortar a
     pilha; a coluna do grid não seria. */
  return (
    /* A seção é full-width e corta no x: a pilha passa da borda da tela de
       propósito, e é esse corte (não uma moldura) que dá a escala. */
    <section className="relative w-full overflow-x-clip overflow-y-visible">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-6 pt-16 pb-32 md:grid-cols-[0.4fr_1.6fr] lg:px-10">
        {/* Coluna vazia: o texto saiu, mas a pilha continua ancorada à
            direita, e é a largura desta sobra que define o quanto ela cresce
            (ver measureStack). */}
        <div aria-hidden="true" />

        <div
          ref={stageRef}
          className="relative"
          style={
            size
              ? ({
                  /* Os cartões de trás sobem `vdist` cada, mas a perspectiva os
                     encolhe — reservar 2×vdist deixaria um buraco no topo. */
                  height: size.h + Math.round(size.vdist * 1.4),
                  '--stack-shift': `${size.shift}px`,
                } as React.CSSProperties)
              : undefined
          }
        >
          {size && (
            <CardSwap
              width={size.w}
              height={size.h}
              cardDistance={size.dist}
              verticalDistance={size.vdist}
              delay={4600}
              pauseOnHover
              skewAmount={4}
              fadeOnDrop
              onCardClick={openTab}
            >
              {TABS.map((tab) => (
                <Card key={tab.id}>
                  <div className="flex h-full flex-col">
                    <TabBar active={tab.id} />
                    <div className="min-h-0 flex-1 px-8 py-7 lg:px-12 lg:py-10">
                      {PANES[tab.id]}
                    </div>
                  </div>
                </Card>
              ))}
            </CardSwap>
          )}
        </div>
      </div>
    </section>
  );
}
