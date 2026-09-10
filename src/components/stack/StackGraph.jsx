'use client';

/* Grafo 3D da stack: nós ligados por arestas, orbitando devagar, com física de
   repulsão/mola rodando a cada frame. Arrastar gira a câmera; passar o mouse
   num nó acende ele e os vizinhos e apaga o resto.
 *
 * Portado de um componente vanilla que vivia num HTML solto (formato .dc.html,
 * com framework próprio). Aqui virou componente React: a simulação inteira
 * mora dentro de um único useEffect, que devolve o cleanup de tudo (rAF,
 * observers e listeners). Convenção do repo para componente portado: .jsx com
 * tipos escritos à mão no .d.ts ao lado, igual CardSwap e Lanyard.
 *
 * Paleta ajustada para os tokens do site (o azul do pilar de frontend é o
 * --accent; o núcleo é o --foreground) para o grafo não parecer colado de
 * outro lugar.
 */

import { useEffect, useRef, useState } from 'react';

/* =========================================================================
   CONFIGURAÇÃO DA STACK — é aqui que se edita o conteúdo do grafo.
   pillars: cor, profundidade (menor = mais perto da câmera), âncora do
            cluster e raio de distribuição das folhas.
   nodes:   { id, label, pillar, r (tamanho), hub, glow, mobile, note }
   edges:   [a, b] — hub↔folha e ligações cruzadas.
   Os ícones saem de /stack-icons/<id>.svg; sem arquivo, o nó cai no
   monograma de `mono`.
   ========================================================================= */
const GRAPH = {
  iconDir: '/stack-icons/',
  mono: {
    w: 'W',
    react: 'R',
    next: 'N',
    ts: 'TS',
    tw: 'TW',
    claude: 'C',
    openai: 'AI',
    aisdk: 'SDK',
    rag: 'RAG',
    mcp: 'MCP',
    n8n: 'n8n',
    node: 'JS',
    python: 'Py',
    pg: 'PG',
    supabase: 'S',
    docker: 'D',
    linux: 'L',
    erps: 'ERP',
  },
  physics: {
    repulsion: 11000,
    spring: 0.014,
    springLength: 92,
    anchor: 0.014,
    damping: 0.86,
  },
  pillars: {
    core: { color: '#f3f6ff', depth: -60, anchor: [0, 0, 0], radius: 0 },
    frontend: {
      color: '#5b9cff',
      depth: -130,
      anchor: [-205, -95, -10],
      radius: 108,
    },
    ai: { color: '#f0a94c', depth: -130, anchor: [200, -62, -10], radius: 132 },
    backend: {
      color: '#93a4b8',
      depth: 40,
      anchor: [-145, 138, 20],
      radius: 96,
    },
    infra: { color: '#5f6873', depth: 190, anchor: [158, 152, 30], radius: 92 },
  },
  nodes: [
    /* noIcon: o centro é o monograma "W" de propósito, então nem tenta
       buscar arquivo (evita 404 no console). */
    { id: 'w', label: 'W', pillar: 'core', r: 25, glow: true, noIcon: true },

    { id: 'h-fe', label: 'FRONTEND', pillar: 'frontend', r: 9, hub: true },
    { id: 'react', label: 'React', pillar: 'frontend', r: 15 },
    { id: 'next', label: 'Next.js', pillar: 'frontend', r: 15 },
    { id: 'ts', label: 'TypeScript', pillar: 'frontend', r: 15 },
    { id: 'tw', label: 'Tailwind', pillar: 'frontend', r: 10 },

    { id: 'h-ai', label: 'IA & AUTOMAÇÃO', pillar: 'ai', r: 9, hub: true },
    { id: 'claude', label: 'Claude / Anthropic API', pillar: 'ai', r: 15 },
    { id: 'openai', label: 'OpenAI API', pillar: 'ai', r: 11 },
    { id: 'aisdk', label: 'Vercel AI SDK', pillar: 'ai', r: 12 },
    { id: 'rag', label: 'RAG · embeddings + pgvector', pillar: 'ai', r: 12 },
    { id: 'mcp', label: 'MCP', pillar: 'ai', r: 10 },
    { id: 'n8n', label: 'n8n', pillar: 'ai', r: 10 },

    { id: 'h-be', label: 'BACKEND & DADOS', pillar: 'backend', r: 8, hub: true },
    { id: 'node', label: 'Node.js', pillar: 'backend', r: 10, mobile: 'hide' },
    { id: 'python', label: 'Python', pillar: 'backend', r: 10, mobile: 'hide' },
    { id: 'pg', label: 'PostgreSQL', pillar: 'backend', r: 10, mobile: 'hide' },
    { id: 'supabase', label: 'Supabase', pillar: 'backend', r: 14 },

    {
      id: 'h-in',
      label: 'INFRA & INTEGRAÇÕES',
      pillar: 'infra',
      r: 7,
      hub: true,
      mobile: 'hide',
    },
    { id: 'docker', label: 'Docker', pillar: 'infra', r: 8, mobile: 'hide' },
    { id: 'linux', label: 'Linux / WSL', pillar: 'infra', r: 8, mobile: 'hide' },
    { id: 'erps', label: 'ERP CIGAM', pillar: 'infra', r: 8, mobile: 'hide' },
  ],
  edges: [
    ['w', 'h-fe'],
    ['w', 'h-ai'],
    ['w', 'h-be'],
    ['w', 'h-in'],
    ['h-fe', 'react'],
    ['h-fe', 'next'],
    ['h-fe', 'ts'],
    ['h-fe', 'tw'],
    ['h-ai', 'claude'],
    ['h-ai', 'openai'],
    ['h-ai', 'aisdk'],
    ['h-ai', 'rag'],
    ['h-ai', 'mcp'],
    ['h-ai', 'n8n'],
    ['h-be', 'node'],
    ['h-be', 'python'],
    ['h-be', 'pg'],
    ['h-be', 'supabase'],
    ['h-in', 'docker'],
    ['h-in', 'linux'],
    ['h-in', 'erps'],
    ['next', 'aisdk'],
    ['aisdk', 'openai'],
    ['aisdk', 'claude'],
    ['mcp', 'claude'],
    ['mcp', 'supabase'],
    ['rag', 'supabase'],
    ['rag', 'pg'],
    ['rag', 'python'],
    ['react', 'supabase'],
    ['supabase', 'pg'],
    ['node', 'docker'],
    ['n8n', 'docker'],
    ['n8n', 'erps'],
  ],
};

