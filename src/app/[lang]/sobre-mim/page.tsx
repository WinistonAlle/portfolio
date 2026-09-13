import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { preload } from 'react-dom';
import LanyardBadge from '@/components/lanyard/LanyardBadge';
import StackGraph from '@/components/stack/StackGraph';
import EchoText from '@/components/text/EchoText';
import { Iphone16Pro } from '@/components/iphone/Iphone16Pro';
import SlideIn from '@/components/scroll/SlideIn';
import VideoLoop from '@/components/media/VideoLoop';
import Timeline from '@/components/timeline/Timeline';
import GlowButton, { GlowArrow } from '@/components/ui/GlowButton';
import { getDictionary } from '@/i18n';
import { isLocale } from '@/i18n/config';
import TituloAcento from '@/components/text/TituloAcento';
import CtaBlock from '@/components/ui/CtaBlock';

/* O modelo do crachá só era pedido depois que o chunk do three baixava,
   parseava e montava — mais de um segundo depois do HTML, atrás de tudo que o
   navegador já tinha na fila. Pedindo aqui, ele começa junto com a página. */
function preloadCracha() {
  preload('/card.glb', { as: 'fetch', crossOrigin: 'anonymous' });
}

export async function generateMetadata(
  props: PageProps<'/[lang]/sobre-mim'>,
): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);

  return {
    title: dict.about.metaTitle,
    description: dict.about.metaDescription,
    alternates: {
      languages: {
        'pt-BR': '/pt/sobre-mim',
        en: '/en/sobre-mim',
        'x-default': '/pt/sobre-mim',
      },
    },
  };
}

