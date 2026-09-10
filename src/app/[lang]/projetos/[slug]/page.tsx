import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import SlideIn from '@/components/scroll/SlideIn';
import ProjectFrame from '@/components/projects/ProjectFrame';
import Gallery from '@/components/projects/Gallery';
import { PROJECTS, projectBySlug } from '@/data/projects';
import GlowButton, { GlowArrow } from '@/components/ui/GlowButton';

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(
  props: PageProps<'/projetos/[slug]'>,
): Promise<Metadata> {
  const { slug } = await props.params;
  const project = projectBySlug(slug);
  if (!project) return {};
  return {
    title: `${project.name} — Winiston Alle`,
    description: project.line,
  };
}

export default async function ProjectPage(
  props: PageProps<'/projetos/[slug]'>,
) {
  const { slug } = await props.params;
  const project = projectBySlug(slug);
  if (!project) notFound();

  const hasFrame = project.media.frame !== 'none';

  return (
    /* overflow-x: clip por causa do SlideIn da moldura, que fica fora da
       página enquanto não entrou e poria barra de rolagem horizontal. */
    <main className="relative z-10 flex-1 [overflow-x:clip]">
      <article className="mx-auto w-full max-w-7xl px-6 pt-28 pb-28 lg:px-10 lg:pt-36">
        {/* Os três botões do topo usam o mesmo componente, e a hierarquia
            entre eles é feita por tamanho e brilho: o voltar é o mais
            apagado, os links do projeto são os que puxam o clique. */}
        <GlowButton href="/projetos" variant="quiet">
          <GlowArrow dir="left" />
          Projetos
        </GlowButton>

        {/* Abertura: identificação e print de capa lado a lado. */}
        <div
          className={`mt-12 grid grid-cols-1 items-center gap-12 ${
            hasFrame ? 'lg:grid-cols-[0.82fr_1.18fr] lg:gap-14' : ''
          }`}
        >
          <div>
            {/* Sem a linha de número/status/contexto: ela já apareceu no card
                que trouxe a pessoa até aqui, e repetir logo acima do título só
                atrasa a leitura do nome do projeto. Os mesmos dados seguem no
                `stat` logo abaixo, onde são fato e não etiqueta. */}
            <h1 className="text-[clamp(2rem,4.4vw,3.2rem)] leading-[1.08] font-bold tracking-[-0.02em] text-balance">
              {project.name}
            </h1>

            <p className="mt-6 text-xl leading-relaxed text-balance">
              {project.line}
            </p>

            <ul className="mt-8 flex flex-col gap-2">
              {project.stat.map((s) => (
                <li
                  key={s}
                  className="flex items-baseline gap-3 font-mono text-xs text-foreground/70"
                >
                  <span aria-hidden="true" className="text-accent">
                    ·
                  </span>
                  {s}
                </li>
              ))}
            </ul>

            {project.links?.length ? (
              /* Lista horizontal: um projeto pode ter site no ar e
                 repositório público, e os dois são a mesma classe de ação. */
              <ul className="mt-10 flex flex-wrap items-center gap-4">
                {project.links.map((link) => (
                  <li key={link.href}>
                    <GlowButton href={link.href} external>
                      {link.label}
                      <GlowArrow dir="diagonal" />
                    </GlowButton>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {hasFrame && (
            /* A moldura estoura a própria coluna e sangra pra fora da margem
               direita. É o que dá tamanho de verdade pra tela sem espremer o
               texto do lado esquerdo. O `[overflow-x:clip]` do <main> segura
               a barra de rolagem horizontal. */
            <SlideIn
              from="right"
              className="lg:w-[calc(100%+2.5rem)] xl:w-[calc(100%+6rem)]"
            >
              <ProjectFrame media={project.media} />
            </SlideIn>
          )}
        </div>

        {/* Corpo, quando existe. Sem ele a página vai do topo direto pro
            case, e a primeira seção do case já carrega o próprio respiro. */}
        {project.body ? (
          <div className="mt-24 max-w-2xl">
            <p className="text-lg leading-relaxed text-muted">{project.body}</p>
          </div>
        ) : null}

        {/* Antes e depois lado a lado. Empilhados, os dois blocos ocupavam
            duas telas de rolagem para dizer uma coisa só; em colunas, a
            comparação acontece de um olhar. O filete entre elas existe porque
            duas colunas de texto corrido sem divisor leem como um texto só.
            Ele só aparece quando os DOIS lados existem: num projeto que tem só
            um deles, a coluna sozinha ocupa a largura toda e um filete solto
            marcaria uma divisão que não há. */}
        {project.problem?.length || project.solution?.length ? (
          <section className="mt-20 grid grid-cols-1 gap-x-14 gap-y-12 border-t border-line pt-14 lg:grid-cols-2">
            {project.problem?.length ? (
              <div className="max-w-2xl">
                <h2 className="text-[clamp(1.5rem,2.4vw,2rem)] leading-tight font-bold tracking-[-0.02em] text-balance">
                  Como era antes.
                </h2>
                {project.problem.map((p) => (
                  <p key={p} className="mt-5 leading-relaxed text-muted">
                    {p}
                  </p>
                ))}
              </div>
            ) : null}

            {project.solution?.length ? (
              <div
                className={`max-w-2xl ${
                  project.problem?.length
                    ? 'lg:border-l lg:border-line lg:pl-14'
                    : ''
                }`}
              >
                <h2 className="text-[clamp(1.5rem,2.4vw,2rem)] leading-tight font-bold tracking-[-0.02em] text-balance">
                  O que mudou.
                </h2>
                {project.solution.map((p) => (
                  <p key={p} className="mt-5 leading-relaxed text-muted">
                    {p}
                  </p>
                ))}
              </div>
            ) : null}
          </section>
        ) : null}

        {project.gallery?.length ? (
          <section className="mt-20 border-t border-line pt-14">
            <h2 className="max-w-2xl text-[clamp(1.5rem,2.4vw,2rem)] leading-tight font-bold tracking-[-0.02em] text-balance">
              Por dentro.
            </h2>
            <div className="mt-10">
              <Gallery shots={project.gallery} />
            </div>
          </section>
        ) : null}

        <section className="mt-20 border-t border-line pt-14">
          <h2 className="max-w-xl text-[clamp(1.4rem,2.2vw,1.8rem)] leading-tight font-bold tracking-[-0.02em] text-balance">
            Quer saber como essa parte foi feita?
          </h2>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <GlowButton href="/contato">
              Solicitar orçamento
              <GlowArrow />
            </GlowButton>
            <GlowButton href="/projetos" variant="secondary">
              Ver os outros projetos
            </GlowButton>
          </div>
        </section>
      </article>
    </main>
  );
}
