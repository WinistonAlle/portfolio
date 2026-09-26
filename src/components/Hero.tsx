'use client';

import { useEffect, useRef } from 'react';
import { aberturaAtiva } from '@/components/background/abertura';
import TituloAcento from '@/components/text/TituloAcento';
import GlowButton, { GlowArrow } from '@/components/ui/GlowButton';
import type { Locale } from '@/i18n/config';

/* Abertura da home. Vive dentro do portal do MacBook (montado na page), por
   isso ocupa uma tela inteira: é o que o notebook mostra na abertura.

   À esquerda, o que eu faço e pra quem, com prova logo abaixo; à direita, a
   foto grande, apoiada na base, com anéis e brilho atrás.

   Parallax: cada camada com `data-depth` desliza em sentido contrário ao
   cursor, e quanto maior a profundidade, mais ela anda. O fundo (anéis, halo)
   anda mais que a foto, e o texto anda um pouco no sentido oposto, o que dá a
   sensação de planos separados. Na rolagem, a foto e os anéis sobem mais
   devagar que a página. Tudo em `transform`, num laço que para sozinho quando
   as camadas assentam. */
export default function Hero({
  locale,
  t,
  prova,
}: {
  locale: Locale;
  t: {
    title: string;
    ctaProjects: string;
    ctaAbout: string;
    rolar: string;
  };
  prova: string[];
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const layers = [...root.querySelectorAll<HTMLElement>('[data-depth]')].map((el) => ({
      el,
      depth: parseFloat(el.dataset.depth ?? '0'),
      scroll: parseFloat(el.dataset.scroll ?? '0'),
    }));
    // Mouse só onde há mouse; no toque fica só a rolagem.
    const mouse = matchMedia('(hover: hover) and (pointer: fine)').matches;

    let alvoX = 0;
    let alvoY = 0;
    let x = 0;
    let y = 0;
    let rolagem = 0;
    let raf = 0;
    let visivel = true;

    const frame = () => {
      raf = 0;
      x += (alvoX - x) * 0.08;
      y += (alvoY - y) * 0.08;
      for (const l of layers) {
        const dx = -x * l.depth;
        const dy = -y * l.depth + rolagem * l.scroll;
        l.el.style.transform = `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0)`;
      }
      if (Math.abs(alvoX - x) > 0.001 || Math.abs(alvoY - y) > 0.001) acordar();
    };

    const acordar = () => {
      if (!raf && visivel) raf = requestAnimationFrame(frame);
    };

    const onPointer = (e: PointerEvent) => {
      alvoX = (e.clientX / innerWidth - 0.5) * 2;
      alvoY = (e.clientY / innerHeight - 0.5) * 2;
      acordar();
    };

    /* Durante a abertura quem mexe com a rolagem é o portal do MacBook; o
       parallax de rolagem só entra depois, com o hero já em tela cheia. */
    const onScroll = () => {
      rolagem = aberturaAtiva() ? 0 : Math.max(0, -root.getBoundingClientRect().top);
      acordar();
    };

    const io = new IntersectionObserver(([entry]) => {
      visivel = entry.isIntersecting;
      acordar();
    });
    io.observe(root);

    if (mouse) window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      if (mouse) window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  /* A altura desconta o header, que rola junto com a página em vez de ser
     fixo. Vale nos dois estados: dentro do portal, a tela do notebook mostra
     header + hero e o conjunto tem que caber nos 100svh do .portal__content;
     depois de entrar, é o que faz o hero ocupar a tela exata. */
  return (
    <section
      ref={ref}
      className="ambient hero relative isolate flex min-h-[calc(100svh-var(--header-h))] flex-col overflow-hidden"
    >
      <div className="hero__grade relative z-10 mx-auto grid w-full max-w-[88rem] flex-1 grid-cols-1 px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-6 lg:px-10">
        <div className="hero__texto self-center pt-12 lg:pt-0 lg:pb-16" data-depth="-6">
          <h1 className="hero__titulo">
            <TituloAcento texto={t.title} />
          </h1>

          <div className="mt-10 flex flex-wrap items-center gap-3">
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

        {/* A base do busto encosta na base da seção. Atrás dela, do fundo
            para a frente: anéis (os que mais andam), halo e a foto. */}
        <div className="hero__foto relative flex justify-center self-end lg:justify-end">
          <span className="hero__anel hero__anel--fora" data-depth="34" data-scroll="0.28" aria-hidden="true">
            <i />
          </span>
          <span className="hero__anel hero__anel--dentro" data-depth="22" data-scroll="0.2" aria-hidden="true">
            <i />
          </span>
          <span className="hero__halo" data-depth="16" data-scroll="0.14" aria-hidden="true" />
          <div className="hero__img-wrap relative" data-depth="9" data-scroll="0.08">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/winiston-hero.png"
              alt="Winiston Alle"
              className="hero__img block h-auto select-none"
              draggable={false}
            />
          </div>
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
