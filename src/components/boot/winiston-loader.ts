/* Logo reveal "Winiston Alle": o nome desenhado com traços SVG animados.

   Veio de um loader em JS puro (winiston-loader.js) e foi portado para cá com
   três mudanças:
   - Não cria overlay nem trava a rolagem: desenha dentro do contêiner que o
     BootIntro passar, e quem cobre a tela e trava o scroll continua sendo ele.
   - Não tem saída própria (slide/fade): quando termina, chama `onDone`, e o
     BootIntro entrega a tela para a cortina de pixels, a mesma transição das
     trocas de página. Assim a abertura conversa com o resto do site.
   - As cores vêm de fora: o BootIntro passa a paleta do portfólio.

   Fonte monoline. Coordenadas locais: topo das maiúsculas y=10, altura-x y=40,
   linha de base y=100. `main` é o traço contínuo que a "cobrinha" percorre,
   `extra` são traços desenhados depois e `dot` é o pingo do i. */

const NS = 'http://www.w3.org/2000/svg';
const SW = 15; // espessura do traço, em unidades do viewBox

type Glyph = { w: number; main: string; extra?: string[]; dot?: [number, number] };

const GLYPHS: Record<string, Glyph> = {
  W: { w: 100, main: 'M0 10 L24 100 L50 32 L76 100 L100 10' },
  i: { w: 0, main: 'M0 40 L0 100', dot: [0, 15] },
  n: { w: 48, main: 'M0 100 L0 64 A24 24 0 0 1 48 64 L48 100' },
  s: {
    w: 42,
    main: 'M41 50 C36 43 28 40 21 40 C10 40 3 46 3 55 C3 64 11 67 21 70 C31 73 41 76 41 86 C41 95 32 100 21 100 C12 100 4 97 0 90',
  },
  t: { w: 32, main: 'M10 16 L10 84 C10 95 16 100 26 100 L32 100', extra: ['M0 42 L28 42'] },
  o: { w: 60, main: 'M30 40 A30 30 0 1 1 30 100 A30 30 0 1 1 30 40' },
  A: { w: 84, main: 'M0 100 L42 10 L84 100', extra: ['M15 70 L69 70'] },
  l: { w: 0, main: 'M0 10 L0 100' },
  e: { w: 60, main: 'M51.21 91.21 A30 30 0 1 1 60 70 L0 70' },
};
const TEXT = 'Winiston Alle';
const GAP = 30;
const SPACE = 48;
const DOT_Y = 70;

/* Linha do tempo, em segundos */
const T = {
  popDur: 0.4,
  pulses: [0.95, 1.75, 2.55], // troca de cor: branco, cor 2, cor 1, branco
  shrink: 0.14,
  regrow: 0.32,
  split: 3.05,
  splitDur: 0.65,
  write: 3.75, // as letras começam a ser escritas
  stagger: 0.45,
  letterDur: 0.75,
  orbitDur: 1.7,
  done: 5.5,
};

export type LoaderColors = {
  /** Cor do nome pronto e das bolinhas. */
  white: string;
  /** Primeira cor de destaque (cometa da primeira letra, cabeças ímpares). */
  blue: string;
  /** Segunda cor de destaque (cometa da última letra, cabeças pares). */
  green: string;
};

export type LoaderOptions = {
  colors: LoaderColors;
  speed?: number;
  /** ms parado no nome pronto antes de chamar onDone. */
  hold?: number;
  onDone: () => void;
};

type Letter = {
  ch: string;
  g: Glyph;
  ox: number;
  cx: number;
  mode: 'orbit' | 'snake';
  dot: [number, number];
  start: number;
  dur: number;
  lag: number;
  maxWin: number;
  win: number;
  head: string;
  tail: string | null;
  headLen: number;
  tailLen: number;
  len: number;
  lead: number;
  pMain: SVGPathElement;
  pTail: SVGPathElement | null;
  pHead: SVGPathElement;
  extras: { el: SVGPathElement; len: number }[];
  tittle?: { el: SVGCircleElement; color: string };
  circle: SVGCircleElement;
};

/* ---------- helpers ---------- */
const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const inOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const outCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const inCubic = (t: number) => t * t * t;
const outBack = (t: number, s = 1.70158) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2);
const f2 = (n: number) => Math.round(n * 100) / 100;

