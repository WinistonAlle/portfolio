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
  t: { title: string; ctaProjects: string; ctaAbout: string; rolar: string };
}) {
  /* A altura desconta o header, que rola junto com a página em vez de ser
     fixo. Vale nos dois estados: dentro do portal, a tela do notebook mostra
     header + hero e o conjunto tem que caber nos 100svh do .portal__content;
     depois de entrar, é o que faz o hero ocupar a tela exata. Deixou de ser
     uma trava e virou um piso: a home agora continua abaixo, e é o conteúdo
     das seções que passa a dar altura ao documento. */
  return (
    <section className="ambient relative isolate flex min-h-[calc(100svh-var(--header-h))] flex-col justify-end overflow-hidden">
      {/* Título ao fundo, cruzando atrás da cabeça; a foto está em z-10 e
          continua por cima. */}
      <div className="absolute inset-x-0 top-[14%] z-0 -translate-y-1/2 px-6 text-center lg:px-10">
        <EchoText
          text={t.title}
          className="echo-text--outlined"
          fontSize="clamp(4rem, 13vw, 13rem)"
          fontWeight={700}
          style={{ fontFamily: 'var(--font-display)' }}
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

      {/* Indicador de que a página continua.
          Passou a ser necessário quando a home virou página única: o hero
          termina exatamente na dobra, e sem nenhuma pista de que há mais
          embaixo, uma tela que acaba certinho na borda lê como página inteira.
          Fica abaixo dos CTAs e some do leitor de tela — é dica visual, não
          conteúdo. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-7 z-20 flex flex-col items-center gap-2"
      >
        <span className="label !text-[0.6rem] opacity-60">{t.rolar}</span>
        <span className="hero-rolar" />
      </div>

      <TechStickers />

      {/* A base do busto encosta na base da seção. */}
      <div className="relative z-10 flex justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/sticker-winiston-v4.png"
          alt="Winiston Alle"
          /* `max-h` e `object-contain`: a largura continua mandando enquanto a
             foto couber, mas em tela baixa é a altura que passa a limitar, em
             vez de a foto esticar a home e deixar sobrar rolagem embaixo. O
             `max-w-full` é pro celular, onde o piso de 28rem do clamp é mais
             largo que a tela. */
          className="block h-auto w-[clamp(28rem,62vw,53rem)] max-h-[calc(100svh-var(--header-h))] max-w-full object-contain select-none"
          draggable={false}
        />
      </div>
    </section>
  );
}
