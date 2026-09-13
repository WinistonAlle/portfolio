import ProjectGrid from '@/components/projects/ProjectGrid';
import { montarAbas, montarItens } from '@/components/projects/montar';
import GlowButton, { GlowArrow } from '@/components/ui/GlowButton';
import { getDictionary } from '@/i18n';
import type { Locale } from '@/i18n/config';
import TituloAcento from '@/components/text/TituloAcento';
import CtaBlock from '@/components/ui/CtaBlock';

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
        <TituloAcento texto={dict.projects.title} />
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
        <CtaBlock titulo={dict.projects.ctaTitle} texto={dict.projects.ctaText}>
          <GlowButton href={`/${locale}/contato`}>
            {dict.projects.ctaButton}
            <GlowArrow />
          </GlowButton>
          <GlowButton href={`/${locale}/sobre-mim`} variant="secondary">
            {dict.projects.ctaAbout}
          </GlowButton>
        </CtaBlock>
      </div>
    </section>
  );
}