function hex(c: string) {
  let h = c.replace('#', '');
  if (h.length === 3) h = h.replace(/./g, '$&$&');
  return [0, 2, 4].map((i) => parseInt(h.substr(i, 2), 16));
}
function mix(c1: string, c2: string, k: number) {
  const a = hex(c1);
  const b = hex(c2);
  return `rgb(${a.map((v, i) => Math.round(lerp(v, b[i], k))).join(',')})`;
}
function el<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs: Record<string, string | number>,
  parent?: Element,
): SVGElementTagNameMap[K] {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, String(attrs[k]));
  if (parent) parent.appendChild(n);
  return n;
}

// Desloca um path absoluto (M, L, C, A) por dx, dy
const ARITY: Record<string, number> = { M: 2, L: 2, C: 6, A: 7 };
function shift(d: string, dx: number, dy: number) {
  const tok = d.match(/[a-zA-Z]|-?\d*\.?\d+/g) ?? [];
  const out: (string | number)[] = [];
  let cmd = '';
  let k = 0;
  tok.forEach((t) => {
    if (/[a-zA-Z]/.test(t)) {
      cmd = t;
      k = 0;
      out.push(t);
      return;
    }
    let v = parseFloat(t);
    const j = k % ARITY[cmd];
    if (cmd === 'A') {
      if (j === 5) v += dx;
      else if (j === 6) v += dy;
    } else v += j % 2 === 0 ? dx : dy;
    out.push(f2(v));
    k++;
  });
  return out.join(' ');
}
function firstPoint(d: string): [number, number] {
  const m = d.match(/^M\s*(-?[\d.]+)\s+(-?[\d.]+)/)!;
  return [+m[1], +m[2]];
}
const dropMove = (d: string) => d.replace(/^M\s*-?[\d.]+\s+-?[\d.]+\s*/, '');

