import ProjectCard from '@/components/projects/ProjectCard';
import ProjectGrid, {
  type Aba,
  type Item,
} from '@/components/projects/ProjectGrid';
import { PROJECTS, PROJECT_GROUPS } from '@/data/projects';
import GlowButton, { GlowArrow } from '@/components/ui/GlowButton';
import { getDictionary } from '@/i18n';
import type { Locale } from '@/i18n/config';

/* As gavetas e os cards são montados AQUI, no servidor, e vão pro filtro já
   prontos. É o que mantém o texto dos cases fora do bundle do navegador; a
   razão longa está no comentário do ProjectGrid.

   Só entram gavetas com projeto dentro: a lista cresce um projeto por vez e um
   filtro que devolve grade vazia é um botão que só serve pra frustrar. */
type Dict = Awaited<ReturnType<typeof getDictionary>>;

function montarAbas(dict: Dict): Aba[] {
  const usadas = PROJECT_GROUPS.filter((g) =>
    PROJECTS.some((p) => p.groups.includes(g)),
  );
  /* A CHAVE do filtro é o rótulo traduzido, e não o identificador da gaveta:
     o estado do filtro vive no cliente e só precisa casar consigo mesmo. Assim
     o componente de cliente não conhece nem o tipo ProjectGroup, e continua
     sem nenhuma linha de import apontando pro módulo dos projetos. */
  return [
    { chave: dict.projects.filterAll, total: PROJECTS.length },
    ...usadas.map((g) => ({
      chave: dict.projects.groups[g],
      total: PROJECTS.filter((p) => p.groups.includes(g)).length,
    })),
  ];
}

function montarItens(dict: Dict, locale: Locale): Item[] {
  return PROJECTS.map((project) => ({
    slug: project.slug,
    grupos: project.groups.map((g) => dict.projects.groups[g]),
    card: (
      <ProjectCard
        project={project}
        locale={locale}
        cardCta={dict.projects.cardCta}
        statusWip={dict.project.statusWip}
      />
    ),
  }));
}

/* Grade de /projetos. Cada card abre a página do projeto.

   Cards soltos, cada um com a sua borda e o seu canto arredondado, separados
   por um vão de verdade. A versão anterior era uma grade contínua (vão de 1px
   sobre a cor da linha), e os projetos apareciam como células de uma tabela em
   vez de oito coisas separadas. */
export default async function Projects({ locale }: { locale: Locale }) {
  const dict = await getDictionary(locale);

  return (
    <section
      id="projetos"
      className="relative mx-auto w-full max-w-7xl px-6 pt-16 pb-28 lg:px-10 lg:pt-20"
    >
      {/* Nada de contagem no título: a grade cresce um projeto por vez, e um
          número escrito na mão vira mentira na primeira adição. */}
      <h1 className="max-w-3xl text-[clamp(1.9rem,3.6vw,2.9rem)] leading-tight font-bold tracking-[-0.02em] text-balance">
        {dict.projects.title}
      </h1>
      {/* Só o filtro roda no cliente. Os cards chegam nele já renderizados. */}
      <ProjectGrid
        abas={montarAbas(dict)}
        itens={montarItens(dict, locale)}
        filterLabel={dict.projects.filterLabel}
        countOne={dict.projects.countOne}
        countMany={dict.projects.countMany}
      />

      {/* Fecho: quem chegou até aqui já passou pela grade inteira, então a
          próxima ação é conversar, não continuar navegando. */}
      <div className="mt-20">
        <div className="cta">
          <div className="cta__inner">
            <h2 className="mx-auto max-w-2xl text-[clamp(1.8rem,3.2vw,2.6rem)] leading-tight font-bold tracking-[-0.02em] text-balance">
              {dict.projects.ctaTitle}
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted">
              {dict.projects.ctaText}
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <GlowButton href={`/${locale}/contato`}>
                {dict.projects.ctaButton}
                <GlowArrow />
              </GlowButton>
              <GlowButton href={`/${locale}/sobre-mim`} variant="secondary">
                {dict.projects.ctaAbout}
              </GlowButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