const FOCAL = 880;
/* Teto do "fit to bounds". Sem isso o grafo cresceria sem limite em telas
   grandes; com um teto baixo demais ele para de crescer e sobra vazio na
   caixa. */
const MAX_FIT = 2.3;

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
    let pitch = -0.12;
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
        n.side =
          cfg.hub || cfg.glow ? 'below' : p.anchor[0] < 0 ? 'left' : 'right';
        n.faded = cfg.pillar === 'infra' || cfg.pillar === 'backend';
        n.anchor = p.anchor.slice();
        n.x = p.anchor[0];
        n.y = p.anchor[1];
        n.z = p.anchor[2];
        n.vx = 0;
        n.vy = 0;
        n.vz = 0;
        n.neighbors = new Set();
        byId[n.id] = n;
        return n;
      });

      /* folhas distribuídas em volta da âncora do pilar (ângulo áureo) */
      const counts = {};
      nodes.forEach((n) => {
        if (n.pillar === 'core' || n.hub) return;
        const p = GRAPH.pillars[n.pillar];
        const k = (counts[n.pillar] = (counts[n.pillar] || 0) + 1);
        const a = k * 2.399963;
        const rad = p.radius * (0.65 + 0.35 * ((k % 3) / 2));
        n.anchor = [
          p.anchor[0] + Math.cos(a) * rad,
          p.anchor[1] + Math.sin(a) * rad * 0.72,
          p.anchor[2] + Math.sin(a * 1.7) * rad * 0.6,
        ];
        n.x = n.anchor[0];
        n.y = n.anchor[1];
        n.z = n.anchor[2];
      });

      edges = GRAPH.edges
        .filter(([a, b]) => byId[a] && byId[b])
        .map(([a, b]) => {
          const e = { a: byId[a], b: byId[b] };
          e.a.neighbors.add(e.b.id);
          e.b.neighbors.add(e.a.id);
          return e;
        });
    };

    /* ---- logos: tenta svg/png/webp e pré-renderiza num canvas ----
       Os pilares de apoio (backend/infra) entram dessaturados, então o
       resultado já sai "assado" no cache e o draw só desenha bitmap. */
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
        const key = `${n.iconSrc}|${n.faded ? 'f' : 'n'}`;
        if (iconCache[key] !== undefined) {
          n.baked = iconCache[key];
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
            if (n.faded) c2.filter = 'grayscale(0.9) brightness(0.85)';
            const ar = img.width / img.height || 1;
            const iw = ar >= 1 ? S : S * ar;
            const ih = ar >= 1 ? S / ar : S;
            c2.drawImage(img, (S - iw) / 2, (S - ih) / 2, iw, ih);
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

    /* ---- física ---- */
    const step = (dt) => {
      const P = GRAPH.physics;
      for (let i = 0; i < nodes.length; i += 1) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j += 1) {
          const b = nodes[j];
          let dx = b.x - a.x;
          const dy = b.y - a.y;
          const dz = b.z - a.z;
          let d2 = dx * dx + dy * dy + dz * dz;
          if (d2 < 1) {
            dx = 1;
            d2 = 1;
          }
          const d = Math.sqrt(d2);
          const f = P.repulsion / d2 / d;
          a.vx -= dx * f;
          a.vy -= dy * f;
          a.vz -= dz * f;
          b.vx += dx * f;
          b.vy += dy * f;
          b.vz += dz * f;
        }
      }
      for (const e of edges) {
        const { a, b } = e;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dz = b.z - a.z;
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
        const f = ((d - P.springLength) * P.spring) / d;
        a.vx += dx * f;
        a.vy += dy * f;
        a.vz += dz * f;
        b.vx -= dx * f;
        b.vy -= dy * f;
        b.vz -= dz * f;
      }
      for (const n of nodes) {
        if (n.pillar === 'core') {
          n.x = 0;
          n.y = 0;
          n.z = 0;
          n.vx = 0;
          n.vy = 0;
          n.vz = 0;
          continue;
        }
        const k = P.anchor * (n.hub ? 2.4 : 1);
        n.vx += (n.anchor[0] - n.x) * k;
        n.vy += (n.anchor[1] - n.y) * k;
        n.vz += (n.anchor[2] - n.z) * k;
        n.vx *= P.damping;
        n.vy *= P.damping;
        n.vz *= P.damping;
        n.x += n.vx * dt;
        n.y += n.vy * dt;
        n.z += n.vz * dt;
      }
    };

    /* ---- projeção 3D → 2D, com "fit to bounds" suavizado ---- */
    const project = () => {
      const cy = Math.cos(yaw);
      const sy = Math.sin(yaw);
      const cp = Math.cos(pitch);
      const sp = Math.sin(pitch);
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
        n.alpha = Math.max(0.3, Math.min(1, (s - 0.42) / 0.42));
        const m = n.r * s + 10;
        const ml = m + (n.side === 'left' ? n.labW : 0);
        const mr = m + (n.side === 'right' ? n.labW : 0);
        halfW = Math.max(halfW, ml - n.px, n.px + mr);
        halfH = Math.max(halfH, m - n.py, n.py + m);
      }

      /* margem interna do encaixe: sem moldura o desenho pode chegar mais
         perto da borda, então sobra menos vazio e o grafo cresce */
      const padX = w < 520 ? 20 : 32;
      const padY = 24;
      const target = Math.max(
        0.35,
        Math.min(MAX_FIT, Math.min((w / 2 - padX) / halfW, (h / 2 - padY) / halfH)),
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
      const order = nodes.slice().sort((a, b) => b.ss - a.ss);
      const labels = [];

      /* arestas */
      for (const e of edges) {
        const on =
          !focus ||
          (lit(e.a.id) &&
            lit(e.b.id) &&
            (focus.id === e.a.id || focus.id === e.b.id));
        const depth = (e.a.alpha + e.b.alpha) / 2;
        const base = 0.13 * depth;
        const alpha = focus ? (on ? 0.52 * depth + 0.18 : base * dimOpacity) : base;
        ctx.strokeStyle =
          on && focus
            ? `rgba(207,214,224,${alpha.toFixed(3)})`
            : `rgba(150,160,175,${alpha.toFixed(3)})`;
        ctx.lineWidth = Math.max(
          0.5,
          (on && focus ? 1.25 : 0.9) * ((e.a.ss + e.b.ss) / 2),
        );
        ctx.beginPath();
        ctx.moveTo(e.a.sx, e.a.sy);
        ctx.lineTo(e.b.sx, e.b.sy);
        ctx.stroke();
      }

      /* nós, de trás para frente */
      for (let i = order.length - 1; i >= 0; i -= 1) {
        const n = order[i];
        const on = lit(n.id);
        const a = n.alpha * (focus ? (on ? 1 : dimOpacity) : 1);
        const r = Math.max(2, n.r * n.ss);
        const soft = n.ss < 0.82;

        /* halo só no nó sob o cursor: o centro tinha um halo permanente
           gigante (raio 4.2× o do nó) que virava uma nuvem no meio do grafo */
        if (focus && focus.id === n.id) {
          const g = ctx.createRadialGradient(
            n.sx,
            n.sy,
            r * 0.6,
            n.sx,
            n.sy,
            r * 4.2,
          );
          g.addColorStop(0, rgba(n.color, 0.3 * a));
          g.addColorStop(1, rgba(n.color, 0));
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(n.sx, n.sy, r * 4.2, 0, 6.2832);
          ctx.fill();
        }

        if (n.hub) {
          /* marcador de pilar: disco simples, sem logo */
          ctx.fillStyle = rgba(n.color, a * 0.9);
          ctx.beginPath();
          ctx.arc(n.sx, n.sy, r, 0, 6.2832);
          ctx.fill();
          ctx.strokeStyle = rgba('#05070e', 0.85);
          ctx.lineWidth = 2 * n.ss;
          ctx.stroke();
        } else {
          if (soft) {
            /* halo macio nos nós do fundo, para dar profundidade */
            const g = ctx.createRadialGradient(
              n.sx,
              n.sy,
              r * 0.7,
              n.sx,
              n.sy,
              r * 2.1,
            );
            g.addColorStop(0, rgba(n.color, a * 0.22));
            g.addColorStop(1, rgba(n.color, 0));
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(n.sx, n.sy, r * 2.1, 0, 6.2832);
            ctx.fill();
          }
          ctx.fillStyle = rgba('#0c1220', Math.min(1, a * 0.97));
          ctx.beginPath();
          ctx.arc(n.sx, n.sy, r, 0, 6.2832);
          ctx.fill();
          ctx.strokeStyle = rgba(
            n.color,
            a * (n.glow ? 0.95 : soft ? 0.45 : 0.75),
          );
          ctx.lineWidth = Math.max(0.8, (n.glow ? 2.4 : 1.5) * n.ss);
          ctx.stroke();

          const s = r * (n.glow ? 1.15 : 1.24);
          if (n.baked) {
            ctx.globalAlpha = a;
            ctx.drawImage(n.baked, n.sx - s / 2, n.sy - s / 2, s, s);
            ctx.globalAlpha = 1;
          } else {
            const fs = Math.max(
              6.5,
              r * (n.mono.length > 2 ? 0.62 : n.mono.length > 1 ? 0.78 : 1),
            );
            ctx.font = `600 ${fs.toFixed(1)}px ${FONT}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = rgba(n.glow ? '#f3f6ff' : n.color, a * 0.95);
            ctx.fillText(n.mono, n.sx, n.sy + r * 0.04);
          }
        }

        if (!n.glow) labels.push({ n, r, a, on });
      }

      /* labels numa segunda passada, por prioridade */
      const prio = (l) =>
        (focus && focus.id === l.n.id ? 100 : 0) +
        (l.on ? 20 : 0) +
        (l.n.hub ? 12 : 0) +
        l.n.r * l.n.ss * 0.4;
      labels.sort((p, q) => prio(q) - prio(p));

      for (const l of labels) {
        const n = l.n;
        const big = n.r >= 15 || n.hub;
        const fs = Math.max(
          10,
          Math.min(13.5, (n.hub ? 10.5 : 12) * Math.min(1.05, n.ss * 1.25)),
        );
        ctx.font = `${big ? '600' : '400'} ${fs.toFixed(1)}px ${FONT}`;
        if (n.hub) ctx.letterSpacing = '0.14em';
        const la =
          l.a *
          (n.hub ? 0.95 : big ? 0.95 : 0.72) *
          (focus && !l.on ? Math.max(0.3, dimOpacity) : 1);
        ctx.fillStyle = n.hub ? rgba(n.color, la) : rgba('#dfe4ec', la);
        /* zona morta: o lado do label só troca quando o nó cruza bem o
           centro, senão fica piscando de um lado para o outro */
        if (n.side !== 'below') {
          const d = n.sx - w / 2;
          if (d > 26) n.side = 'right';
          else if (d < -26) n.side = 'left';
        }
        if (n.side === 'below') {
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillText(n.label, n.sx, n.sy + l.r + 5 * n.ss + 4);
        } else {
          ctx.textBaseline = 'middle';
          ctx.textAlign = n.side === 'right' ? 'left' : 'right';
          const off = l.r + 7 * Math.max(0.6, n.ss);
          ctx.fillText(
            n.label,
            n.sx + (n.side === 'right' ? off : -off),
            n.sy,
          );
        }
        if (n.hub) ctx.letterSpacing = '0px';
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
        for (let i = 0; i < 300; i += 1) step(1);
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
        yaw -= dx * 0.006;
        pitch = Math.max(-0.55, Math.min(0.55, pitch + dy * 0.004));
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

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);
    canvas.addEventListener('pointerleave', onPointerLeave);

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
        yaw += (Math.PI * 2 * (dt * 16.67)) / (rotationSeconds * 1000);
        step(dt);
        dirty = true;
      }
      if (!dirty) return;
      dirty = !reduced;
      draw();
    };

    build();
    loadIcons();
    resize();
    /* pré-aquece a simulação para o grafo já nascer arrumado */
    for (let i = 0; i < 420; i += 1) step(1);
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
        className="block h-full w-full cursor-grab touch-none"
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
