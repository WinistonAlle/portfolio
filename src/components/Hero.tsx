import EchoText from '@/components/text/EchoText';
import TechStickers from '@/components/TechStickers';
import GlowButton, { GlowArrow } from '@/components/ui/GlowButton';
import type { Locale } from '@/i18n/config';

/* Abertura: "PORTFÓLIO" gigante ao fundo, e a foto recortada por cima, reta e
   apoiada na base da seção. O crachá 3D e a bio migraram pra /sobre-mim. Este
   bloco vive dentro do portal do MacBook (montado na page), por isso ocupa
   uma tela inteira: é o que o notebook mostra na abertura. */
export default function Hero({
  locale,
  t,
}: {
  locale: Locale;
  t: { title: string; ctaProjects: string; ctaAbout: string };
}) {
  return (
    <section className="ambient relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden">
      {/* Título ao fundo, cruzando atrás da cabeça; a foto está em z-10 e
          continua por cima. */}
      <div className="absolute inset-x-0 top-[14%] z-0 -translate-y-1/2 px-6 text-center lg:px-10">
        <EchoText
          text={t.title}
          className="echo-text--outlined"
          fontSize="clamp(4rem, 13vw, 13rem)"
          fontWeight={700}
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        />
      </div>

      {/* CTAs acima da foto na ordem do DOM, mas posicionados: assim a foto
          pode encostar na base sem empurrar os botões para fora. */}
      <div className="absolute inset-x-0 bottom-24 z-20 flex flex-wrap items-center justify-center gap-3 px-6 lg:px-10">
        <GlowButton href={`/${locale}/projetos`}>
          {t.ctaProjects}
          <GlowArrow />
        </GlowButton>
        <GlowButton href={`/${locale}/sobre-mim`} variant="secondary">
          {t.ctaAbout}
        </GlowButton>
      </div>

      <TechStickers />

      {/* A base do busto encosta na base da seção. */}
      <div className="relative z-10 flex justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/sticker-winiston-v4.png"
          alt="Winiston Alle"
          className="block h-auto w-[clamp(28rem,62vw,53rem)] select-none"
          draggable={false}
        />
      </div>
    </section>
  );
}