export default async function SobreMimPage(
  props: PageProps<'/[lang]/sobre-mim'>,
) {
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();

  preloadCracha();

  const dict = await getDictionary(lang);

  return (
    <main className="relative z-10 flex-1">
      {/* id="topo": o header usa isso pra saber que essa página tem um bloco
          de abertura "hero-like" e ficar transparente sobre ele — o crachá
          (e o layout que o acompanha) morava no Hero da home; migrou pra cá
          inteiro, junto com o resto do texto que já estava aqui. */}
      {/* min-h-svh: garante que a seção de abertura ocupa a tela toda, senão
          o "Stack" da seção seguinte aparecia colado, dava pra ver as duas
          já na primeira rolagem. */}
      <section
        id="topo"
        className="ambient relative isolate min-h-svh overflow-hidden"
      >
        {/* Mais largo que o max-w-7xl do resto do site: o título é um SVG que
            escala pela largura da coluna, então largura aqui vira tamanho de
            título e de crachá. */}
        <div className="relative z-10 mx-auto grid w-full max-w-[100rem] grid-cols-1 items-start gap-8 px-6 pt-24 pb-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:px-10 lg:pt-24 lg:pb-20">
          {/* ------------------------------------------------------ copy
              z-10: o canvas do crachá ocupa a largura toda e passa *atrás*
              da copy, então o texto precisa ficar por cima (e os cliques). */}
          {/* pt extra só nesta coluna: descer o grid inteiro arrastaria o
              canvas do crachá junto e a fita descolaria do topo da página */}
          <div className="relative z-10 max-w-4xl lg:pt-56">
            {/* Mesmo efeito do título do Hero: contorno vazado com rastro que
                segue o cursor (EchoText + echo-text--outlined), na mesma
                Space Grotesk. */}
            <h1>
              <EchoText
                text={dict.about.heroTitle}
                className="echo-text--outlined"
                /* O mínimo era 1.9rem e o título saía com 406px numa tela de
                   390px, criando rolagem horizontal. Agora o piso é em vw até
                   dar 1.9rem por volta de 560px de largura, então o desktop
                   não muda em nada. */
                fontSize="clamp(1.2rem, 6.2vw, 3.6rem)"
                fontWeight={700}
                style={{ fontFamily: 'var(--font-display)' }}
              />
            </h1>

            <p className="mt-8 max-w-2xl text-2xl leading-relaxed text-muted">
              {dict.about.bioLead}{' '}
              <span className="text-foreground">{dict.about.bioName}</span>
              {dict.about.bioRest}
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <GlowButton href={`/${lang}/projetos`}>
                {dict.about.ctaProjects}
                <GlowArrow />
              </GlowButton>
              <GlowButton href={`/${lang}/contato`} variant="secondary">
                {dict.about.ctaContact}
              </GlowButton>
            </div>
          </div>

          {/* ---------------------------------------------------- badge
              Abaixo de lg fica no fluxo normal, empilhado sob o texto. Em lg,
              vira absoluto: sem isso, essa coluna (bem mais alta que a do
              texto) esticava a linha do grid inteira, e sobrava um vão vazio
              enorme embaixo do texto até a próxima seção. Como posicionado
              absoluto sai do fluxo, quem passa a ditar a altura da seção é só
              o texto. `top-0`/`right-0` encostam no canto da própria caixa de
              padding do grid (não do conteúdo), o que já cancela o pt-24 sem
              precisar de margem negativa — o mesmo efeito que a margem tinha
              antes. */}
          <div className="relative z-0 h-[62vh] min-h-[420px] lg:absolute lg:top-0 lg:right-0 lg:z-0 lg:h-[104vh] lg:w-[47.5%] lg:min-h-0">
            <LanyardBadge />
          </div>
        </div>
      </section>

      {/* Stack como grafo 3D em vez de lista de tecnologias. Sem moldura e
          sem overlays, o canvas vai de ponta a ponta: o desenho se encaixa na
          caixa, e como as labels longas fazem a largura ser o gargalo do
          encaixe, tela cheia é o que deixa o grafo maior. */}
      <section className="relative w-full pb-28">
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
          <h2 className="max-w-2xl text-[clamp(1.8rem,3vw,2.6rem)] leading-tight font-bold tracking-[-0.02em] text-balance">
            <TituloAcento texto={dict.about.stackTitle} />
          </h2>
        </div>

        <div className="mt-4 w-full">
          <StackGraph />
        </div>
      </section>

      <section className="relative w-full pb-28">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:px-10">
          <SlideIn className="mx-auto w-[min(70vw,280px)] lg:w-[min(20vw,300px)]">
            <Iphone16Pro
              className="w-full"
              screen={
                <VideoLoop
                  src="/portal-pedidos.mp4"
                  className="h-full w-full object-cover"
                />
              }
            />
          </SlideIn>

          <p className="max-w-2xl text-2xl leading-relaxed text-muted">
            {dict.about.workText}
          </p>
        </div>
      </section>

      {/* Trajetória: última seção da página. O respiro grande embaixo é de
          propósito, senão o último ponto da fita acende já colado no rodapé. */}
      <section className="relative w-full pt-4 pb-40">
        <div className="mx-auto w-full max-w-6xl px-6 lg:px-10">
          <h2 className="max-w-2xl text-[clamp(1.8rem,3vw,2.6rem)] leading-tight font-bold tracking-[-0.02em] text-balance">
            {dict.about.timelineTitle}
          </h2>

          <div className="mt-16 lg:mt-20">
            <Timeline entries={dict.timeline} nowLabel={dict.about.timelineNow} />
          </div>
        </div>
      </section>

      {/* Fecho da página. A ordem dos botões é invertida em relação ao topo:
          lá em cima o visitante ainda não sabe quem eu sou e o projeto vem
          primeiro; aqui ele já leu a página inteira, então conversar é a
          ação natural e fica como botão principal. */}
      <section className="relative w-full pb-32">
        <div className="mx-auto w-full max-w-4xl px-6 lg:px-10">
          <CtaBlock titulo={dict.about.ctaTitle} texto={dict.about.ctaText}>
            <GlowButton href={`/${lang}/contato`}>
              {dict.about.ctaContact}
              <GlowArrow />
            </GlowButton>
            <GlowButton href={`/${lang}/projetos`} variant="secondary">
              {dict.about.ctaProjects}
            </GlowButton>
          </CtaBlock>
        </div>
      </section>
    </main>
  );
}
