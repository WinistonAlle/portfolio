'use client';

import {
  useRef,
  useEffect,
  type ReactNode,
  type MouseEventHandler,
} from 'react';
import TransitionLink from '@/components/transition/TransitionLink';
import { registrar } from './specular-engine';
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
 * 3. Sem WebGL. O original abre um contexto WebGL por botão; aqui o brilho é
 *    um conic-gradient recortado na borda, animado por um laço compartilhado
 *    (specular-engine.ts). Com 17 botões no site, contexto por botão passava
 *    do limite do navegador e fazia outras cenas 3D perderem o delas.
 */


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
    if (!btn) return;
    return registrar(btn, propsRef);
  }, []);

  const style = {
    '--sb-radius': `${radius}px`,
    '--sb-tint': tint,
    '--sb-tint-opacity': tintOpacity,
    '--sb-blur': `${blur}px`,
    '--sb-text-color': textColor,
    /* O brilho da borda: cor da linha, aro de base, largura e abertura do
       reflexo. Ângulo e intensidade são escritos pelo specular-engine. */
    '--sb-line': lineColor,
    '--sb-base': baseColor,
    '--sb-thickness': `${thickness}px`,
    '--sb-spread': `${shineSize + shineFade}deg`,
  } as React.CSSProperties;

  const classes = `specular-button specular-button--${size}${className ? ` ${className}` : ''}`;

  const inner = (
    <>
      <span className="specular-button__fx" aria-hidden="true" />
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
