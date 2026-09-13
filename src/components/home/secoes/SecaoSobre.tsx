import GlowButton, { GlowArrow } from '@/components/ui/GlowButton';
import TituloAcento from '@/components/text/TituloAcento';
import Timeline from '@/components/timeline/Timeline';
import { getDictionary } from '@/i18n';
import type { Locale } from '@/i18n/config';

type Dict = Awaited<ReturnType<typeof getDictionary>>;

/* Quem faz, em versão curta.
 *
 * A página "sobre mim" abre com o crachá 3D pendurado. Ele NÃO vem para cá, e
 * a ausência é a decisão: é o componente mais pesado do site (three + fiber +
 * drei + rapier em wasm), e a home já carrega three para a abertura do
 * MacBook. Além do custo, há o motivo de produto: se o melhor da página já
 * está na home, o botão "conhecer melhor" não tem o que prometer.
 *
 * O que vem é o que sustenta o argumento em texto: a bio e a linha do tempo,
 * que conta a virada de área em três marcos.
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

      <p className="mt-8 max-w-2xl text-xl leading-relaxed text-muted lg:text-2xl">
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

      {/* A linha do tempo acende conforme a rolagem passa por ela. Aqui ela
          ganha um papel extra: é o primeiro bloco depois do hero que responde
          ao scroll, e é o que mostra que a página continua. */}
      <div className="mt-20">
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
