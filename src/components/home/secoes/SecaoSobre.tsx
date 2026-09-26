import GlowButton, { GlowArrow } from '@/components/ui/GlowButton';
import TituloAcento from '@/components/text/TituloAcento';
import Timeline from '@/components/timeline/Timeline';
import { getDictionary } from '@/i18n';
import type { Locale } from '@/i18n/config';

type Dict = Awaited<ReturnType<typeof getDictionary>>;

/* Quem faz, em versão curta: a bio e a linha do tempo.
 *
 * O crachá 3D morava aqui ao lado da bio e saiu a pedido: na home ele
 * destoava da abertura nova. Continua sendo a abertura da página "sobre mim",
 * onde é o que a pessoa foi ver (e o HomeShell segue aquecendo o cache dele,
 * pra que chegar lá seja instantâneo). */
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

      <div className="mt-8 max-w-3xl">
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
