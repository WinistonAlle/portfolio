'use client';

/* A home abre dentro do MacBook: só a moldura sobre o fundo animado, sem
 * header nem conteúdo solto. Rolando, o zoom entra na tela até o site assumir
 * a página inteira, e a partir daí a navegação é normal.
 *
 * Duas fases, e a segunda é a parte que costuma dar errado:
 *
 *  1. Zoom. O conteúdo fica `fixed`, ocupando a viewport, e começa reduzido
 *     (escala --s0) recortado pelo retângulo da tela do MacBook. A escala vai
 *     até 1, então ele termina em tamanho natural, não ampliado.
 *  2. Entrada. Ao completar, o espaçador some, o conteúdo volta para o fluxo
 *     e a rolagem é levada a zero no mesmo frame. A troca é invisível porque
 *     nos dois lados dela o topo do conteúdo está no topo da tela: antes
 *     porque ele estava preso ali em escala 1, depois porque a página está no
 *     começo. É de mão única de propósito — voltar para o zoom exigiria
 *     desfazer esse pulo de rolagem a cada quadro, e o efeito é uma entrada,
 *     não um estado em que se fica indo e voltando.
 *
 * O espaçador precisa medir o percurso mais uma tela: com o conteúdo fora do
 * fluxo, ele é a única altura que o documento tem, e sem essa sobra a rolagem
 * disponível acabaria antes de o zoom completar.
 */

import dynamic from 'next/dynamic';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { MacbookPro } from './MacbookPro';
import { canRun3D } from './laptop-scene';
import Header from '@/components/Header';
import type { Locale } from '@/i18n/config';

type Nav = { about: string; projects: string; contact: string };
import { usePixelTransition } from '@/components/transition/PixelTransition';
import { jumpScrollTo } from '@/components/scroll/SmoothScroll';

/* ssr:false porque não existe WebGL no servidor, e porque o bundle do three
   não pode entrar no HTML inicial. Enquanto ele não chega, quem está na tela é
   o SVG de sempre: não existe buraco em momento nenhum. */
const MacbookIntro3D = dynamic(() => import('./MacbookIntro3D'), {
  ssr: false,
});

/* Rolagem que a cena 3D consome antes de o zoom do portal começar. Some com o
   travelVh: o total é o que a pessoa rola até ver o site, e é esse número que
   importa vigiar, não este sozinho. */
/* Rolagem que a cena 3D consome antes de o zoom do portal começar. É o botão
   de velocidade da abertura: as fases dentro de laptop-scene são frações
   disto, então subir este número deixa o giro e a abertura mais lentos sem
   mexer na coreografia. */
const INTRO_VH = 190;

/* Abaixo disto, nem cena 3D nem moldura: o boot entrega direto a home.

   O portal existe pra mostrar o site rodando DENTRO de um notebook. Num
   aparelho de 390px o notebook ocupa ~218px, e o que está na tela dele fica
   ilegível — sobra a rolagem do zoom sem a ideia que ela servia. No celular o
   loading já faz o papel de abertura sozinho. */
const SEM_PORTAL = '(max-width: 640px)';

/* Geometria da tela dentro do SVG (viewBox 650x400). */
const SCREEN_W_RATIO = 501.22 / 650;
const SCREEN_ASPECT = 501.22 / 323.85;
const SVG_ASPECT = 400 / 650;
/* A tela não é centrada no SVG: fica 4,19% da altura acima do meio. */
const SCREEN_Y_OFFSET = ((21.32 + 345.17) / 2 - 400 / 2) / 400;

