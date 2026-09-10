import ProjectCard from '@/components/projects/ProjectCard';
import { PROJECTS } from '@/data/projects';
import GlowButton, { GlowArrow } from '@/components/ui/GlowButton';

/* Grade de /projetos. Cada card abre a página do projeto.

   Cards soltos, cada um com a sua borda e o seu canto arredondado, separados
   por um vão de verdade. A versão anterior era uma grade contínua (vão de 1px
   sobre a cor da linha), e os projetos apareciam como células de uma tabela em
   vez de oito coisas separadas. */
export default function Projects() {
  return (
    <section
      id="projetos"
      className="relative mx-auto w-full max-w-7xl px-6 pt-16 pb-28 lg:px-10 lg:pt-20"
    >
      {/* Nada de contagem no título: a grade cresce um projeto por vez, e um
          número escrito na mão vira mentira na primeira adição. */}
      <h1 className="max-w-3xl text-[clamp(1.9rem,3.6vw,2.9rem)] leading-tight font-bold tracking-[-0.02em] text-balance">
        Conheça um pouco do meu trabalho.
      </h1>
      <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
        Tem projeto de cliente, produto meu, trabalho de faculdade e coisa ainda
        em construção. Clica em qualquer card pra ver o que tem por dentro.
      </p>

      <ul className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
        {PROJECTS.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </ul>

      {/* Fecho: quem chegou até aqui já passou pela grade inteira, então a
          próxima ação é conversar, não continuar navegando. */}
      <div className="mt-20">
        <div className="cta">
          <div className="cta__inner">
            <h2 className="mx-auto max-w-2xl text-[clamp(1.8rem,3.2vw,2.6rem)] leading-tight font-bold tracking-[-0.02em] text-balance">
              Quer um assim pro seu negócio?
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted">
              Me conta o que você precisa e eu volto com escopo, prazo e preço.
              O orçamento é gratuito e a gente ajusta junto até chegar no que
              funciona pra você.
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <GlowButton href="/contato">
                Solicitar orçamento
                <GlowArrow />
              </GlowButton>
              <GlowButton href="/sobre-mim" variant="secondary">
                Sobre mim
              </GlowButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
