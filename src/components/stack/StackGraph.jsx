'use client';

/* Grafo da stack em perspectiva: o centro (WA), uma etiqueta por grupo e as
   tecnologias em leque em volta de cada etiqueta. O conjunto balança devagar
   e acompanha o cursor, o que dá a profundidade; passar o mouse num nó acende
   ele e os vizinhos e apaga o resto.
 *
 * Já foi um grafo solto, com física de repulsão e giro de 360 graus. Saiu
 * porque, de lado, tudo empilhava: rótulo em cima de disco, disco em cima de
 * disco. Agora as posições são desenhadas (stack-dados.ts) e o giro é só um
 * balanço de poucos graus, então o arranjo que foi conferido é o que aparece.
 *
 * Portado de um componente vanilla que vivia num HTML solto (formato .dc.html,
 * com framework próprio). Aqui virou componente React: o desenho inteiro
 * mora dentro de um único useEffect, que devolve o cleanup de tudo (rAF,
 * observers e listeners). Convenção do repo para componente portado: .jsx com
 * tipos escritos à mão no .d.ts ao lado, igual CardSwap e Lanyard.
 *
 * Paleta ajustada para os tokens do site (o azul do pilar de frontend é o
 * --accent; o núcleo é o --foreground) para o grafo não parecer colado de
 * outro lugar.
 */

import { useEffect, useRef, useState } from 'react';

/* A configuração da stack (pilares, nós e ligações) mora em stack-dados.ts:
   a versão em lista do celular (StackLista) lê os mesmos dados. */
import { GRAPH } from './stack-dados';

/** `true` no dedo (celular, tablet), `false` no mouse. */
const ponteiroGrosso = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(pointer: coarse)').matches;

const FOCAL = 880;
/* Teto do "fit to bounds". Sem isso o grafo cresceria sem limite em telas
   grandes; com um teto baixo demais ele para de crescer e sobra vazio na
   caixa. */
const MAX_FIT = 2.3;
/* No celular o grafo pode encher mais a caixa: ele já mostra menos nós (os
   marcados com `mobile: 'hide'` saem), então sobra espaço, e o que restava
   ficava pequeno no meio de uma área de 92vh. O teto maior e a margem menor
   são as duas coisas que limitavam o crescimento. */
const MAX_FIT_TOQUE = 3.2;

/* Cor de cada grupo no tema claro (chave = cor do tema escuro). */
const COR_NO_CLARO = {
  '#f3f6ff': '#0b1220',
  '#5b9cff': '#1d5fd8',
  '#f0a94c': '#b36a00',
  '#93a4b8': '#55657e',
  '#7f8a99': '#4b5563',
};
/* Monograma WA (o mesmo de LogoWA.tsx), para o centro do grafo. */
const LOGO_WA = [
  [17, 64, 47, 64, 83, 192, 53, 192],
  [87, 112, 117, 112, 83, 192, 53, 192],
  [87, 112, 117, 112, 151, 192, 121, 192],
  [165, 64, 195, 64, 151, 192, 121, 192],
  [165, 64, 195, 64, 239, 192, 209, 192],
];
const LOGO_WA_BARRA = [163.94, 150, 196.06, 150, 202.25, 168, 157.75, 168];
const poligono = (ctx, p) => {
  ctx.beginPath();
  ctx.moveTo(p[0], p[1]);
  for (let i = 2; i < p.length; i += 2) ctx.lineTo(p[i], p[i + 1]);
  ctx.closePath();
  ctx.fill();
};
const iconCacheClaro = {};

const rgba = (hex, a) => {
  const h = hex.replace('#', '');
  const v = parseInt(
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h,
    16,
  );
  return `rgba(${(v >> 16) & 255},${(v >> 8) & 255},${v & 255},${Math.max(
    0,
    Math.min(1, a),
  ).toFixed(3)})`;
};

