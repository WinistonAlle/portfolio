/* Motor do brilho dos SpecularButton, em CSS em vez de WebGL.

   Antes cada botão abria o PRÓPRIO contexto WebGL e redesenhava a cada quadro.
   Com 17 botões espalhados pelo site, a home chegava a ter mais contextos do
   que o Chrome aceita ao mesmo tempo (uns 16): ele derruba os mais antigos, e
   quem perde o contexto (o fundo de partículas, a cena do MacBook) precisa
   recriar tudo, o que dá travada. Somava ainda um redesenho por botão por
   quadro na GPU.

   Agora o brilho é um conic-gradient recortado no formato da borda
   (SpecularButton.css), e este módulo só escreve duas variáveis CSS por botão:
   o ângulo da luz e o brilho. Um laço só, compartilhado, e que só roda
   enquanto algum botão está na tela. */

import type { RefObject } from 'react';

export type SpecularProps = {
  radius: number;
  lineColor: string;
  baseColor: string;
  intensity: number;
  shineSize: number;
  shineFade: number;
  thickness: number;
  speed: number;
  followMouse: boolean;
  proximity: number;
  autoAnimate: boolean;
};

type Estado = {
  el: HTMLElement;
  props: RefObject<SpecularProps>;
  visivel: boolean;
  angulo: number;
  anguloOcioso: number;
  brilho: number;
  anguloPonteiro: number | null;
  proximidade: number;
  escrito: string;
};

const estados = new Set<Estado>();
let raf = 0;
let ultimo = 0;
let ouvindo = false;
let io: IntersectionObserver | null = null;
const reduzido = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Ângulo do shader (radianos, 0 = direita, anti-horário com y pra cima)
   para o conic-gradient (graus, 0 = em cima, horário). */
const paraCss = (rad: number) => 90 - (rad * 180) / Math.PI;

function escrever(s: Estado) {
  const p = s.props.current;
  const intensidade = Math.min(1, p.intensity * s.brilho);
  const chave = `${paraCss(s.angulo).toFixed(1)}|${intensidade.toFixed(3)}`;
  if (chave === s.escrito) return;
  s.escrito = chave;
  s.el.style.setProperty('--sb-angle', `${paraCss(s.angulo).toFixed(1)}deg`);
  s.el.style.setProperty('--sb-shine', intensidade.toFixed(3));
}

// A luz vira para o ponteiro (em qualquer ponto da página) quando ele chega perto.
function onPointerMove(e: PointerEvent) {
  for (const s of estados) {
    if (!s.visivel) continue;
    const rect = s.el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = Math.max(rect.left - e.clientX, 0, e.clientX - rect.right);
    const dy = Math.max(rect.top - e.clientY, 0, e.clientY - rect.bottom);
    const dist = Math.hypot(dx, dy);
    if (dist === 0) {
      // Em cima do botão a luz assenta na diagonal e balança com o cursor.
      const nx = (e.clientX - cx) / (rect.width / 2);
      const ny = (cy - e.clientY) / (rect.height / 2);
      s.anguloPonteiro = Math.atan2(2 / rect.height, -2 / rect.width) + nx * 0.3 + ny * 0.15;
    } else {
      s.anguloPonteiro = Math.atan2(cy - e.clientY, e.clientX - cx);
    }
    const t = Math.max(0, 1 - dist / Math.max(s.props.current.proximity, 1));
    s.proximidade = t * t * (3 - 2 * t);
  }
}

function quadro(agora: number) {
  raf = 0;
  const dt = Math.min((agora - ultimo) / 1000, 0.05);
  ultimo = agora;
  let algumVisivel = false;
  for (const s of estados) {
    if (!s.visivel) continue;
    algumVisivel = true;
    const p = s.props.current;
    s.anguloOcioso += p.speed * dt;
    const segue = p.followMouse && s.anguloPonteiro != null && (!p.autoAnimate || s.proximidade > 0);
    const alvo = segue ? s.anguloPonteiro! : s.anguloOcioso;
    const diff = ((alvo - s.angulo + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
    s.angulo += diff * (1 - Math.exp(-dt * 7));
    const alvoBrilho = p.autoAnimate ? 1 : s.proximidade;
    s.brilho += (alvoBrilho - s.brilho) * (1 - Math.exp(-dt * 8));
    escrever(s);
  }
  if (algumVisivel) raf = requestAnimationFrame(quadro);
}

function acordar() {
  if (raf || reduzido()) return;
  ultimo = performance.now();
  raf = requestAnimationFrame(quadro);
}

/** Liga o brilho de um botão. Devolve a função de desligar. */
export function registrar(el: HTMLElement, props: RefObject<SpecularProps>) {
  const s: Estado = {
    el,
    props,
    visivel: false,
    angulo: 2.4,
    anguloOcioso: 2.4,
    brilho: props.current.autoAnimate ? 1 : 0,
    anguloPonteiro: null,
    proximidade: 0,
    escrito: '',
  };
  estados.add(s);
  escrever(s);

  // Quem pediu menos movimento recebe a borda acesa e parada.
  if (reduzido()) {
    s.brilho = 1;
    escrever(s);
    return () => {
      estados.delete(s);
    };
  }

  if (!ouvindo) {
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    ouvindo = true;
  }
  io ??= new IntersectionObserver((entries) => {
    for (const entry of entries) {
      for (const st of estados) if (st.el === entry.target) st.visivel = entry.isIntersecting;
    }
    acordar();
  });
  io.observe(el);

  return () => {
    estados.delete(s);
    io?.unobserve(el);
    if (!estados.size && ouvindo) {
      window.removeEventListener('pointermove', onPointerMove);
      ouvindo = false;
    }
  };
}
