import TituloAcento from '@/components/text/TituloAcento';
import GlowButton, { GlowArrow } from '@/components/ui/GlowButton';
import type { Locale } from '@/i18n/config';

/* Abertura da home. Vive dentro do portal do MacBook (montado na page), por
   isso ocupa uma tela inteira: é o que o notebook mostra na abertura.

   Antes o centro era "PORTFÓLIO" gigante com a foto cortando a palavra e
   adesivos de tecnologia em volta. O maior espaço da página era um rótulo, e
   os logos competiam com o rosto. Agora cada coisa tem um trabalho:

   - à esquerda, o que eu faço e pra quem, com prova logo abaixo;
   - à direita, a foto, grande e apoiada na base, sem disputar com nada.

   A stack continua na seção dela, logo abaixo. */
export default function Hero({
  locale,
  t,
  prova,
}: {
  locale: Locale;
  t: {
    eyebrow: string;
    title: string;
    sub: string;
    ctaProjects: string;
    ctaAbout: string;
    rolar: string;
  };
  prova: string[];
}) {
  /* A altura desconta o header, que rola junto com a página em vez de ser
     fixo. Vale nos dois estados: dentro do portal, a tela do notebook mostra
     header + hero e o conjunto tem que caber nos 100svh do .portal__content;
     depois de entrar, é o que faz o hero ocupar a tela exata. */
  return (
    <section className="ambient hero relative isolate flex min-h-[calc(100svh-var(--header-h))] flex-col overflow-hidden">
      <div className="hero__grade relative z-10 mx-auto grid w-full max-w-[84rem] flex-1 grid-cols-1 px-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-10 lg:px-10">
        <div className="hero__texto self-center pt-10 lg:pt-0 lg:pb-16">
          <p className="label hero__eyebrow">{t.eyebrow}</p>

          <h1 className="hero__titulo">
            <TituloAcento texto={t.title} />
          </h1>

          <p className="hero__sub">{t.sub}</p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <GlowButton href={`/${locale}/projetos`}>
              {t.ctaProjects}
              <GlowArrow />
            </GlowButton>
            <GlowButton href={`/${locale}/sobre-mim`} variant="secondary">
              {t.ctaAbout}
            </GlowButton>
          </div>

          {/* Fatos verificáveis, em mono: é número e dado, que é o papel da
              fonte mono no site. */}
          <ul className="hero__prova">
            {prova.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        {/* A base do busto encosta na base da seção; o brilho atrás e o
            esfumado embaixo integram o recorte ao fundo. */}
        <div className="hero__foto relative flex justify-center self-end lg:justify-end">
          <span className="hero__halo" aria-hidden="true" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/winiston-hero.png"
            alt="Winiston Alle"
            className="hero__img relative block h-auto select-none"
            draggable={false}
          />
        </div>
      </div>

      {/* Indicador de que a página continua: o hero termina exatamente na
          dobra, e sem nenhuma pista uma tela que acaba certinho na borda lê
          como página inteira. Dica visual, fora do leitor de tela. No
          desktop fica sob a coluna de texto, pra não cair em cima da foto. */}
      <div
        aria-hidden="true"
        className="hero__rolar pointer-events-none absolute bottom-7 z-20 hidden flex-col items-start gap-2 lg:flex"
      >
        <span className="label !text-[0.6rem] opacity-60">{t.rolar}</span>
        <span className="hero-rolar" />
      </div>
    </section>
  );
}