/* ---------- montagem ---------- */
function build(o: LoaderOptions, parent: HTMLElement) {
  const { white, blue, green } = o.colors;
  const svg = el('svg', { 'aria-hidden': 'true', focusable: 'false' });
  svg.style.cssText = 'width:min(88vw,900px);height:auto;overflow:visible;display:block;';
  parent.appendChild(svg); // precisa estar no DOM para medir os paths

  const placed: { ch: string; g: Glyph; ox: number }[] = [];
  let x = 0;
  TEXT.split('').forEach((ch) => {
    if (ch === ' ') {
      x += SPACE;
      return;
    }
    const g = GLYPHS[ch];
    placed.push({ ch, g, ox: x });
    x += g.w + GAP;
  });
  const wordW = x - GAP;
  const cx = wordW / 2;
  const cy = 58;
  const rx = wordW / 2 + 70;
  const ry = 118;
  const pad = SW + 6;
  svg.setAttribute('viewBox', [f2(cx - rx - pad), f2(cy - ry - pad), f2(rx * 2 + pad * 2), f2(ry * 2 + pad * 2)].join(' '));

  const gStrokes = el(
    'g',
    { fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': SW },
    svg,
  );
  const gDots = el('g', {}, svg);
  const measure = el('path', { d: 'M0 0', visibility: 'hidden' }, svg);
  const len = (d: string) => {
    measure.setAttribute('d', d);
    return measure.getTotalLength();
  };
  const ptAt = (d: string, l: number): [number, number] => {
    measure.setAttribute('d', d);
    const p = measure.getPointAtLength(l);
    return [p.x, p.y];
  };
  const ellipse = (a: number): [number, number] => {
    const r = (a * Math.PI) / 180;
    return [cx + rx * Math.cos(r), cy + ry * Math.sin(r)];
  };
  const ellipseTangent = (a: number): [number, number] => {
    const r = (a * Math.PI) / 180;
    const tx = -rx * Math.sin(r);
    const ty = ry * Math.cos(r);
    const m = Math.hypot(tx, ty);
    return [tx / m, ty / m];
  };

  const last = placed.length - 1;
  let maxDist = 0;
  placed.forEach((L) => {
    maxDist = Math.max(maxDist, Math.abs(L.ox + L.g.w / 2 - cx));
  });
  const firstDotted = placed.find((q) => q.g.dot);

  const letters: Letter[] = placed.map((P, idx) => {
    const lcx = P.ox + P.g.w / 2;
    const main = shift(P.g.main, P.ox, 0);
    const S = firstPoint(main);
    const glyphLen = len(main);
    let d: string;
    const L = { ch: P.ch, g: P.g, ox: P.ox, cx: lcx } as Letter;

    if (idx === 0 || idx === last) {
      // primeira e última letra nascem de cometas orbitando a palavra
      L.mode = 'orbit';
      const a0 = idx === 0 ? 180 : 0;
      const a1 = idx === 0 ? 180 + 355 : 360 + 38;
      const P0 = ellipse(a0);
      const pts: string[] = [];
      for (let a = a0; a <= a1; a += 2) pts.push(ellipse(a).map(f2).join(' '));
      const Pe = ellipse(a1);
      const Te = ellipseTangent(a1);
      const dir = ptAt(main, 1);
      let dx = dir[0] - S[0];
      let dy = dir[1] - S[1];
      const m = Math.hypot(dx, dy);
      dx /= m;
      dy /= m;
      const k1 = idx === 0 ? 55 : 70;
      const k2 = idx === 0 ? 85 : 55;
      d =
        `M ${pts[0]} L ${pts.slice(1).join(' L ')}` +
        ` C ${f2(Pe[0] + Te[0] * k1)} ${f2(Pe[1] + Te[1] * k1)} ` +
        `${f2(S[0] - dx * k2)} ${f2(S[1] - dy * k2)} ${f2(S[0])} ${f2(S[1])} ${dropMove(main)}`;
      L.dot = P0;
      L.start = T.write;
      L.dur = T.orbitDur;
      L.lag = 0.3;
      L.maxWin = 460;
      L.head = idx === 0 ? blue : green;
      L.tail = idx === 0 ? green : blue;
      L.headLen = 120;
      L.tailLen = 110;
    } else {
      L.mode = 'snake';
      const D: [number, number] = [lcx, DOT_Y];
      d =
        (Math.hypot(D[0] - S[0], D[1] - S[1]) < 0.5
          ? `M ${S.join(' ')}`
          : `M ${f2(D[0])} ${f2(D[1])} L ${S.map(f2).join(' ')}`) + ` ${dropMove(main)}`;
      L.dot = D;
      L.start = T.write + (Math.abs(lcx - cx) / maxDist) * T.stagger;
      L.dur = T.letterDur;
      L.win = 22;
      L.head = idx % 2 ? blue : green;
      L.tail = null;
      L.headLen = 30;
    }

    L.len = len(d);
    L.lead = L.len - glyphLen;
    L.pMain = el('path', { d, stroke: white, visibility: 'hidden' }, gStrokes);
    L.pTail = L.tail ? el('path', { d, stroke: L.tail, visibility: 'hidden' }, gStrokes) : null;
    L.pHead = el('path', { d, stroke: L.head, visibility: 'hidden' }, gStrokes);
    L.extras = (P.g.extra ?? []).map((ed) => {
      const sd = shift(ed, P.ox, 0);
      return { el: el('path', { d: sd, stroke: white, visibility: 'hidden' }, gStrokes), len: len(sd) };
    });
    if (P.g.dot) {
      const dotColor = firstDotted === P ? green : blue;
      L.tittle = {
        el: el('circle', { cx: f2(P.ox + P.g.dot[0]), cy: P.g.dot[1], r: 0, fill: dotColor }, gDots),
        color: dotColor,
      };
    }
    // bolinha inicial correspondente
    L.circle = el('circle', { cx: f2(cx), cy: DOT_Y, r: 0, fill: white }, gDots);
    return L;
  });
  svg.removeChild(measure);

  let lastEnd = 0;
  letters.forEach((L) => {
    lastEnd = Math.max(lastEnd, L.start + L.dur);
  });

  return { svg, letters, center: [cx, DOT_Y] as [number, number], end: Math.max(T.done, lastEnd + 0.05) };
}

type Scene = ReturnType<typeof build>;

/* ---------- render de um instante t ---------- */
function heroScale(t: number) {
  const BIG = 1.25;
  if (t < T.popDur) return BIG * outBack(t / T.popDur, 2.2);
  for (const c of T.pulses) {
    if (t >= c - T.shrink && t < c) return BIG * (1 - inCubic((t - (c - T.shrink)) / T.shrink));
    if (t >= c && t < c + T.regrow) return BIG * outBack((t - c) / T.regrow, 2.2);
  }
  if (t >= T.split) return lerp(BIG, 1, outCubic(clamp01((t - T.split) / T.splitDur)));
  return BIG;
}
function heroColor(t: number, c: LoaderColors) {
  if (t < T.pulses[0]) return c.white;
  if (t < T.pulses[1]) return c.green;
  if (t < T.pulses[2]) return c.blue;
  return c.white;
}
function win(p: SVGPathElement, a: number, b: number, total: number) {
  p.setAttribute('stroke-dasharray', `${f2(Math.max(0.01, b - a))} ${f2(total + 60)}`);
  p.setAttribute('stroke-dashoffset', String(f2(-a)));
}
const show = (p: SVGElement, v: boolean) => p.setAttribute('visibility', v ? 'visible' : 'hidden');

function render(S: Scene, c: LoaderColors, t: number) {
  const r0 = SW / 2;
  const hs = heroScale(t);
  const hc = heroColor(t, c);
  const ks = t < T.split ? 0 : outBack(clamp01((t - T.split) / T.splitDur), 1.5);
  const settle = smooth(S.end - 0.15, S.end + 0.35, t); // as cores voltam para o branco no fim

  S.letters.forEach((L) => {
    // bolinha
    const dotOn = t < L.start;
    show(L.circle, dotOn);
    if (dotOn) {
      L.circle.setAttribute('cx', String(f2(lerp(S.center[0], L.dot[0], ks))));
      L.circle.setAttribute('cy', String(f2(lerp(S.center[1], L.dot[1], ks))));
      L.circle.setAttribute('r', String(f2(Math.max(0, r0 * hs))));
      L.circle.setAttribute('fill', hc);
    }

    // traço
    const on = t >= L.start;
    show(L.pMain, on);
    show(L.pHead, false);
    if (L.pTail) show(L.pTail, false);
    L.extras.forEach((e) => show(e.el, false));
    if (L.tittle) L.tittle.el.setAttribute('r', '0');
    if (!on) return;

    const p = clamp01((t - L.start) / L.dur);
    const b = inOutCubic(p) * L.len;
    let a: number;
    if (L.mode === 'orbit') {
      // a cauda segue a cabeça com janela máxima; o termo com atraso garante que termina no início da letra
      const lagged = inOutCubic(clamp01((p - L.lag) / (1 - L.lag))) * L.lead;
      a = Math.min(L.lead, b, Math.max(b - L.maxWin, lagged));
    } else {
      a = Math.min(L.lead, Math.max(0, b - L.win));
    }
    win(L.pMain, a, b, L.len);

    const fade = 1 - smooth(0.72, 1, p);
    const span = b - a;
    const h = Math.min(L.headLen, span * 0.45) * fade;
    if (h > 0.4) {
      show(L.pHead, true);
      win(L.pHead, Math.max(a, b - h), b, L.len);
    }
    if (L.pTail) {
      const tl = Math.min(L.tailLen, span * 0.4) * fade;
      if (tl > 0.4) {
        show(L.pTail, true);
        win(L.pTail, a, Math.min(b, a + tl), L.len);
      }
    }

    // traços secundários
    const pe = clamp01((t - (L.start + L.dur * 0.82)) / 0.3);
    L.extras.forEach((e) => {
      if (pe <= 0) return;
      show(e.el, true);
      win(e.el, 0, outCubic(pe) * e.len, e.len);
    });

    // pingo do i
    if (L.tittle) {
      const pt = clamp01((t - (L.start + L.dur * 0.7)) / 0.4);
      L.tittle.el.setAttribute('r', String(f2(Math.max(0, r0 * outBack(pt, 2.6)))));
      L.tittle.el.setAttribute('fill', mix(L.tittle.color, c.white, settle));
    }
  });
}

/** Desenha o loader dentro de `parent`. Devolve `skip` (pula pro final) e `destroy`. */
export function playLoader(parent: HTMLElement, o: LoaderOptions) {
  const speed = o.speed ?? 1;
  const hold = o.hold ?? 700;
  const S = build(o, parent);
  let raf = 0;
  let t0 = 0;
  let done = false;
  let holdTimer = 0;

  const finish = () => {
    if (done) return;
    done = true;
    cancelAnimationFrame(raf);
    render(S, o.colors, S.end + 0.4);
    holdTimer = window.setTimeout(o.onDone, hold);
  };

  const frame = (now: number) => {
    if (!t0) t0 = now;
    const t = ((now - t0) / 1000) * speed;
    if (t >= S.end) {
      finish();
      return;
    }
    render(S, o.colors, t);
    raf = requestAnimationFrame(frame);
  };

  render(S, o.colors, 0);
  raf = requestAnimationFrame(frame);

  return {
    /** Pula direto pro nome pronto (e daí pra saída, depois do hold). */
    skip() {
      if (done) return;
      done = true;
      cancelAnimationFrame(raf);
      render(S, o.colors, S.end + 0.4);
      holdTimer = window.setTimeout(o.onDone, 250);
    },
    destroy() {
      done = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(holdTimer);
      S.svg.remove();
    },
  };
}