export default function StackGraph({
  rotationSeconds = 60,
  dimOpacity = 0.2,
  className = '',
}) {
  const canvasRef = useRef(null);
  const tipRef = useRef(null);
  const [missingLogos, setMissingLogos] = useState(false);
  /* Começa em `true` (sem gestos) de propósito: é o estado que deixa a página
     rolar. Se o padrão fosse o contrário, o primeiro quadro no celular já
     nasceria com `touch-action: none` e comeria o começo do gesto de quem
     chegou rolando. O mouse libera os gestos logo em seguida, no efeito. */
  const [semGestos, setSemGestos] = useState(true);

  useEffect(() => {
    setSemGestos(ponteiroGrosso());
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const box = canvas?.parentElement;
    if (!canvas || !box) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
      .matches;

    /* canvas não resolve var(--...) dentro de ctx.font: a declaração inteira
       seria descartada e todo texto cairia no padrão de 10px. Então lê o
       valor computado da variável e usa o nome de família de verdade. */
    const cssFamily = getComputedStyle(document.documentElement)
      .getPropertyValue('--font-geist-sans')
      .trim();
    const FONT = `${cssFamily ? `${cssFamily}, ` : ''}system-ui, sans-serif`;

    /* estado da simulação — tudo local ao efeito, então o cleanup leva tudo */
    let nodes = [];
    let edges = [];
    let mobile = false;
    let yaw = 0;
    let pitch = -0.1;
    /* giro posto pelo arrasto: soma ao balanço e volta a zero ao soltar */
    let yawMao = 0;
    let pitchMao = 0;
    /* inclinação que acompanha o cursor, suavizada */
    let yawCursor = 0;
    let hover = null;
    let pointer = null;
    let drag = null;
    let dirty = true;
    let visible = true;
    let fit = null;
    let w = 0;
    let h = 0;
    let ctx = null;
    let raf = 0;
    let last = 0;
    let iconTimer = 0;
    let loadedLogos = 0;
    const iconCache = {};

    const isMobile = () => {
      const cw = canvas.clientWidth || 900;
      const coarse = window.matchMedia('(pointer: coarse)').matches;
      return cw < 480 || (coarse && cw < 700);
    };

    /* ---- construção do grafo ---- */
    const build = () => {
      mobile = isMobile();
      const source = GRAPH.nodes.filter(
        (n) => !(mobile && n.mobile === 'hide'),
      );
      const byId = {};

      nodes = source.map((cfg) => {
        const p = GRAPH.pillars[cfg.pillar];
        const n = { ...cfg, color: p.color, depth: p.depth };
        /* O centro precisa de um multiplicador maior que o das folhas: com o
           1.2 original ele saía do mesmo tamanho delas (25×1.2 = 30 contra
           15×1.9 = 28.5) e sumia no meio do grafo. */
        n.r = cfg.r * (cfg.hub ? 1 : cfg.glow ? 2 : 1.9);
        n.mono = GRAPH.mono[cfg.id] || cfg.label.charAt(0).toUpperCase();
        n.iconSrc = GRAPH.iconDir + cfg.id;
        n.labW = cfg.label.length * 6.4 + 8;
        n.side = cfg.hub || cfg.glow ? 'below' : p.anchor[0] < 0 ? 'left' : 'right';
        n.x = p.anchor[0];
        n.y = p.anchor[1];
        n.z = 0;
        n.neighbors = new Set();
        byId[n.id] = n;
        return n;
      });

      /* Folhas em leque em volta da etiqueta do grupo, na ordem em que estão
         nos dados. Elas alternam de profundidade para o balanço ter paralaxe. */
      const porPilar = {};
      nodes.forEach((n) => {
        if (n.pillar === 'core' || n.hub) return;
        (porPilar[n.pillar] ||= []).push(n);
      });
      Object.entries(porPilar).forEach(([nome, folhas]) => {
        const p = GRAPH.pillars[nome];
        const [centro, abertura] = p.leque;
        folhas.forEach((n, i) => {
          const t = folhas.length === 1 ? 0.5 : i / (folhas.length - 1);
          const a = ((centro - abertura / 2 + abertura * t) * Math.PI) / 180;
          n.x = p.anchor[0] + Math.cos(a) * p.raio;
          n.y = p.anchor[1] + Math.sin(a) * p.raio;
          n.z = i % 2 ? 38 : -38;
          /* O rótulo vai para fora do leque, longe da etiqueta do grupo: de
             lado nos discos laterais; em cima ou embaixo nos das pontas, onde
             os discos ficam lado a lado e um rótulo lateral bateria no vizinho. */
          const dx = n.x - p.anchor[0];
          n.side =
            Math.abs(dx) < p.raio * 0.55
              ? n.y < p.anchor[1] ? 'above' : 'below'
              : dx < 0 ? 'left' : 'right';
        });
      });

      edges = GRAPH.edges
        .filter(([a, b]) => byId[a] && byId[b])
        .map(([a, b]) => {
          const e = { a: byId[a], b: byId[b] };
          /* tronco: centro↔grupo. ramo: grupo↔folha. cruzada: folha↔folha. */
          e.tipo = e.a.pillar === 'core' ? 'tronco' : e.a.hub ? 'ramo' : 'cruzada';
          e.pilar = e.a.pillar === 'core' ? e.b : e.a;
          e.a.neighbors.add(e.b.id);
          e.b.neighbors.add(e.a.id);
          return e;
        });
    };

    /* ---- logos: tenta svg/png/webp e pré-renderiza num canvas, para o
       laço de desenho só copiar bitmap ---- */
    const loadIcons = () => {
      const exts = ['svg', 'png', 'webp'];
      loadedLogos = 0;
      window.clearTimeout(iconTimer);
      iconTimer = window.setTimeout(
        () => setMissingLogos(loadedLogos === 0),
        1600,
      );

      nodes.forEach((n) => {
        /* hubs viram disco liso e o centro é monograma: nenhum dos dois
           desenha bitmap, então buscar arquivo só geraria 404 */
        if (n.hub || n.noIcon) return;
        const key = n.iconSrc;
        if (iconCache[key] !== undefined) {
          n.baked = iconCache[key];
          n.bakedClaro = iconCacheClaro[key];
          if (n.baked) loadedLogos += 1;
          return;
        }
        const tryExt = (i) => {
          if (i >= exts.length) {
            iconCache[key] = null;
            return;
          }
          const img = new Image();
          img.onload = () => {
            const S = 96;
            const cv = document.createElement('canvas');
            cv.width = S;
            cv.height = S;
            const c2 = cv.getContext('2d');
            if (!c2) return;
            const ar = img.width / img.height || 1;
            const iw = ar >= 1 ? S : S * ar;
            const ih = ar >= 1 ? S / ar : S;
            c2.drawImage(img, (S - iw) / 2, (S - ih) / 2, iw, ih);
            /* Versão do tema claro: mesma arte com a claridade invertida e a
               cor mantida (ícone branco vira quase preto; o colorido continua
               da cor dele). Feita pixel a pixel, e não com ctx.filter, porque
               o Safari ignora filtro em canvas e o ícone saía branco sobre
               branco. Assada uma vez aqui: o laço de desenho não paga nada. */
            const cl = document.createElement('canvas');
            cl.width = S;
            cl.height = S;
            const c3 = cl.getContext('2d');
            if (c3) {
              c3.drawImage(cv, 0, 0);
              try {
                const img2 = c3.getImageData(0, 0, S, S);
                const d = img2.data;
                for (let i = 0; i < d.length; i += 4) {
                  if (d[i + 3] === 0) continue;
                  const r = d[i];
                  const g = d[i + 1];
                  const b = d[i + 2];
                  // Somar o mesmo valor aos três canais espelha a claridade
                  // sem mexer no matiz nem na saturação.
                  const k = 255 - Math.max(r, g, b) - Math.min(r, g, b);
                  d[i] = r + k;
                  d[i + 1] = g + k;
                  d[i + 2] = b + k;
                }
                c3.putImageData(img2, 0, 0);
              } catch {
                // Imagem de outra origem trava a leitura de pixels: fica a original.
              }
            }
            iconCacheClaro[key] = cl;
            n.bakedClaro = cl;
            iconCache[key] = cv;
            n.baked = cv;
            loadedLogos += 1;
            dirty = true;
          };
          img.onerror = () => tryExt(i + 1);
          img.src = `${n.iconSrc}.${exts[i]}`;
        };
        tryExt(0);
      });
    };

    /* ---- projeção 3D → 2D, com "fit to bounds" suavizado ---- */
    const project = () => {
      const cy = Math.cos(yaw + yawMao + yawCursor);
      const sy = Math.sin(yaw + yawMao + yawCursor);
      const cp = Math.cos(pitch + pitchMao);
      const sp = Math.sin(pitch + pitchMao);
      /* Meia-extensão a partir do centro (o nó core projeta sempre em 0,0).
         Medir assim, em vez do centro dos limites, é o que mantém o W
         cravado no meio: o centro dos limites muda a cada frame conforme o
         grafo gira, e o desenho inteiro escorregava junto. */
      let halfW = 1;
      let halfH = 1;

      for (const n of nodes) {
        const rx = n.x * cy + n.z * sy;
        const rz = -n.x * sy + n.z * cy;
        const ry = n.y * cp - rz * sp;
        const z2 = n.y * sp + rz * cp + n.depth;
        const s = FOCAL / Math.max(240, FOCAL + z2 + 520);
        n.px = rx * s;
        n.py = ry * s;
        n.s0 = s;
        /* O fundo perde só um pouco de força: antes a profundidade apagava
           metade do grafo e ele lia como desbotado. */
        n.alpha = Math.max(0.82, Math.min(1, (s - 0.5) / 0.13));
        const m = n.hub ? n.labW * 0.62 + 16 : n.r * s + 10;
        const ml = m + (n.side === 'left' ? n.labW : 0);
        const mr = m + (n.side === 'right' ? n.labW : 0);
        const vertical = !n.hub && (n.side === 'above' || n.side === 'below');
        const mh = vertical ? Math.max(m, n.labW / 2) : 0;
        halfW = Math.max(halfW, ml - n.px, n.px + mr, mh - n.px, n.px + mh);
        halfH = Math.max(
          halfH,
          m + (n.side === 'above' && vertical ? 24 : 0) - n.py,
          n.py + m + (n.side === 'below' && vertical ? 24 : 0),
        );
      }

      /* margem interna do encaixe: sem moldura o desenho pode chegar mais
         perto da borda, então sobra menos vazio e o grafo cresce */
      const padX = w < 520 ? 10 : 32;
      const padY = w < 520 ? 12 : 24;
      const target = Math.max(
        0.35,
        Math.min(mobile ? MAX_FIT_TOQUE : MAX_FIT, Math.min((w / 2 - padX) / halfW, (h / 2 - padY) / halfH)),
      );
      fit = fit == null ? target : fit + (target - fit) * 0.08;
      for (const n of nodes) {
        n.sx = w / 2 + n.px * fit;
        n.sy = h / 2 + n.py * fit;
        n.ss = n.s0 * fit;
      }
    };

    const pick = (px, py) => {
      let best = null;
      let bestD = 1e9;
      for (const n of nodes) {
        const d = Math.hypot(n.sx - px, n.sy - py);
        const hit = n.r * n.ss + 11;
        if (d < hit && d / (n.ss || 1) < bestD) {
          bestD = d / (n.ss || 1);
          best = n;
        }
      }
      return best;
    };

    /* ---- desenho ---- */
    const draw = () => {
      if (!ctx) return;
      project();
      ctx.clearRect(0, 0, w, h);

      const focus = hover;
      const lit = (id) => !focus || focus.id === id || focus.neighbors.has(id);
      const order = nodes.slice().sort((a, b) => a.ss - b.ss);

      /* O canvas não enxerga variável de CSS: lê o tema do <html> a cada
         quadro, assim a troca pelo botão vale na hora. No claro as cores dos
         grupos escurecem (as originais são luz sobre preto). */
      const claro = document.documentElement.dataset.tema === 'claro';
      for (const n of nodes) n.cc = claro ? (COR_NO_CLARO[n.color] ?? n.color) : n.color;
      const tinta = claro ? '#0b1220' : '#f3f6ff';
      const neutra = claro ? '#46546c' : '#aab4c4';

      /* ---- arestas: o grupo dá a cor; ligação entre grupos é tracejada e
         discreta, e só ganha força quando um dos lados está em foco ---- */
      ctx.lineCap = 'round';
      for (const e of edges) {
        const on = focus && (focus.id === e.a.id || focus.id === e.b.id);
        const ss = (e.a.ss + e.b.ss) / 2;
        const cruzada = e.tipo === 'cruzada';
        const base = cruzada ? (claro ? 0.2 : 0.16) : e.tipo === 'tronco' ? 0.55 : 0.4;
        const alpha = focus ? (on ? 0.9 : base * dimOpacity) : base;
        ctx.strokeStyle = rgba(cruzada ? (on ? tinta : neutra) : e.pilar.cc, alpha);
        ctx.lineWidth = Math.max(0.6, (e.tipo === 'tronco' ? 1.5 : on ? 1.4 : 1) * ss);
        ctx.setLineDash(cruzada && !on ? [2 * ss, 5 * ss] : []);
        ctx.beginPath();
        ctx.moveTo(e.a.sx, e.a.sy);
        ctx.lineTo(e.b.sx, e.b.sy);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      /* ---- nós, do fundo para a frente ---- */
      const rotulos = [];
      for (const n of order) {
        const on = lit(n.id);
        const emFoco = focus && focus.id === n.id;
        const a = n.alpha * (focus && !on ? dimOpacity : 1);
        const ss = n.ss;

        /* etiqueta do grupo: uma pílula com o nome dentro */
        if (n.hub) {
          const k = Math.max(0.85, Math.min(1.2, ss * 1.15));
          ctx.font = `600 ${(10.5 * k).toFixed(1)}px ${FONT}`;
          ctx.letterSpacing = `${(1.4 * k).toFixed(2)}px`;
          const tw = ctx.measureText(n.label).width;
          const pw = tw + 26 * k;
          const ph = 26 * k;
          ctx.beginPath();
          ctx.roundRect(n.sx - pw / 2, n.sy - ph / 2, pw, ph, ph / 2);
          ctx.fillStyle = rgba(claro ? '#ffffff' : '#0a1020', a);
          ctx.fill();
          ctx.fillStyle = rgba(n.cc, a * (claro ? 0.08 : 0.14));
          ctx.fill();
          ctx.strokeStyle = rgba(n.cc, a * (emFoco ? 1 : 0.7));
          ctx.lineWidth = emFoco ? 1.8 : 1.2;
          ctx.stroke();
          ctx.fillStyle = rgba(n.cc, a);
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(n.label, n.sx + 0.7 * k, n.sy + 0.5);
          ctx.letterSpacing = '0px';
          continue;
        }

        const r = Math.max(4, n.r * ss);

        /* profundidade: no escuro um halo da cor do grupo, no claro uma
           sombra curta embaixo do disco */
        const oy = claro ? r * 0.22 : 0;
        const g = claro
          ? ctx.createRadialGradient(n.sx, n.sy + oy, r * 0.7, n.sx, n.sy + oy, r * 1.55)
          : ctx.createRadialGradient(n.sx, n.sy, r * 0.8, n.sx, n.sy, r * (emFoco ? 2.4 : 1.8));
        g.addColorStop(0, claro ? rgba('#0b1220', a * 0.16) : rgba(n.cc, a * (emFoco ? 0.4 : 0.2)));
        g.addColorStop(1, claro ? rgba('#0b1220', 0) : rgba(n.cc, 0));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(n.sx, n.sy + oy, r * 2.4, 0, 6.2832);
        ctx.fill();

        /* disco */
        const face = ctx.createLinearGradient(0, n.sy - r, 0, n.sy + r);
        face.addColorStop(0, claro ? '#ffffff' : '#18223b');
        face.addColorStop(1, claro ? '#f1f4fa' : '#0a101e');
        ctx.globalAlpha = Math.min(1, a + 0.12);
        ctx.fillStyle = face;
        ctx.beginPath();
        ctx.arc(n.sx, n.sy, r, 0, 6.2832);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = rgba(n.glow ? tinta : n.cc, a * (emFoco || n.glow ? 1 : 0.8));
        ctx.lineWidth = Math.max(1, (emFoco ? 2.4 : n.glow ? 2 : 1.5) * ss);
        ctx.stroke();

        if (n.glow) {
          /* o centro é a marca: o monograma WA, não uma letra de fonte */
          const k = (r * 1.2) / 230;
          ctx.save();
          ctx.translate(n.sx, n.sy);
          ctx.scale(k, k);
          ctx.translate(-128, -128);
          ctx.fillStyle = rgba(tinta, a);
          LOGO_WA.forEach((p) => poligono(ctx, p));
          ctx.fillStyle = rgba(claro ? '#1d5fd8' : '#5b9cff', a);
          poligono(ctx, LOGO_WA_BARRA);
          ctx.restore();
          continue;
        }

        const icone = (claro && n.bakedClaro) || n.baked;
        if (icone) {
          const s = r * 1.16;
          ctx.globalAlpha = a;
          ctx.drawImage(icone, n.sx - s / 2, n.sy - s / 2, s, s);
          ctx.globalAlpha = 1;
        } else {
          const fs = Math.max(6.5, r * (n.mono.length > 2 ? 0.62 : n.mono.length > 1 ? 0.78 : 1));
          ctx.font = `600 ${fs.toFixed(1)}px ${FONT}`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = rgba(n.cc, a);
          ctx.fillText(n.mono, n.sx, n.sy + r * 0.04);
        }
        rotulos.push({ n, r, a, emFoco });
      }

      /* ---- rótulos, por cima de tudo ---- */
      for (const { n, r, a, emFoco } of rotulos) {
        const fs = Math.max(11, Math.min(14, 12.5 * n.ss * 1.1));
        ctx.font = `${emFoco || n.r >= 26 ? '600' : '500'} ${fs.toFixed(1)}px ${FONT}`;
        ctx.fillStyle = rgba(tinta, a * (emFoco ? 1 : 0.86));
        const off = r + 9 * Math.max(0.7, n.ss);
        if (n.side === 'above' || n.side === 'below') {
          ctx.textAlign = 'center';
          ctx.textBaseline = n.side === 'above' ? 'bottom' : 'top';
          ctx.fillText(n.label, n.sx, n.sy + (n.side === 'above' ? -off + 1 : off - 1));
        } else {
          ctx.textBaseline = 'middle';
          ctx.textAlign = n.side === 'right' ? 'left' : 'right';
          ctx.fillText(n.label, n.sx + (n.side === 'right' ? off : -off), n.sy);
        }
      }

      /* tooltip acompanha o nó em foco */
      const tip = tipRef.current;
      if (tip && hover && pointer) {
        tip.style.transform = `translate(${Math.round(
          hover.sx + 14,
        )}px,${Math.round(hover.sy - 12)}px)`;
      }
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = box.clientWidth;
      h = box.clientHeight;
      if (!w || !h) return;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx = canvas.getContext('2d');
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (isMobile() !== mobile) {
        build();
        loadIcons();
      }
      dirty = true;
    };

    const setHover = (node) => {
      if (hover === node) return;
      hover = node;
      dirty = true;
      const tip = tipRef.current;
      if (!tip) return;
      if (node) {
        tip.textContent = node.label;
        tip.style.opacity = '1';
      } else {
        tip.style.opacity = '0';
      }
    };

    /* ---- eventos ---- */
    const posOf = (e) => {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    const onPointerDown = (e) => {
      canvas.setPointerCapture(e.pointerId);
      drag = { x: e.clientX, y: e.clientY };
      canvas.style.cursor = 'grabbing';
    };
    const onPointerMove = (e) => {
      const p = posOf(e);
      pointer = p;
      if (drag) {
        const dx = e.clientX - drag.x;
        const dy = e.clientY - drag.y;
        /* O arrasto inclina até um limite: passar disso deixaria o grafo de
           lado, que é justamente a pose em que tudo se cobre. */
        yawMao = Math.max(-0.35, Math.min(0.35, yawMao - dx * 0.004));
        pitchMao = Math.max(-0.3, Math.min(0.3, pitchMao + dy * 0.003));
        drag.x = e.clientX;
        drag.y = e.clientY;
        dirty = true;
      } else {
        setHover(pick(p.x, p.y));
      }
    };
    const onPointerUp = () => {
      canvas.style.cursor = 'grab';
      drag = null;
    };
    const onPointerLeave = () => {
      pointer = null;
      setHover(null);
    };

    /* No TOQUE o grafo não é interativo, e isso é de propósito.
     *
     * O canvas ocupa 92vh. Com os gestos ligados, encostar nele para rolar
     * virava arrastar o grafo: o `pointerdown` chamava `setPointerCapture`,
     * e o `touch-action: none` da classe do canvas dizia ao navegador que a
     * página não queria rolagem ali. O dedo ficava preso numa tela inteira
     * de altura, e a única saída era acertar a margem lateral.
     *
     * Girar um grafo com o dedo é um brinquedo; rolar a página é a função.
     * Quando os dois disputam o mesmo gesto, quem perde é a função. */
    if (!ponteiroGrosso()) {
      canvas.addEventListener('pointerdown', onPointerDown);
      canvas.addEventListener('pointermove', onPointerMove);
      canvas.addEventListener('pointerup', onPointerUp);
      canvas.addEventListener('pointercancel', onPointerUp);
      canvas.addEventListener('pointerleave', onPointerLeave);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(box);
    /* fora da tela o loop não desenha: a página tem outras cenas pesadas */
    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0].isIntersecting;
      },
      { threshold: 0.05 },
    );
    io.observe(canvas);

    const loop = (t) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(2.4, (t - last) / 16.67);
      last = t;
      if (!visible || document.hidden) return;
      if (!reduced) {
        /* Balanço lento em vez de giro: poucos graus para cada lado, em dois
           ritmos diferentes para o movimento não parecer um pêndulo. */
        const fase = (t / (rotationSeconds * 250)) * Math.PI * 2;
        yaw = Math.sin(fase) * 0.2;
        pitch = -0.1 + Math.sin(fase * 0.73) * 0.045;
        const alvo = pointer && !drag ? (pointer.x / w - 0.5) * 0.24 : 0;
        yawCursor += (alvo - yawCursor) * Math.min(1, 0.06 * dt);
        if (!drag) {
          yawMao *= 0.93 ** dt;
          pitchMao *= 0.93 ** dt;
        }
        dirty = true;
      }
      if (!dirty) return;
      dirty = !reduced;
      draw();
    };

    build();
    loadIcons();
    resize();
    last = performance.now();
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(iconTimer);
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
      canvas.removeEventListener('pointerleave', onPointerLeave);
    };
  }, [rotationSeconds, dimOpacity]);

  return (
    <div
      className={`relative h-[clamp(520px,92vh,1020px)] w-full ${className}`}
    >
      <canvas
        ref={canvasRef}
        className={`block h-full w-full ${semGestos ? "touch-pan-y" : "cursor-grab touch-none"}`}
      />

      {missingLogos && (
        <p className="pointer-events-none absolute bottom-3 left-4 max-w-[62%] rounded-md border border-dashed border-line px-2.5 py-1.5 text-[10.5px] leading-relaxed text-muted">
          Logos ausentes: solte os arquivos em{' '}
          <span className="text-foreground/75">public/stack-icons/</span>. Até
          lá, monogramas.
        </p>
      )}

      <div
        ref={tipRef}
        className="pointer-events-none absolute top-0 left-0 rounded-md border border-line bg-surface px-2.5 py-1 text-[11px] whitespace-nowrap text-foreground opacity-0 transition-opacity duration-100"
      />
    </div>
  );
}
