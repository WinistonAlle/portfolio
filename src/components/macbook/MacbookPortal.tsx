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
import { alturaVh } from './altura-estavel';
import { canRun3D } from './can-run-3d';
import Salvaguarda3D from '@/components/3d/Salvaguarda3D';
import AneisDaAbertura from '@/components/background/AneisDaAbertura';
import { definirAbertura, marcarCenaPronta } from '@/components/background/abertura';
import Header from '@/components/Header';
import type { Locale } from '@/i18n/config';

type Nav = { about: string; projects: string; contact: string };
import { usePixelTransition } from '@/components/transition/PixelTransition';
import { ancorarNoTopo, rolarAte } from '@/components/scroll/SmoothScroll';

/* ssr:false porque não existe WebGL no servidor, e porque o bundle do three
   não pode entrar no HTML inicial. Enquanto ele não chega, quem está na tela é
   o SVG de sempre: não existe buraco em momento nenhum. */
const MacbookIntro3D = dynamic(() => import('./MacbookIntro3D'), {
  ssr: false,
});

/* No celular a abertura é outra: um iPhone girando, e o zoom entra na tela
   dele. Mesmo motivo do ssr:false de cima. */
const PhoneIntro3D = dynamic(() => import('@/components/iphone/PhoneIntro3D'), {
  ssr: false,
});

/* Abertura do celular: mais curta que a do notebook. Numa tela de mão, três
   telas de rolagem só de abertura cansam. */
const PHONE_INTRO_VH = 120;
const PHONE_TRAVEL_VH = 80;
const PHONE_START_SCALE = 0.6;
/* Mesmo raio de canto da tela 3D do celular (SCREEN_ROUND em phone-scene). */
const PHONE_SCREEN_ROUND = 0.13;

/* Rolagem que a cena 3D consome antes de o zoom do portal começar. Some com o
   travelVh: o total é o que a pessoa rola até ver o site, e é esse número que
   importa vigiar, não este sozinho. */
/* Rolagem que a cena 3D consome antes de o zoom do portal começar. É o botão
   de velocidade da abertura: as fases dentro de laptop-scene são frações
   disto, então subir este número deixa o giro e a abertura mais lentos sem
   mexer na coreografia. */
const INTRO_VH = 190;

/* Abaixo disto o notebook não serve: num aparelho de 390px ele ocupa ~218px
   e o que está na tela dele fica ilegível. No celular a abertura é um iPhone
   girando (PhoneIntro3D), que preenche a tela em pé. Sem 3D, nem moldura nem
   zoom: o boot entrega direto a home. */
const CELULAR = '(max-width: 640px)';

/* Geometria da tela dentro do SVG (viewBox 650x400). */
const SCREEN_W_RATIO = 501.22 / 650;
const SCREEN_ASPECT = 501.22 / 323.85;
const SVG_ASPECT = 400 / 650;
/* A tela não é centrada no SVG: fica 4,19% da altura acima do meio. */
const SCREEN_Y_OFFSET = ((21.32 + 345.17) / 2 - 400 / 2) / 400;

