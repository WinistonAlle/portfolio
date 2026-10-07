'use client';

/* Hero da home: a área de trabalho do Mac que a abertura acabou de ligar.
 *
 * A abertura dá zoom pra dentro da tela do MacBook; o que aparece lá dentro é
 * a mesa dele, com barra de menu, widgets, arquivos e Dock. Cada atalho abre
 * uma janela que cresce a partir do ícone, vai pra tela cheia e VIRA a página
 * de destino: o router troca de rota com a janela cobrindo tudo, e a página
 * nova aparece no lugar dela.
 *
 * No celular a mesma ideia vira a tela inicial do iPhone, e o app abre do
 * ícone pra tela inteira, como no iOS. As duas versões estão sempre no HTML e
 * o CSS mostra uma só (`display: none` também tira a outra do leitor de tela).
 *
 * Todo atalho é um <a href> de verdade: buscador e cmd+clique continuam
 * funcionando. A animação só sequestra o clique simples. */

import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import TituloAcento from '@/components/text/TituloAcento';
import { usePixelTransition } from '@/components/transition/PixelTransition';
import TransitionLink from '@/components/transition/TransitionLink';
import { SOCIALS } from '@/data/socials';
import type { Locale } from '@/i18n/config';
import {
  AppArquivos,
  AppFinder,
  AppFoto,
  AppIdioma,
  AppLixo,
  AppMail,
  AppMarca,
  Bateria,
  Cartao,
  CentroDeControle,
  Documento,
  Lupa,
  Maca,
  Pasta,
  Wifi,
} from './icones';
import './mesa.css';

const FOTO = '/winiston-hero.png';

type Nav = { about: string; projects: string; contact: string };

export type TextoMesa = {
  app: string;
  sobreArquivo: string;
  contatoArquivo: string;
  fotoLegenda: string;
  notifTitulo: string;
  notifTexto: string;
  notifAgora: string;
  rolar: string;
  producao: string;
  producaoSub: string;
  projetosSub: string;
  lixo: string;
  idioma: string;
  dica: string;
};

export type DadosMesa = {
  total: number;
  live: number;
  nomes: string[];
};

type Abertura = {
  href: string;
  titulo: string;
  modo: 'janela' | 'app';
  /* O que aparece dentro da janela antes de ela virar a página. */
  conteudo?: ReactNode;
  origem: DOMRect;
  /* Ícone que o app do iPhone leva junto enquanto cresce. */
  icone?: ReactNode;
};

const social = (id: string) => SOCIALS.find((s) => s.id === id)!;

/* Seta do mouse do macOS, pra dica de clique. */
function Cursor() {
  return (
    <svg viewBox="0 0 14 20" width="11" height="16" aria-hidden="true">
      <path d="M1 1v15.5l3.9-3.7 2.6 5.8 2.4-1.1-2.6-5.7H13Z" fill="#fff" stroke="#000" strokeWidth="1.1" strokeLinejoin="round" />
    </svg>
  );
}

/* ---------- Relógio da barra de menu ---------- */

/* Formato do macOS: "qua. 7 de out. 14:32" e "Wed Oct 7  2:32 PM". Só depois
   de montar: a hora do servidor não é a de quem está vendo, e renderizar ela
   no HTML daria erro de hidratação. */
function Relogio({ locale }: { locale: Locale }) {
  const [agora, setAgora] = useState<Date | null>(null);

  useEffect(() => {
    const tique = () => setAgora(new Date());
    const primeiro = window.setTimeout(tique, 0);
    const timer = window.setInterval(tique, 15_000);
    return () => {
      window.clearTimeout(primeiro);
      window.clearInterval(timer);
    };
  }, []);

  if (!agora) return <span className="mesa-menu__hora" />;

  const tag = locale === 'pt' ? 'pt-BR' : 'en-US';
  const dia = agora.toLocaleDateString(tag, { weekday: 'short' });
  const mes = agora.toLocaleDateString(tag, { month: 'short' });
  const hora = agora.toLocaleTimeString(tag, { hour: 'numeric', minute: '2-digit' });
  const texto =
    locale === 'pt'
      ? `${dia} ${agora.getDate()} de ${mes} ${hora}`
      : `${dia} ${mes} ${agora.getDate()}  ${hora}`;

  return <span className="mesa-menu__hora">{texto}</span>;
}

