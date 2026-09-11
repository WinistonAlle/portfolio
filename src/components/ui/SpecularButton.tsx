'use client';

import {
  useRef,
  useEffect,
  type ReactNode,
  type MouseEventHandler,
} from 'react';
import { Renderer, Program, Mesh, Triangle, Color } from 'ogl';
import TransitionLink from '@/components/transition/TransitionLink';
import './SpecularButton.css';

/* Botão de vidro com brilho especular na borda (React Bits, variante
 * JavaScript + CSS), portado para TypeScript com duas mudanças que este
 * projeto exigiu:
 *
 * 1. Polimórfico. O original é sempre <button>, e aqui os três usos são
 *    links: dois externos e um interno. Como <button>, eles perderiam abrir
 *    em nova aba, cmd-clique e o papel de link no leitor de tela. Com `href`
 *    ele vira <a>; com `href` interno, vira TransitionLink, e a navegação
 *    continua passando pela cortina de pixels.
 * 2. Respeita `prefers-reduced-motion`. Quem desligou animação recebe um
 *    quadro parado com a borda acesa, e o requestAnimationFrame nunca começa.
 *
 * Cada instância abre o seu próprio contexto WebGL, então vale contar quantos
 * existem por página antes de espalhar o componente.
 */

const PAD = 20;

const VERT = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = `#version 300 es
precision highp float;

uniform vec2 uCenter;
uniform vec2 uHalfSize;
uniform float uRadius;
uniform float uAngle;
uniform float uPx;
uniform vec3 uLineColor;
uniform vec3 uBaseColor;
uniform float uIntensity;
uniform float uShineSize;
uniform float uShineFade;
uniform float uThickness;
uniform float uBaseWidth;

out vec4 fragColor;

float sdRoundedRect(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

float shapeSDF(vec2 p) { return sdRoundedRect(p, uHalfSize, uRadius); }

float gaussianLine(float d, float sigma) {
  float x = d / (sigma + 1e-6);
  float k = mix(1.0, 1.6, smoothstep(0.0, 1.5, x));
  return exp(-k * x * x);
}

void main() {
  vec2 p = gl_FragCoord.xy - uCenter;
  float d = shapeSDF(p);
  vec2 L = vec2(cos(uAngle), sin(uAngle));

  // Dark base stroke hugging the edge for a sense of thickness
  float base = (1.0 - smoothstep(0.0, uBaseWidth, abs(d))) * 0.45;

  // Symmetric specular: the edges facing toward/away from the light both
  // catch a streak. The angular window (size + fade) is measured with an
  // elliptical normal so it varies continuously along straight edges.
  vec2 nEll = normalize(p / (uHalfSize * uHalfSize) + 1e-6);
  float phi = acos(clamp(abs(dot(nEll, L)), 0.0, 1.0));
  float rim = 1.0 - smoothstep(uShineSize - uShineFade, uShineSize + uShineFade + 1e-4, phi);
  float line = gaussianLine(d, uThickness);
  float edgeClamp = 1.0 - smoothstep(0.5 * uPx, 3.0 * uPx, abs(d));
  float hi = line * rim * edgeClamp * uIntensity;

  vec3 col = uBaseColor * base + uLineColor * hi;
  float a = clamp(base + hi, 0.0, 1.0);
  fragColor = vec4(col, a);
}
`;

type SpecularButtonProps = {
  children?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  radius?: number;
  tint?: string;
  tintOpacity?: number;
  blur?: number;
  textColor?: string;
  lineColor?: string;
  baseColor?: string;
  intensity?: number;
  shineSize?: number;
  shineFade?: number;
  thickness?: number;
  speed?: number;
  followMouse?: boolean;
  proximity?: number;
  autoAnimate?: boolean;
  disabled?: boolean;
  onClick?: MouseEventHandler;
  className?: string;
  /* Repassados explicitamente porque botão só de ícone não tem texto: sem
     `aria-label` ele é anunciado como "botão" e mais nada. */
  'aria-label'?: string;
  'aria-expanded'?: boolean;
  title?: string;
  type?: 'button' | 'submit' | 'reset';
  /** Com `href` o componente vira link em vez de <button>. */
  href?: string;
  /** Link externo: abre em nova aba e não passa pela transição de página. */
  external?: boolean;
};

