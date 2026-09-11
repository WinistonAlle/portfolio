import type { SVGProps } from 'react';

/* Moldura de totem de loja, para emoldurar print ou vídeo de projeto.
 *
 * Existe porque nenhuma das outras duas servia. A tela do MacbookPro é
 * deitada, e a do Iphone16Pro é 1:2,18 — mais estreita que os 9:16 do totem
 * de verdade, então a imagem entraria cortada nas laterais. Aqui a tela é
 * 198x352, que é 9:16 exato: a captura de 1080x1920 entra inteira, sem
 * recorte e sem faixa preta.
 *
 * Também não tem Dynamic Island, pelo motivo óbvio de que totem não é
 * telefone. O que o faz LER como totem é o pedestal: sem ele, um retângulo em
 * pé de moldura fina é indistinguível de um celular grande.
 *
 * Mesma convenção das outras molduras: coordenadas fixas no viewBox, o
 * tamanho vem do CSS do wrapper, e a tela vazia usa `currentColor` pra quem
 * chama decidir a cor pelo `text-*`.
 */

/* Geometria da tela dentro do viewBox 240x440, em porcentagem, para
   posicionar `screen` como HTML por cima do SVG (é o único jeito confiável de
   colocar um <video>, que não funciona dentro de <svg>). */
const SCREEN = {
  x: 21,
  y: 11,
  w: 198,
  h: 352,
  r: 6,
};

const PCT = {
  left: (SCREEN.x / 240) * 100,
  top: (SCREEN.y / 440) * 100,
  width: (SCREEN.w / 240) * 100,
  height: (SCREEN.h / 440) * 100,
  /* Raio em porcentagem resolve contra a largura no eixo x e contra a altura
     no eixo y, então um valor só num retângulo alto vira canto elíptico. A
     sintaxe `x% / y%` devolve as mesmas 6 unidades nos dois eixos. */
  radiusX: (SCREEN.r / SCREEN.w) * 100,
  radiusY: (SCREEN.r / SCREEN.h) * 100,
};

export interface TotemFrameProps extends SVGProps<SVGSVGElement> {
  width?: number;
  height?: number;
  /** Imagem exibida na tela, recortada nos cantos arredondados. */
  src?: string;
  /** Conteúdo livre por cima da tela (ex.: um <video>), no lugar de `src`. */
  screen?: React.ReactNode;
}

export function TotemFrame({
  width = 240,
  height = 440,
  src,
  screen,
  className,
  ...props
}: TotemFrameProps) {
  return (
    <div className={`relative ${className ?? ''}`}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 240 440"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="block h-auto w-full"
        {...props}
      >
        {/* Pedestal, desenhado ANTES do corpo pra passar por trás dele. */}
        <path fill="#1b1f27" d="M104 372h32v46h-32z" />
        <ellipse cx="120" cy="424" rx="62" ry="10" fill="#1b1f27" />
        <ellipse cx="120" cy="421" rx="62" ry="10" fill="#2a3039" />

        {/* Corpo: bisel fino em cima e nas laterais, faixa mais alta embaixo,
            que é onde totem costuma levar marca ou leitor. */}
        <rect x="10" y="0" width="220" height="385" rx="14" fill="#2a3039" />
        <rect x="12" y="2" width="216" height="381" rx="12" fill="#0e1116" />

        {/* Luz de topo: sem ela o corpo fica chapado e parece recorte de
            papel, e não um objeto com volume. */}
        <rect x="12" y="2" width="216" height="26" rx="12" fill="url(#totem-brilho)" />

        {/* Marca discreta na faixa de baixo. */}
        <rect x="104" y="369" width="32" height="4" rx="2" fill="#39414d" />

        {!screen && (
          <rect
            fill="currentColor"
            x={SCREEN.x}
            y={SCREEN.y}
            width={SCREEN.w}
            height={SCREEN.h}
            rx={SCREEN.r}
            ry={SCREEN.r}
          />
        )}

        {src && !screen && (
          <image
            href={src}
            x={SCREEN.x}
            y={SCREEN.y}
            width={SCREEN.w}
            height={SCREEN.h}
            preserveAspectRatio="xMidYMid slice"
            clipPath="url(#totem-tela)"
          />
        )}

        <defs>
          <linearGradient id="totem-brilho" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.07" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <clipPath id="totem-tela">
            <rect
              x={SCREEN.x}
              y={SCREEN.y}
              width={SCREEN.w}
              height={SCREEN.h}
              rx={SCREEN.r}
              ry={SCREEN.r}
            />
          </clipPath>
        </defs>
      </svg>

      {screen && (
        <div
          className="absolute overflow-hidden"
          style={{
            left: `${PCT.left}%`,
            top: `${PCT.top}%`,
            width: `${PCT.width}%`,
            height: `${PCT.height}%`,
            borderRadius: `${PCT.radiusX}% / ${PCT.radiusY}%`,
          }}
        >
          {screen}
        </div>
      )}
    </div>
  );
}
