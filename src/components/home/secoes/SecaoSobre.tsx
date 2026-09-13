import GlowButton, { GlowArrow } from '@/components/ui/GlowButton';
import TituloAcento from '@/components/text/TituloAcento';
import Timeline from '@/components/timeline/Timeline';
import CrachaPreguicoso from './CrachaPreguicoso';
import { getDictionary } from '@/i18n';
import type { Locale } from '@/i18n/config';

type Dict = Awaited<ReturnType<typeof getDictionary>>;

/* Quem faz, em versão curta: a bio, o crachá e a linha do tempo.
 *
 * O crachá 3D é o componente mais pesado do site (three, fiber, drei e o
 * rapier em wasm) e a home já carrega three pela abertura do MacBook. Ele vem
 * assim mesmo porque é a assinatura da página, mas com duas travas no
 * CrachaPreguicoso: só é baixado quando o bloco chega perto da tela, e a
 * física é pausada quando ele sai de quadro. Quem não rola até aqui não paga
 * por ele.
 */
export default function SecaoSobre({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dict;
}) {
  return (
    <section className="relative mx-auto w-full max-w-7xl px-6 pt-24 pb-20 lg:px-10 lg:pt-32">
      <h2 className="max-w-3xl text-[clamp(1.9rem,3.6vw,2.9rem)] leading-tight font-bold tracking-[-0.02em] text-balance">
        <TituloAcento texto={dict.home.sobreTitulo} />
      </h2>

      {/* Duas colunas no desktop, empilhadas no celular. O crachá vem DEPOIS
          do texto na ordem do DOM: num aparelho estreito é a bio que precisa
          aparecer primeiro, e quem lê por leitor de tela não deve esbarrar
          num canvas decorativo antes do conteúdo. */}
      <div className="mt-8 grid grid-cols-1 items-start gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-4">
        <div className="max-w-2xl">
          <p className="text-xl leading-relaxed text-muted lg:text-2xl">
            {dict.about.bioLead}{' '}
            <span className="text-foreground">{dict.about.bioName}</span>
            {dict.about.bioRest}
          </p>

          <div className="mt-10">
            <GlowButton href={`/${locale}/sobre-mim`}>
              {dict.home.sobreVerMais}
              <GlowArrow />
            </GlowButton>
          </div>
        </div>

        {/* Altura fixa e declarada: o canvas do crachá mede o slot pra
            calcular a escala do cartão, então uma caixa que colapsa devolve
            um crachá do tamanho errado — e é por isso que a altura é maior no
            desktop. O tamanho do cartão é DERIVADO da altura do canvas (a
            câmera tem distância e campo fixos), então subir a caixa é o único
            jeito de o crachá crescer. Com 520px ele ficava miúdo ao lado de
            uma coluna de texto larga. */}
        <div className="relative h-[380px] w-full lg:h-[620px]">
          <CrachaPreguicoso />
        </div>
      </div>

      {/* A linha do tempo acende conforme a rolagem passa por ela. Aqui ela
          ganha um papel extra: é o primeiro bloco depois do hero que responde
          ao scroll, e é o que mostra que a página continua. */}
      <div className="mt-16">
        <h3 className="max-w-2xl text-[clamp(1.5rem,2.6vw,2.1rem)] leading-tight font-bold tracking-[-0.02em] text-balance">
          {dict.about.timelineTitle}
        </h3>
        <div className="mt-10">
          <Timeline entries={dict.timeline} nowLabel={dict.about.timelineNow} />
        </div>
      </div>
    </section>
  );
}