export default function MacbookPortal({
  children,
  header,
  rolar,
  startScale = 0.56,
  /** Quanta rolagem o zoom consome, em porcentagem da altura da tela. */
  travelVh = 130,
}: {
  children: React.ReactNode;
  /* Props do Header pra cópia que aparece DENTRO da tela do notebook. Chegam
     por aqui porque o Header precisa de idioma e de texto traduzido, e este
     componente é de cliente: quem tem essas coisas é a página, no servidor. */
  header?: { locale: Locale; nav: Nav; switchLabel: string };
  /* Texto do "Role para ver mais" da abertura. Clicar nele atravessa a
     abertura inteira sozinho. */
  rolar?: string;
  startScale?: number;
  travelVh?: number;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const [entered, setEntered] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const { setChromeHidden, bootActive, isTransitioning } = usePixelTransition();

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
  /* Celular sem 3D: sem moldura e sem zoom, o site começa já entrado. */
  const [skipPortal, setSkipPortal] = useState(false);
  /* Celular: a abertura é o iPhone, não o notebook. */
  const [celular, setCelular] = useState(false);
  /* Aspecto da viewport (largura / 100svh): no celular a tela 3D tem a
     proporção da própria tela de quem olha. */
  const [aspectoTela, setAspectoTela] = useState(0.46);
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
    const telaPequena = window.matchMedia(CELULAR).matches;
    const pode3D = !reduced && canRun3D();
    setCelular(telaPequena);
    setSkipPortal(telaPequena && !pode3D);
    setUse3D(pode3D);
    if (telaPequena) {
      const regua = document.createElement('div');
      regua.style.cssText = 'position:fixed;top:0;height:100svh;width:0;visibility:hidden';
      document.body.appendChild(regua);
      const h = regua.getBoundingClientRect().height || window.innerHeight;
      regua.remove();
      setAspectoTela(document.documentElement.clientWidth / h);
    }
  }, []);

  const on3D = use3D === true && !failed3D;
  const introVh = celular ? PHONE_INTRO_VH : INTRO_VH;
  const travel = celular ? PHONE_TRAVEL_VH : travelVh;
  const escala0 = celular ? PHONE_START_SCALE : startScale;

  /* Celular cujo 3D falhou: não há moldura SVG de reserva, então entra
     direto, como faria sem 3D. */
  useEffect(() => {
    if (!celular || !failed3D) return;
    rootRef.current?.style.setProperty('--p', '1');
    setEntered(true);
  }, [celular, failed3D]);

  useEffect(() => {
    if (!on3D || ready3D) return;
    /* No celular o prazo é maior: rede e processador mais lentos, e lá a
       reserva é pular a abertura inteira, não trocar pela moldura SVG. Com
       2,5s o prazo estourava perto do fim do loading em aparelho real. */
    /* No computador eram 2,5s, do tempo em que a cena travava a página pra
       compilar os shaders. Agora ela compila em paralelo e, na primeira visita,
       leva mais que isso sem travar nada: o prazo curto trocaria a cena pela
       moldura SVG justamente em quem está vendo o site pela primeira vez. */
    const timer = window.setTimeout(() => setFailed3D(true), 7000);
    return () => window.clearTimeout(timer);
  }, [on3D, ready3D, celular]);

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
      const intro = on3D ? (introVh / 100) * alturaVh() : 0;
      const percurso = (travel / 100) * alturaVh();
      const p =
        percurso > 0
          ? Math.min(1, Math.max(0, (window.scrollY - intro) / percurso))
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
  }, [travel, introVh, on3D, skipPortal]);

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
     a troca não aparece. Em layout effect para acontecer antes da pintura.

     `ancorarNoTopo` e não um scrollTo simples: o espaçador de ~420vh some
     aqui, e quem rolou até o fim da abertura ainda tem inércia sobrando. Com
     a home em página única essa sobra tem pra onde ir — medido, ela levava a
     pessoa direto ao RODAPÉ, pulando o hero e as quatro seções. A função
     segura o Lenis pelo tempo de a inércia morrer. */
  useLayoutEffect(() => {
    if (entered) ancorarNoTopo();
  }, [entered]);

  /* Avisa o fundo de partículas para sair de cena enquanto a abertura roda.
   *
   * Os dois são fundos animados com contexto WebGL próprio, e a abertura é o
   * momento mais pesado da home. Além do custo, o pedido era um efeito
   * diferente NESTA página: sobrepor os dois não seria diferente, seria os
   * dois ao mesmo tempo. Ver `background/abertura.ts`. */
  useEffect(() => {
    definirAbertura(on3D && !entered);
    return () => definirAbertura(false);
  }, [on3D, entered]);

  /* Mede a largura ÚTIL da página e publica em --vw.
   *
   * `100vw` inclui a barra de rolagem; `clientWidth` não. No macOS a barra é
   * sobreposta e os dois valores são iguais, então nada disto aparece durante
   * o desenvolvimento. No Windows e no Linux a barra clássica ocupa ~15px, e
   * toda a geometria do portal (que é calculada em cima da largura da tela)
   * nascia larga demais e descentrada. Ver o comentário do bloco `.portal` no
   * globals.css.
   *
   * No `documentElement` e não no elemento do portal: a variável é lida por
   * regras que valem para filhos posicionados como `fixed`, e herdar da raiz é
   * o único lugar que alcança todas elas. */
  useEffect(() => {
    const medir = () => {
      document.documentElement.style.setProperty(
        '--vw',
        `${document.documentElement.clientWidth}px`,
      );
    };
    medir();
    window.addEventListener('resize', medir);
    /* A barra pode aparecer e sumir enquanto a página cresce (o rail da
       abertura muda de altura), e aí a largura útil muda sem um `resize`. */
    const obs =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(medir);
    obs?.observe(document.documentElement);
    return () => {
      window.removeEventListener('resize', medir);
      obs?.disconnect();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={`portal${entered ? ' portal--entered' : ''}${revealed ? ' portal--revealed' : ''}`}
      style={
        {
          '--p': 0,
          '--s0': escala0,
          /* O inverso vai pronto para o CSS multiplicar em vez de dividir:
             `calc()` aceita divisão por variável, mas multiplicação não tem
             canto escuro em navegador nenhum. */
          '--inv-s0': 1 / escala0,
          '--screen-ratio': SCREEN_W_RATIO,
          '--screen-aspect': celular ? aspectoTela : SCREEN_ASPECT,
          '--screen-round': celular ? PHONE_SCREEN_ROUND : 0.012,
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
            height: `calc(${(on3D ? introVh : 0) + travel}vh + 100svh)`,
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
      {/* Os anéis são o fundo desta abertura, e só dela. Mesma condição da
          cena 3D (`on3D`): onde ela não roda (movimento reduzido, máquina sem
          fôlego) um shader em tela cheia seria exatamente o que não se deve
          acrescentar. No celular vão numa versão mais leve. */}
      {/* No celular os anéis só entram depois do boot e da cortina de pixels:
          rodando junto com a cortina, eram um shader de tela cheia disputando
          a GPU justo na hora em que o loading termina. */}
      {on3D && !entered && (!celular || (!bootActive && !isTransitioning)) && (
        <AneisDaAbertura leve={celular} />
      )}

      {/* `canRun3D` já reprova a maioria das máquinas sem condição, mas ele
          responde ANTES: se o contexto morrer no meio (driver caindo, GPU
          entrando na lista de bloqueio depois de um update), o erro sobe de
          dentro de um efeito e leva a home junto. A alternativa é `null`,
          porque a moldura SVG do notebook já está desenhada por baixo: sem a
          cena 3D a abertura vira a versão 2D, que é o que roda no celular. */}
      {on3D && !entered && (
        <Salvaguarda3D alternativa={null} ativo>
          {celular ? (
            <PhoneIntro3D
              startScale={escala0}
              introVh={introVh}
              onHandoff={setBoot}
              onReady={() => { setReady3D(true); marcarCenaPronta(); }}
            />
          ) : (
            <MacbookIntro3D
              startScale={startScale}
              introVh={INTRO_VH}
              onHandoff={setBoot}
              onReady={() => { setReady3D(true); marcarCenaPronta(); }}
            />
          )}
        </Salvaguarda3D>
      )}

      {/* Durante a abertura (notebook ou iPhone), o aviso de que a página
          continua, e um atalho: clicar rola sozinho até o fim do zoom, com a
          animação passando inteira. Some quando a mesa assume a tela. */}
      {/* `!isTransitioning`: logo depois do boot a cortina de pixels ainda está
          abrindo por cima de tudo e engole o clique. O botão só entra quando
          ela termina, já visível e clicável. */}
      {rolar && !entered && !skipPortal && revealed && !bootActive && !isTransitioning && (
        <button
          type="button"
          className="portal__rolar"
          onClick={() => {
            const fim = ((on3D ? introVh : 0) + travel) / 100 * alturaVh() + 4;
            rolarAte(fim, celular ? 3.2 : 4.4, true);
          }}
        >
          <span>{rolar}</span>
          <span className="hero-rolar" aria-hidden="true" />
        </button>
      )}

      <div className="portal__viewport">
        <div className="portal__screen">
          <div className="portal__content">
            {/* Antes de entrar, o header mora aqui dentro, como se fosse o
                topo do site rodando na tela do notebook. Some ao entrar: o
                header real do layout assume a partir daí. */}
            {!entered && header && <Header inPortal {...header} />}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
