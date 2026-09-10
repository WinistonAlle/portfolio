import type { SVGProps } from 'react';

/* Moldura de MacBook Pro em SVG, para emoldurar um print (ou vídeo) de
 * projeto.
 *
 * O desenho tem coordenadas fixas na faixa 0..650 x 0..400, e o componente
 * monta o viewBox a partir de `width`/`height`. Ou seja: passar outro tamanho
 * aqui não amplia o desenho, desenquadra ele. Para redimensionar, deixe os
 * valores padrão e use CSS (`className="w-full h-auto"`), que sobrescreve os
 * atributos e mantém o viewBox correto.
 *
 * A tela (retângulo 74.52,21.32 -> 575.74,345.17 no viewBox) é convertida em
 * porcentagem para posicionar `screen` fora do SVG, como HTML normal por
 * cima. Mesma solução do Iphone16Pro, e pelo mesmo motivo: <video> dentro de
 * <svg> não é confiável entre navegadores.
 */
const SCREEN = {
  leftPct: (74.52 / 650) * 100,
  topPct: (21.32 / 400) * 100,
  widthPct: (501.22 / 650) * 100,
  heightPct: (323.85 / 400) * 100,
  /* Raio em porcentagem resolve contra a largura no eixo x e contra a altura
     no eixo y. A sintaxe `x% / y%` dá as mesmas 5 unidades nos dois eixos,
     em registro com o rx/ry do clipPath do SVG. */
  radiusXPct: (5 / 501.22) * 100,
  radiusYPct: (5 / 323.85) * 100,
};

export interface MacbookProProps extends SVGProps<SVGSVGElement> {
  width?: number;
  height?: number;
  /** Imagem exibida na tela, recortada nos cantos arredondados. */
  src?: string;
  /** Conteúdo livre por cima da tela (ex.: um <video>), no lugar de `src`. */
  screen?: React.ReactNode;
}

export function MacbookPro({
  width = 650,
  height = 400,
  src,
  screen,
  className,
  ...props
}: MacbookProProps) {
  /* Sem `screen` não existe wrapper: o `className` continua indo direto no
     <svg>, como sempre foi. A home depende disso, porque a classe que ela
     passa (`.portal__frame`) é `position: fixed`, e o `relative` do wrapper
     brigaria com ela. */
  const frame = (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={screen ? 'block h-auto w-full' : className}
      {...props}
    >
      <path
        fill="#a4a5a7"
        d="M79.56,13.18h491.32c7.23,0,13.1,5.87,13.1,13.1v336.61H66.46V26.28c0-7.23,5.87-13.1,13.1-13.1Z"
      />

      <path
        fill="#222"
        d="M79.96,14.24h490.45c6.83,0,12.37,5.54,12.37,12.37v336.28H67.59V26.6c0-6.83,5.54-12.37,12.37-12.37Z"
      />

      <path
        fill="#000"
        d="M570.25,15.74H80.34c-6.12,0-11.08,4.96-11.08,11.08v336.07h512.08V26.82c0-6.12-4.96-11.08-11.08-11.08ZM575.74,345.17H74.52V27.31c0-3.31,2.68-5.99,5.99-5.99h489.24c3.31,0,5.99,2.68,5.99,5.99v317.86Z"
      />
      {!screen && (
        <rect
          fill="currentColor"
          x="74.52"
          y="21.32"
          width="501.22"
          rx="5"
          ry="5"
          height="323.85"
        />
      )}
      {src && !screen && (
        <image
          href={src}
          x="74.52"
          y="21.32"
          width="501.22"
          height="323.85"
          preserveAspectRatio="xMidYMid slice"
          clipPath="url(#roundedCorners)"
        />
      )}
      <rect fill="#1d1d1d" x="69.09" y="350.51" width="512.11" height="12.48" />

      <path
        fill="#000"
        d="M298.14,21.02h54.07v6.5c0,1.56-1.27,2.82-2.82,2.82h-48.42c-1.56,0-2.82-1.27-2.82-2.82v-6.5h0Z"
      />
      <path
        fill="#acadaf"
        d="M19.04,362.77h611.92v10.39c0,5.95-4.83,10.79-10.79,10.79H29.83c-5.95,0-10.79-4.83-10.79-10.79v-10.39h0Z"
      />

      <path
        fill="#080d4c"
        d="M325.11,25.14c-1.99.03-1.99-3.09,0-3.06,1.99-.03,1.99,3.09,0,3.06Z"
      />

      <polygon
        fill="#b9b9bb"
        points="600.06 385.39 567.29 385.39 565.84 383.95 601.82 383.95 600.06 385.39"
      />
      <polygon
        fill="#292929"
        points="598.73 386.82 568.64 386.82 567.32 385.39 600.35 385.39 598.73 386.82"
      />
      <polygon
        fill="#b9b9bb"
        points="82.64 385.39 49.87 385.39 48.43 383.95 84.41 383.95 82.64 385.39"
      />
      <polygon
        fill="#292929"
        points="81.31 386.82 51.23 386.82 49.9 385.39 82.93 385.39 81.31 386.82"
      />
      <path
        fill="#8f9091"
        d="M278.11,362.6h94.05c0,3.63-2.95,6.58-6.58,6.58h-80.89c-3.63,0-6.58-2.95-6.58-6.58h0Z"
      />

      <defs>
        <clipPath id="roundedCorners">
          <rect
            fill="#ffffff"
            x="74.52"
            y="21.32"
            width="501.22"
            height="323.85"
            rx="5"
            ry="5"
          />
        </clipPath>
      </defs>
    </svg>
  );

  if (!screen) return frame;

  return (
    <div className={`relative ${className ?? ''}`}>
      {frame}
      <div
        className="absolute overflow-hidden"
        style={{
          left: `${SCREEN.leftPct}%`,
          top: `${SCREEN.topPct}%`,
          width: `${SCREEN.widthPct}%`,
          height: `${SCREEN.heightPct}%`,
          borderRadius: `${SCREEN.radiusXPct}% / ${SCREEN.radiusYPct}%`,
        }}
      >
        {screen}
      </div>
    </div>
  );
}

export default MacbookPro;