export default function MacbookPortal({
  children,
  header,
  startScale = 0.56,
  /** Quanta rolagem o zoom consome, em porcentagem da altura da tela. */
  travelVh = 130,
}: {
  children: React.ReactNode;
  /* Props do Header pra cópia que aparece DENTRO da tela do notebook. Chegam
     por aqui porque o Header precisa de idioma e de texto traduzido, e este
     componente é de cliente: quem tem essas coisas é a página, no servidor. */
  header: { locale: Locale; nav: Nav; switchLabel: string };
  startScale?: number;
  travelVh?: number;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const [entered, setEntered] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const { setChromeHidden, bootActive } = usePixelTransition();

  /* O 3D é o extra; o caminho padrão é o portal de sempre. Detecção por
     CAPACIDADE e não por largura: um iPad Pro roda melhor que um notebook de
     escritório com GPU integrada velha. Roda em efeito, depois da hidratação,
     então o HTML servido é sempre o mesmo nos dois casos. */
  /* Três estados, não dois: `null` é "ainda não decidi". O servidor e o
     primeiro quadro do navegador caem nele, e nesse estado NADA de moldura é
     renderizado. Era daí que vinha o flash: com `false` como inicial, o HTML
     do servidor já trazia o mockup SVG, e o navegador pintava ele antes da
     hidratação, antes da cortina do boot e muito antes de o three carregar. */
  const [use3D, setUse3D] = useState<boolean | null>(null);
  /* 0 = tela do laptop apagada, 1 = conteúdo aceso. A cena avisa quando a
     câmera assentou; antes disso o conteúdo apareceria desencaixado da tela,
     que ainda está se movendo. */
  const [boot, setBoot] = useState(0);
  /* Primeiro quadro 3D pintado. Até lá quem aparece é a moldura SVG, senão
     existiria um instante de tela vazia esperando o bundle do three. */
  const [ready3D, setReady3D] = useState(false);
  /* Celular: sem moldura e sem zoom, o site começa já entrado. */
  const [skipPortal, setSkipPortal] = useState(false);
  /* Rede de segurança: se o bundle do three não pintar o primeiro quadro em
     tempo razoável (rede ruim, GPU recusando contexto depois do canRun3D),
     cai pro SVG em vez de deixar a pessoa olhando um vazio. */
  const [failed3D, setFailed3D] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    /* Telas pequenas ficam fora, e isso é decisão de produto, não de
       capacidade: um iPhone novo passa no canRun3D sem esforço. O problema é
       outro. A graça da abertura é o site rodando DENTRO do notebook, e num
       aparelho de 390px o notebook ocupa ~218px: não dá pra ler nada do que
       está na tela dele. Somando a isso mais de três telas de rolagem só pra
       atravessar a intro, o efeito sai caro e entrega pouco.

       No celular vale o portal de sempre, que é o caminho que já existia. */
    const telaPequena = window.matchMedia(SEM_PORTAL).matches;
    setSkipPortal(telaPequena);
    setUse3D(!reduced && !telaPequena && canRun3D());
  }, []);

  const on3D = use3D === true && !failed3D;

  useEffect(() => {
    if (!on3D || ready3D) return;
    const timer = window.setTimeout(() => setFailed3D(true), 2500);
    return () => window.clearTimeout(timer);
  }, [on3D, ready3D]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    /* Dois motivos para entrar direto, mesmo caminho: quem pediu menos
       movimento, e o celular, onde o portal não se paga. */
    if (reduced || skipPortal) {
      root.style.setProperty('--p', '1');
      setEntered(true);
      return;
    }

    const update = () => {
      rafRef.current = 0;
      /* A cena 3D consome a primeira fatia da rolagem; o zoom só começa
         depois dela. Sem 3D o deslocamento é zero e nada muda. */
      const intro = on3D ? (INTRO_VH / 100) * window.innerHeight : 0;
      const travel = (travelVh / 100) * window.innerHeight;
      const p =
        travel > 0
          ? Math.min(1, Math.max(0, (window.scrollY - intro) / travel))
          : 1;
      root.style.setProperty('--p', p.toFixed(4));
      if (p >= 1) setEntered(true);
    };

    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [travelVh, on3D, skipPortal]);

  /* O MacBook sobe para dentro de quadro quando o boot termina. A espera
     curta é para ele entrar com a cortina de pixel já abrindo, e não atrás
     dela ainda fechada. */
  useEffect(() => {
    /* Com a cena 3D na frente, o notebook já entra em quadro pelo giro dela.
       Manter também a subida do portal daria duas animações de entrada
       disputando os mesmos segundos. */
    if (on3D) {
      setRevealed(true);
      return;
    }
    if (bootActive) {
      setRevealed(false);
      return;
    }
    const timer = window.setTimeout(() => setRevealed(true), 260);
    return () => window.clearTimeout(timer);
  }, [bootActive, on3D]);

  /* O header real (do layout raiz) só aparece depois de entrar: enquanto o
     MacBook está em quadro, quem aparece é a cópia renderizada dentro da
     tela do notebook, logo abaixo. */
  useEffect(() => {
    setChromeHidden(!entered);
    return () => setChromeHidden(false);
  }, [entered, setChromeHidden]);

  /* No mesmo quadro em que o conteúdo volta ao fluxo, a rolagem vai a zero.
     Antes disso ele estava preso no topo da tela em escala 1, então o topo do
     conteúdo já era o topo da tela: com a página no começo, continua sendo, e
     a troca não aparece. Em layout effect para acontecer antes da pintura. */
  useLayoutEffect(() => {
    if (entered) jumpScrollTo(0);
  }, [entered]);

  return (
    <div
      ref={rootRef}
      className={`portal${entered ? ' portal--entered' : ''}${revealed ? ' portal--revealed' : ''}`}
      style={
        {
          '--p': 0,
          '--s0': startScale,
          /* O inverso vai pronto para o CSS multiplicar em vez de dividir:
             `calc()` aceita divisão por variável, mas multiplicação não tem
             canto escuro em navegador nenhum. */
          '--inv-s0': 1 / startScale,
          '--screen-ratio': SCREEN_W_RATIO,
          '--screen-aspect': SCREEN_ASPECT,
          '--svg-aspect': SVG_ASPECT,
          '--screen-offset': SCREEN_Y_OFFSET,
          /* Não é cross-fade: o canvas continua atrás. É a tela do laptop
             acendendo, e só depois de a câmera assentar.

             Enquanto `use3D` é null (servidor e primeiro quadro), vale 0. Com
             1 ali, o HTML do servidor pintava a home encolhida a 56% flutuando
             no meio da tela, sem moldura nenhuma em volta: era o "bug antes do
             loading". Melhor um instante de fundo escuro, que lê como
             carregando, do que um quadro que lê como quebrado. */
          '--boot': use3D === null ? 0 : on3D && !entered ? boot : 1,
        } as React.CSSProperties
      }
    >
      {/* Espaçador: única altura do documento durante o zoom, por isso o
          percurso mais uma tela. Some assim que o site assume a página. */}
      {!entered && !skipPortal && (
        <div
          className="portal__rail"
          style={{
            height: `calc(${(on3D ? INTRO_VH : 0) + travelVh}vh + 100svh)`,
          }}
        />
      )}

      {/* A moldura fica atrás do conteúdo: o SVG é feito de paths cheios, não
          tem buraco onde fica a tela, então por cima ele taparia tudo.

          Com o 3D, ela sai assim que o primeiro quadro pinta: quem faz papel
          de moldura passa a ser o laptop da cena. */}
      {!skipPortal && (use3D === false || failed3D) ? (
        <MacbookPro className="portal__frame text-transparent" />
      ) : null}

      {/* A cena vive atrás do portal (z-index 5 contra 20 do viewport) e sai
          por opacidade quando o notebook já saiu de quadro. */}
      {on3D && !entered && (
        <MacbookIntro3D
          startScale={startScale}
          introVh={INTRO_VH}
          onHandoff={setBoot}
          onReady={() => setReady3D(true)}
        />
      )}

      <div className="portal__viewport">
        <div className="portal__screen">
          <div className="portal__content">
            {/* Antes de entrar, o header mora aqui dentro, como se fosse o
                topo do site rodando na tela do notebook. Some ao entrar: o
                header real do layout assume a partir daí. */}
            {!entered && <Header inPortal {...header} />}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