export default function SpecularButton({
  children = 'Get Started',
  size = 'lg',
  radius = 18,
  tint = '#ffffff',
  tintOpacity = 0,
  blur = 0,
  textColor = '#f5f5f5',
  lineColor = '#ffffff',
  baseColor = '#525252',
  intensity = 1,
  shineSize = 10,
  shineFade = 40,
  thickness = 1,
  speed = 0.35,
  followMouse = true,
  proximity = 250,
  autoAnimate = false,
  disabled = false,
  onClick,
  className = '',
  'aria-label': ariaLabel,
  'aria-expanded': ariaExpanded,
  title,
  type = 'button',
  href,
  external = false,
}: SpecularButtonProps) {
  const btnRef = useRef<HTMLElement>(null);
  const fxRef = useRef<HTMLSpanElement>(null);
  const propsRef = useRef({
    radius,
    lineColor,
    baseColor,
    intensity,
    shineSize,
    shineFade,
    thickness,
    speed,
    followMouse,
    proximity,
    autoAnimate,
  });

  /* Espelho das props pro loop de animação ler sempre o valor mais novo sem
     precisar recriar o contexto WebGL a cada mudança de cor ou velocidade.
     O original escrevia no ref durante o render; aqui vai num efeito, que é
     onde a regra dos hooks permite, e o loop só lê no quadro seguinte de
     qualquer jeito. */
  useEffect(() => {
    propsRef.current = {
      radius,
      lineColor,
      baseColor,
      intensity,
      shineSize,
      shineFade,
      thickness,
      speed,
      followMouse,
      proximity,
      autoAnimate,
    };
  });

  useEffect(() => {
    const btn = btnRef.current;
    const fx = fxRef.current;
    if (!btn || !fx) return;

    const dpr = window.devicePixelRatio || 1;

    /* Se o WebGL não estiver disponível (contexto esgotado, driver bloqueado),
       o botão continua sendo um botão: só fica sem o brilho. */
    let renderer: Renderer;
    try {
      renderer = new Renderer({
        alpha: true,
        premultipliedAlpha: true,
        antialias: true,
        dpr,
      });
    } catch {
      return;
    }

    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const geometry = new Triangle(gl);
    if (geometry.attributes.uv) delete geometry.attributes.uv;

    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uCenter: { value: [0, 0] },
        uHalfSize: { value: [1, 1] },
        uRadius: { value: 0 },
        uAngle: { value: 2.4 },
        uPx: { value: dpr },
        uLineColor: { value: [1, 1, 1] },
        uBaseColor: { value: [0.32, 0.32, 0.32] },
        uIntensity: { value: 1 },
        uShineSize: { value: 0.17 },
        uShineFade: { value: 0.7 },
        uThickness: { value: 1 },
        uBaseWidth: { value: dpr },
      },
    });

    const mesh = new Mesh(gl, { geometry, program });
    fx.appendChild(gl.canvas);

    const sizeRef = { w: 1, h: 1 };
    /* O tamanho tem que vir do border box em pixels CSS, e não de
       `getBoundingClientRect()`. O rect já vem multiplicado pelo `transform`
       de qualquer ancestral, enquanto o canvas é posicionado em unidades CSS
       (`inset: -20px`), então dentro de um pai escalado os dois discordam e o
       brilho aparece deslocado e com o tamanho errado. Foi o que quebrou os
       botões da home, que abrem dentro do zoom do portal do MacBook.

       `borderBoxSize` do ResizeObserver dá justamente isso, e ainda com
       precisão fracionária; `offsetWidth` é o retorno para a primeira medida,
       antes de existir uma entry. */
    const resize = (entry?: ResizeObserverEntry) => {
      const box = entry?.borderBoxSize?.[0];
      const w = box ? box.inlineSize : btn.offsetWidth;
      const h = box ? box.blockSize : btn.offsetHeight;
      if (!w || !h) return;
      sizeRef.w = w;
      sizeRef.h = h;
      renderer.setSize(w + PAD * 2, h + PAD * 2);
      program.uniforms.uCenter.value = [
        (PAD + w / 2) * dpr,
        (PAD + h / 2) * dpr,
      ];
      program.uniforms.uHalfSize.value = [(w / 2) * dpr, (h / 2) * dpr];
    };
    const ro = new ResizeObserver(([entry]) => resize(entry));
    ro.observe(btn);
    resize();

    const lineC = new Color();
    const baseC = new Color();

    /* Quem pediu menos movimento recebe a borda acesa e parada: um quadro só,
       sem loop e sem seguir o cursor. */
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduced.matches) {
      const p = propsRef.current;
      lineC.set(p.lineColor);
      baseC.set(p.baseColor);
      program.uniforms.uAngle.value = 2.4;
      program.uniforms.uRadius.value =
        Math.min(p.radius, Math.min(sizeRef.w, sizeRef.h) / 2) * dpr;
      program.uniforms.uLineColor.value = [lineC.r, lineC.g, lineC.b];
      program.uniforms.uBaseColor.value = [baseC.r, baseC.g, baseC.b];
      program.uniforms.uIntensity.value = p.intensity;
      program.uniforms.uShineSize.value = (p.shineSize * Math.PI) / 180;
      program.uniforms.uShineFade.value = (p.shineFade * Math.PI) / 180;
      program.uniforms.uThickness.value = p.thickness * dpr;
      renderer.render({ scene: mesh });

      return () => {
        ro.disconnect();
        if (gl.canvas.parentNode === fx) fx.removeChild(gl.canvas);
        gl.getExtension('WEBGL_lose_context')?.loseContext();
      };
    }

    // Light angle steers toward the pointer (anywhere on the page) and falls
    // back to a slow sweep when the pointer hasn't moved yet.
    let pointerAngle: number | null = null;
    let proximityT = 0;
    const onPointerMove = (e: PointerEvent) => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = Math.max(rect.left - e.clientX, 0, e.clientX - rect.right);
      const dy = Math.max(rect.top - e.clientY, 0, e.clientY - rect.bottom);
      const dist = Math.hypot(dx, dy);
      // Over the button itself the light settles on the diagonal (framing the
      // corners) and gently sways with the cursor position within the button.
      if (dist === 0) {
        const nx = (e.clientX - cx) / (rect.width / 2);
        const ny = (cy - e.clientY) / (rect.height / 2);
        pointerAngle =
          Math.atan2(2 / rect.height, -2 / rect.width) + nx * 0.3 + ny * 0.15;
      } else {
        pointerAngle = Math.atan2(cy - e.clientY, e.clientX - cx);
      }
      const t = Math.max(0, 1 - dist / Math.max(propsRef.current.proximity, 1));
      proximityT = t * t * (3 - 2 * t);
    };
    window.addEventListener('pointermove', onPointerMove);

    let angle = 2.4;
    let idleAngle = 2.4;
    let bright = 0;
    let last = performance.now();
    let raf = 0;
    let visible = false;

    const update = (now: number) => {
      raf = visible ? requestAnimationFrame(update) : 0;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const p = propsRef.current;

      idleAngle += p.speed * dt;
      const steer =
        p.followMouse &&
        pointerAngle != null &&
        (!p.autoAnimate || proximityT > 0);
      const target = steer ? pointerAngle! : idleAngle;
      const diff = ((target - angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
      angle += diff * (1 - Math.exp(-dt * 7));

      // Shine fades in with pointer proximity unless autoAnimate keeps it on
      const brightTarget = p.autoAnimate ? 1 : proximityT;
      bright += (brightTarget - bright) * (1 - Math.exp(-dt * 8));

      lineC.set(p.lineColor);
      baseC.set(p.baseColor);
      program.uniforms.uAngle.value = angle;
      program.uniforms.uRadius.value =
        Math.min(p.radius, Math.min(sizeRef.w, sizeRef.h) / 2) * dpr;
      program.uniforms.uLineColor.value = [lineC.r, lineC.g, lineC.b];
      program.uniforms.uBaseColor.value = [baseC.r, baseC.g, baseC.b];
      program.uniforms.uIntensity.value = p.intensity * bright;
      program.uniforms.uShineSize.value = (p.shineSize * Math.PI) / 180;
      program.uniforms.uShineFade.value = (p.shineFade * Math.PI) / 180;
      program.uniforms.uThickness.value = p.thickness * dpr;
      renderer.render({ scene: mesh });
    };
    /* O loop só roda enquanto o botão está na tela. Sem isso, uma página com
       vários desses mantém um requestAnimationFrame por botão girando o tempo
       todo, inclusive nos que estão a três rolagens de distância. Ao voltar, o
       `last` é rearmado para o dt não vir com o tamanho da ausência e fazer o
       brilho pular de posição. */
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(update);
      } else if (!visible && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    });
    io.observe(btn);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      if (gl.canvas.parentNode === fx) fx.removeChild(gl.canvas);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, []);

  const style = {
    '--sb-radius': `${radius}px`,
    '--sb-tint': tint,
    '--sb-tint-opacity': tintOpacity,
    '--sb-blur': `${blur}px`,
    '--sb-text-color': textColor,
  } as React.CSSProperties;

  const classes = `specular-button specular-button--${size}${className ? ` ${className}` : ''}`;

  const inner = (
    <>
      <span ref={fxRef} className="specular-button__fx" aria-hidden="true" />
      <span className="specular-button__label">{children}</span>
    </>
  );

  if (href && external) {
    return (
      <a
        ref={btnRef as React.Ref<HTMLAnchorElement>}
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        onClick={onClick as MouseEventHandler<HTMLAnchorElement>}
        className={classes}
        style={style}
      >
        {inner}
      </a>
    );
  }

  if (href) {
    return (
      <TransitionLink
        ref={btnRef as React.Ref<HTMLAnchorElement>}
        href={href}
        onClick={onClick as MouseEventHandler<HTMLAnchorElement>}
        className={classes}
        style={style}
      >
        {inner}
      </TransitionLink>
    );
  }

  return (
    <button
      ref={btnRef as React.Ref<HTMLButtonElement>}
      type={type}
      disabled={disabled}
      onClick={onClick as MouseEventHandler<HTMLButtonElement>}
      aria-label={ariaLabel}
      aria-expanded={ariaExpanded}
      title={title}
      className={classes}
      style={style}
    >
      {inner}
    </button>
  );
}