/* ---------- Papel de parede ---------- */

/* Imagem pronta (public/mesa/papel-*.webp), e não SVG desfocado ao vivo: o
   papel entra na tela durante o zoom do portal, que reescala a mesa a cada
   quadro, e um filtro de desfoque em tela cheia era refeito em todos eles. Era
   o tranco na hora em que a tela do notebook acendia. */
function Papel({ ios = false }: { ios?: boolean }) {
  return <div className={`mesa__papel${ios ? ' mesa__papel--ios' : ''}`} aria-hidden="true" />;
}

/* ---------- Janela que vira página ---------- */

function Semaforo() {
  return (
    <span className="abertura__semaforo">
      <i />
      <i />
      <i />
    </span>
  );
}

/* A pasta Projetos aberta no Finder: barra lateral de vidro com os
   favoritos, e as pastas dos projetos em grade. */
function JanelaFinder({ titulo, nomes, lateral }: { titulo: string; nomes: string[]; lateral: string[] }) {
  return (
    <div className="finder">
      <aside className="finder__lateral">
        <Semaforo />
        <span className="finder__secao">Favoritos</span>
        {lateral.map((item) => (
          <span key={item} className={`finder__fav${item === titulo ? ' finder__fav--sel' : ''}`}>
            <i />
            {item}
          </span>
        ))}
      </aside>
      <div className="finder__main">
        <div className="finder__barra">
          <span className="finder__setas">‹ ›</span>
          <span className="finder__titulo">{titulo}</span>
        </div>
        <div className="finder__grade">
          {nomes.map((nome) => (
            <span key={nome} className="finder__item">
              <Pasta size={58} />
              <span>{nome}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function CamadaDeAbertura({
  abertura,
  onFim,
}: {
  abertura: Abertura;
  onFim: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [cheia, setCheia] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const { origem, modo } = abertura;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const de = {
      left: `${origem.left}px`,
      top: `${origem.top}px`,
      width: `${origem.width}px`,
      height: `${origem.height}px`,
    };
    const tela = { left: '0px', top: '0px', width: `${vw}px`, height: `${vh}px` };
    let vivo = true;

    (async () => {
      if (modo === 'app') {
        /* iOS: do ícone direto pra tela inteira, num movimento só. */
        await el.animate(
          [
            { ...de, borderRadius: `${origem.width * 0.225}px` },
            { ...tela, borderRadius: '0px' },
          ],
          { duration: 460, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', fill: 'forwards' },
        ).finished;
      } else {
        /* macOS: abre em janela no meio da tela, respira, e maximiza. */
        const w = Math.min(1080, vw * 0.72);
        const h = Math.min(700, vh * 0.74);
        const janela = {
          left: `${(vw - w) / 2}px`,
          top: `${(vh - h) / 2 + 12}px`,
          width: `${w}px`,
          height: `${h}px`,
        };
        await el.animate(
          [
            { ...de, borderRadius: '10px', opacity: 0.35 },
            { ...janela, borderRadius: '12px', opacity: 1 },
          ],
          { duration: 380, easing: 'cubic-bezier(0.2, 0, 0, 1)', fill: 'forwards' },
        ).finished;
        if (!vivo) return;
        await new Promise((r) => setTimeout(r, 160));
        if (!vivo) return;
        setCheia(true);
        await el.animate(
          [
            { ...janela, borderRadius: '12px' },
            { ...tela, borderRadius: '0px' },
          ],
          { duration: 440, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'forwards' },
        ).finished;
      }
      if (vivo) onFim();
    })().catch(() => {
      if (vivo) onFim();
    });

    return () => {
      vivo = false;
    };
    // A abertura é única por clique: roda uma vez com o que chegou.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return createPortal(
    <div
      ref={ref}
      className={`abertura abertura--${abertura.modo}${cheia ? ' abertura--cheia' : ''}`}
      aria-hidden="true"
    >
      {abertura.modo === 'janela' ? (
        abertura.conteudo ?? (
          <>
            <div className="abertura__barra">
              <Semaforo />
              <span className="abertura__titulo">{abertura.titulo}</span>
            </div>
            <div className="abertura__doc">
              <span>{abertura.titulo}</span>
              <i />
              <i />
              <i />
            </div>
          </>
        )
      ) : (
        <div className="abertura__icone">{abertura.icone}</div>
      )}
    </div>,
    document.body,
  );
}

/* ---------- Dock ---------- */

type ItemDock = {
  id: string;
  rotulo: string;
  icone: ReactNode;
  href?: string;
  externo?: boolean;
  aberto?: boolean;
};

const BASE = 62;
const AUMENTO = 0.55;
const ALCANCE = 150;

function Dock({
  itens,
  lixo,
  onAbrir,
}: {
  itens: ItemDock[];
  lixo: ItemDock;
  onAbrir: (e: MouseEvent<HTMLAnchorElement>, item: ItemDock) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pulando, setPulando] = useState<string | null>(null);

  /* Ampliação do Dock: cada ícone cresce conforme a distância do cursor até o
     centro dele, numa curva de cosseno. A largura muda de verdade (não só a
     escala), então o Dock alarga e os vizinhos abrem espaço, como no Mac.
     Os centros são medidos UMA vez na entrada do cursor, em repouso; medir a
     cada quadro faria os ícones correrem atrás do próprio crescimento. */
  useEffect(() => {
    const dock = ref.current;
    if (!dock) return;
    if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const icones = [...dock.querySelectorAll<HTMLElement>('[data-dock-icone]')];
    let centros: number[] = [];
    let x = 0;
    let raf = 0;

    const pintar = () => {
      raf = 0;
      icones.forEach((el, i) => {
        const d = Math.abs(x - centros[i]);
        const f = d < ALCANCE ? Math.cos((d / ALCANCE) * (Math.PI / 2)) : 0;
        el.style.setProperty('--tam', `${BASE * (1 + AUMENTO * f * f)}px`);
      });
    };

    const entrar = (e: PointerEvent) => {
      dock.classList.add('dock--ativo');
      centros = icones.map((el) => {
        const r = el.getBoundingClientRect();
        return r.left + r.width / 2;
      });
      x = e.clientX;
      if (!raf) raf = requestAnimationFrame(pintar);
    };
    const mover = (e: PointerEvent) => {
      x = e.clientX;
      if (!raf) raf = requestAnimationFrame(pintar);
    };
    const sair = () => {
      dock.classList.remove('dock--ativo');
      cancelAnimationFrame(raf);
      raf = 0;
      icones.forEach((el) => el.style.removeProperty('--tam'));
    };

    dock.addEventListener('pointerenter', entrar);
    dock.addEventListener('pointermove', mover);
    dock.addEventListener('pointerleave', sair);
    return () => {
      cancelAnimationFrame(raf);
      dock.removeEventListener('pointerenter', entrar);
      dock.removeEventListener('pointermove', mover);
      dock.removeEventListener('pointerleave', sair);
    };
  }, []);

  const clicar = (e: MouseEvent<HTMLAnchorElement>, item: ItemDock) => {
    setPulando(item.id);
    window.setTimeout(() => setPulando((p) => (p === item.id ? null : p)), 720);
    onAbrir(e, item);
  };

  const icone = (item: ItemDock) => (
    <>
      <span className="dock__dica">{item.rotulo}</span>
      <span className="dock__icone" data-dock-icone data-icone>
        {item.icone}
      </span>
      {item.aberto && <span className="dock__aceso" />}
    </>
  );

  return (
    <nav className="dock" ref={ref} aria-label="Dock">
      {itens.map((item) => (
        <a
          key={item.id}
          href={item.href}
          className={`dock__item${pulando === item.id ? ' dock__item--pula' : ''}`}
          aria-label={item.rotulo}
          {...(item.externo ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          onClick={(e) => clicar(e, item)}
        >
          {icone(item)}
        </a>
      ))}
      <span className="dock__divisor" aria-hidden="true" />
      <span className="dock__item dock__item--lixo" aria-hidden="true">
        {icone(lixo)}
      </span>
    </nav>
  );
}

/* ---------- A mesa ---------- */

export default function Mesa({
  locale,
  title,
  nav,
  switchLabel,
  t,
  dados,
}: {
  locale: Locale;
  title: string;
  nav: Nav;
  switchLabel: string;
  t: TextoMesa;
  dados: DadosMesa;
}) {
  const router = useRouter();
  const { navigate, chromeHidden, bootActive } = usePixelTransition();
  const [abertura, setAbertura] = useState<Abertura | null>(null);
  /* A mesa só "liga" depois que a abertura do notebook entregou a tela: é aí
     que os ícones dão o pulinho e a notificação desce. Antes disso ninguém
     está olhando. */
  const pronta = !chromeHidden && !bootActive;
  const [notif, setNotif] = useState<'fora' | 'dentro' | 'saindo'>('fora');

  useEffect(() => {
    if (!pronta) return;
    const entra = window.setTimeout(() => setNotif((n) => (n === 'fora' ? 'dentro' : n)), 900);
    const sai = window.setTimeout(() => setNotif((n) => (n === 'dentro' ? 'saindo' : n)), 9000);
    return () => {
      window.clearTimeout(entra);
      window.clearTimeout(sai);
    };
  }, [pronta]);
  const [selecionado, setSelecionado] = useState<string | null>(null);

  const outro: Locale = locale === 'pt' ? 'en' : 'pt';
  const rotas = {
    projetos: `/${locale}/projetos`,
    sobre: `/${locale}/sobre-mim`,
    contato: `/${locale}/contato`,
  };

  /* Clique simples: anima e navega. Qualquer outro (cmd, ctrl, shift, botão
     do meio, link externo) segue o caminho nativo do <a>. */
  const abrir = (
    e: MouseEvent<HTMLElement>,
    alvo: { href?: string; titulo: string; externo?: boolean; modo: Abertura['modo']; icone?: ReactNode },
  ) => {
    if (!alvo.href || alvo.externo) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    if (abertura) return;

    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      navigate(alvo.href);
      return;
    }

    const alvoEl = e.currentTarget.querySelector('[data-icone]') ?? e.currentTarget;
    router.prefetch(alvo.href);
    setAbertura({
      href: alvo.href,
      titulo: alvo.titulo,
      modo: alvo.modo,
      origem: alvoEl.getBoundingClientRect(),
      icone: alvo.icone,
      conteudo:
        alvo.href === rotas.projetos ? (
          <JanelaFinder
            titulo={nav.projects}
            nomes={dados.nomes}
            lateral={[nav.projects, nav.about, nav.contact, 'Downloads']}
          />
        ) : undefined,
    });
  };

  const gh = social('github');
  const li = social('linkedin');
  const wa = social('whatsapp');
  const ig = social('instagram');

  const appGithub = <AppMarca id="gh" de="#30363d" para="#14171b" path={gh.path} />;
  const appLinkedin = <AppMarca id="li" de="#1c86e8" para="#0a5aad" path={li.path} escala={0.44} />;
  const appWhatsapp = <AppMarca id="wa" de="#61f27f" para="#1faf43" path={wa.path} escala={0.5} />;
  const appInstagram = <AppMarca id="ig" de="#8a3ab9" para="#f9a64a" path={ig.path} escala={0.46} />;

  const dock: ItemDock[] = [
    { id: 'finder', rotulo: nav.projects, icone: <AppFinder />, href: rotas.projetos, aberto: true },
    { id: 'sobre', rotulo: nav.about, icone: <AppFoto foto={FOTO} />, href: rotas.sobre },
    { id: 'mail', rotulo: nav.contact, icone: <AppMail />, href: rotas.contato },
    { id: 'gh', rotulo: gh.label, icone: appGithub, href: gh.href, externo: true },
    { id: 'li', rotulo: li.label, icone: appLinkedin, href: li.href, externo: true },
    { id: 'wa', rotulo: wa.label, icone: appWhatsapp, href: wa.href, externo: true },
    { id: 'ig', rotulo: ig.label, icone: appInstagram, href: ig.href, externo: true },
  ];

  const arquivos = [
    {
      id: 'projetos',
      nome: nav.projects,
      info: t.projetosSub.replace('{n}', String(dados.total)),
      href: rotas.projetos,
      icone: <Pasta size={80} />,
    },
    {
      id: 'sobre',
      nome: t.sobreArquivo,
      href: rotas.sobre,
      titulo: nav.about,
      icone: <Documento size={80} extensao="MD" />,
    },
    {
      id: 'contato',
      nome: t.contatoArquivo,
      href: rotas.contato,
      titulo: nav.contact,
      icone: <Cartao size={80} foto={FOTO} />,
    },
  ];

  const producao = (
    <div className="widget widget--producao">
      <span className="widget__rotulo">
        <i className="widget__ponto" aria-hidden="true" />
        {t.producao}
      </span>
      <span className="widget__numero">{dados.live}</span>
      <span className="widget__sub">{t.producaoSub}</span>
    </div>
  );

  const fotoWidget = (
    <div className="widget widget--foto">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/mesa/foto-widget.webp" alt="Winiston Alle" draggable={false} />
      <span className="widget__legenda">
        <strong>Winiston Alle</strong>
        {t.fotoLegenda}
      </span>
    </div>
  );

  /* iPhone: quatro na grade, quatro no Dock, sem repetir. No Dock também vai o
     nome embaixo (o iOS não mostra), pra ninguém ter que adivinhar o ícone. */
  const appsIos = [
    { id: 'sobre', rotulo: nav.about, href: rotas.sobre, icone: <AppFoto foto={FOTO} /> },
    { id: 'gh', rotulo: gh.label, href: gh.href, externo: true, icone: appGithub },
    { id: 'ig', rotulo: ig.label, href: ig.href, externo: true, icone: appInstagram },
  ];
  const dockIos = [
    { id: 'projetos', rotulo: nav.projects, href: rotas.projetos, icone: <AppArquivos /> },
    { id: 'contato', rotulo: nav.contact, href: rotas.contato, icone: <AppMail /> },
    { id: 'wa', rotulo: wa.label, href: wa.href, externo: true, icone: appWhatsapp },
    { id: 'li', rotulo: li.label, href: li.href, externo: true, icone: appLinkedin },
  ];

  const linkIos = (app: (typeof dockIos)[number] & { externo?: boolean }, comRotulo: boolean) => (
    <a
      key={app.id}
      href={app.href}
      className="ios-app"
      aria-label={app.rotulo}
      {...(app.externo ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      onClick={(e) => abrir(e, { ...app, titulo: app.rotulo, modo: 'app' })}
    >
      <span className="ios-app__icone" data-icone>
        {app.icone}
      </span>
      {comRotulo && <span className="ios-app__rotulo">{app.rotulo}</span>}
    </a>
  );

  return (
    <section className="mesa" aria-label={t.app}>
      {/* ---------------- Mac ---------------- */}
      <div className={`mesa-mac${pronta ? ' mesa-mac--pronta' : ''}`}>
        <Papel />

        <header className="mesa-menu">
          <div className="mesa-menu__lado">
            <span className="mesa-menu__maca" aria-hidden="true">
              <Maca />
            </span>
            <span className="mesa-menu__app">{t.app}</span>
            <nav className="mesa-menu__nav" aria-label="Menu">
              {(
                [
                  [nav.projects, rotas.projetos],
                  [nav.about, rotas.sobre],
                  [nav.contact, rotas.contato],
                ] as const
              ).map(([rotulo, href]) => (
                <a
                  key={href}
                  href={href}
                  className="mesa-menu__item"
                  onClick={(e) => abrir(e, { href, titulo: rotulo, modo: 'janela' })}
                >
                  {rotulo}
                </a>
              ))}
            </nav>
          </div>
          <div className="mesa-menu__lado">
            {/* Fonte de entrada do teclado: no Mac é a caixinha com a sigla do
                idioma. Aqui é ela que troca o site de idioma. */}
            <TransitionLink
              href={`/${outro}`}
              hrefLang={outro}
              aria-label={switchLabel}
              title={switchLabel}
              className="mesa-menu__item mesa-menu__idioma"
            >
              <span>{locale.toUpperCase()}</span>
            </TransitionLink>
            <span className="mesa-menu__extra" aria-hidden="true">
              <Bateria />
            </span>
            <span className="mesa-menu__extra" aria-hidden="true">
              <Wifi />
            </span>
            <span className="mesa-menu__extra" aria-hidden="true">
              <Lupa />
            </span>
            <span className="mesa-menu__extra" aria-hidden="true">
              <CentroDeControle />
            </span>
            <Relogio locale={locale} />
          </div>
        </header>

        <div className="mesa-widgets">
          {fotoWidget}
          {producao}
        </div>

        <div className="mesa-titulo">
          <h1 className="mesa-titulo__texto">
            <TituloAcento texto={title} />
          </h1>
          <p className="mesa-titulo__dica">
            <Cursor />
            {t.dica}
          </p>
        </div>

        {/* A página continua embaixo da mesa: o traço que escorre diz isso
            sem virar botão. */}
        <div className="mesa-rolar" aria-hidden="true">
          <span className="hero-rolar" />
          <span>{t.rolar}</span>
        </div>

        {notif !== 'fora' && (
          <div
            className={`mesa-notif${notif === 'saindo' ? ' mesa-notif--saindo' : ''}`}
            role="status"
            onAnimationEnd={() => notif === 'saindo' && setNotif('fora')}
            /* Como no Mac: clicar na notificação abre o app dela. */
            onClick={(e) => {
              if ((e.target as HTMLElement).closest('.mesa-notif__fechar')) return;
              setNotif('saindo');
              abrir(e, { href: rotas.projetos, titulo: nav.projects, modo: 'janela' });
            }}
          >
            <span className="mesa-notif__icone" aria-hidden="true" data-icone>
              <AppFinder />
            </span>
            <span className="mesa-notif__texto">
              <strong>{t.notifTitulo}</strong>
              {t.notifTexto}
            </span>
            <span className="mesa-notif__hora">{t.notifAgora}</span>
            <button
              type="button"
              className="mesa-notif__fechar"
              aria-label="OK"
              onClick={() => setNotif('saindo')}
            >
              ×
            </button>
          </div>
        )}

        <ul className="mesa-arquivos">
          {arquivos.map((a, i) => (
            <li key={a.id} style={{ '--i': i } as React.CSSProperties}>
              <a
                href={a.href}
                className={`mesa-arquivo${selecionado === a.id ? ' mesa-arquivo--sel' : ''}`}
                onClick={(e) => {
                  setSelecionado(a.id);
                  abrir(e, { href: a.href, titulo: a.titulo ?? a.nome, modo: 'janela' });
                }}
              >
                <span className="mesa-arquivo__icone" data-icone>
                  {a.icone}
                </span>
                <span className="mesa-arquivo__nome">{a.nome}</span>
                {a.info && <span className="mesa-arquivo__info">{a.info}</span>}
              </a>
            </li>
          ))}
        </ul>

        <Dock
          itens={dock}
          lixo={{ id: 'lixo', rotulo: t.lixo, icone: <AppLixo /> }}
          onAbrir={(e, item) => abrir(e, { ...item, titulo: item.rotulo, modo: 'janela' })}
        />
      </div>

      {/* ---------------- iPhone ---------------- */}
      <div className="mesa-ios">
        <Papel ios />
        <div className="ios-grade">
          <div className="widget widget--titulo">
            <h1 className="widget--titulo__texto">
              <TituloAcento texto={title} />
            </h1>
          </div>
          {fotoWidget}
          {producao}
          {appsIos.map((app) => linkIos(app, true))}
          <TransitionLink
            href={`/${outro}`}
            hrefLang={outro}
            aria-label={switchLabel}
            className="ios-app"
          >
            <span className="ios-app__icone">
              <AppIdioma />
            </span>
            <span className="ios-app__rotulo">{t.idioma}</span>
          </TransitionLink>
        </div>
        <span className="ios-rolar" aria-hidden="true">
          {t.rolar}
          <svg viewBox="0 0 12 12" width="11" height="11">
            <path d="M2 4.5 6 8.5l4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <nav className="ios-dock" aria-label="Dock">
          {dockIos.map((app) => linkIos(app, true))}
        </nav>
      </div>

      {abertura && (
        <CamadaDeAbertura abertura={abertura} onFim={() => router.push(abertura.href)} />
      )}
    </section>
  );
}
