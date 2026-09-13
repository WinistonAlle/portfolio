import { Fragment } from 'react';
import GlowButton, { GlowArrow } from '@/components/ui/GlowButton';
import TituloAcento from '@/components/text/TituloAcento';
import { montarItens, TOTAL_PROJETOS } from '@/components/projects/montar';
import { getDictionary } from '@/i18n';
import type { Locale } from '@/i18n/config';

type Dict = Awaited<ReturnType<typeof getDictionary>>;

/* Os projetos mais recentes.
 *
 * Sem o filtro por grupo, de propósito. O filtro é bom na página, onde há doze
 * projetos e faz diferença separar cliente de produto próprio; com seis cards
 * ele não tem o que filtrar, e `ProjectGrid` é componente de cliente — trazê-lo
 * pra cá custaria bundle pra entregar um controle inútil.
 *
 * Como não há filtro, os cards são renderizados direto. Eles já vêm prontos do
 * `montarItens`, o mesmo que a página usa, então não existe chance de um card
 * ficar diferente aqui e lá.
 */
export default function SecaoProjetos({
  locale,
  dict,
  limite = 6,
}: {
  locale: Locale;
  dict: Dict;
  limite?: number;
}) {
  const itens = montarItens(dict, locale, limite);

  return (
    <section className="relative mx-auto w-full max-w-7xl px-6 pb-24 lg:px-10">
      <h2 className="max-w-3xl text-[clamp(1.9rem,3.6vw,2.9rem)] leading-tight font-bold tracking-[-0.02em] text-balance">
        <TituloAcento texto={dict.home.projetosTitulo} />
      </h2>

      {/* Mesma grade da página. `ProjectCard` já é o <li>, por isso o Fragment
          em volta: um <li> dentro de outro <li> é HTML inválido. */}
      <ul className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
        {itens.map((item) => (
          <Fragment key={item.slug}>{item.card}</Fragment>
        ))}
      </ul>

      <div className="mt-12">
        <GlowButton href={`/${locale}/projetos`}>
          {dict.home.projetosVerTodos.replace('{n}', String(TOTAL_PROJETOS))}
          <GlowArrow />
        </GlowButton>
      </div>
    </section>
  );
}
