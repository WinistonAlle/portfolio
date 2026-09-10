import type { SVGProps } from 'react';

/* Moldura de iPhone 16 Pro em SVG, para emoldurar um print (ou vídeo) de
 * projeto.
 *
 * Mesma lógica do MacbookPro: coordenadas fixas na faixa 0..200 x 0..400,
 * então redimensionar é via CSS (`className="w-full h-auto"` no wrapper),
 * não via width/height, que só desenquadrariam o desenho.
 *
 * A tela (retângulo 14.08,12.81 -> 186.06,387.18 no viewBox) é convertida em
 * porcentagem para posicionar `screen` fora do SVG, como HTML normal por
 * cima — é o único jeito de colocar um <video> (não dá pra usar <video>
 * dentro de <svg> de forma confiável entre navegadores).
 */
const SCREEN = {
  leftPct: (14.08 / 200) * 100,
  topPct: (12.81 / 400) * 100,
  widthPct: (171.98 / 200) * 100,
  heightPct: (374.37 / 400) * 100,
  /* Raio em porcentagem resolve contra a largura no eixo x e contra a altura
     no eixo y, então um valor só num retângulo alto vira canto elíptico,
     esticado na vertical, fora de registro com o recorte do SVG. A sintaxe
     `x% / y%` dá as mesmas 24.62 unidades nos dois eixos. */
  radiusXPct: (24.62 / 171.98) * 100,
  radiusYPct: (24.62 / 374.37) * 100,
};

export interface Iphone16ProProps extends SVGProps<SVGSVGElement> {
  width?: number;
  height?: number;
  /** Imagem exibida na tela, recortada nos cantos arredondados. */
  src?: string;
  /** Conteúdo livre por cima da tela (ex.: um <video>), no lugar de `src`. */
  screen?: React.ReactNode;
}

export function Iphone16Pro({
  width = 200,
  height = 400,
  src,
  screen,
  className,
  ...props
}: Iphone16ProProps) {
  return (
    <div className={`relative ${className ?? ''}`}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="block h-auto w-full"
        {...props}
      >
        <path
          fill="#303333"
          d="M196.11,128.09c0-.25-.2-.45-.45-.45-.11.04-.37.03-.69,0V36.69c0-17.84-14.46-32.31-32.31-32.31H37.48C19.63,4.39,5.17,18.85,5.17,36.69v48.99c-.3.02-.55.03-.66-.02-.25,0-.45.2-.45.45,0,0,0,17.29,0,17.29-.03.41.5.49,1.11.48v13.63c-.61,0-1.14.08-1.11.48,0,0,0,28.54,0,28.54-.03.42.5.49,1.11.48v7.95c-.61,0-1.14.08-1.11.48,0,0,0,28.54,0,28.54-.03.42.5.49,1.11.48v178.86c0,17.84,14.46,32.31,32.31,32.31h125.2c17.84,0,32.31-14.46,32.31-32.31v-188.87c.32-.02.58-.03.69.04,1.26.1.03-45.94.45-46.38ZM186.07,362.63c0,13.56-10.99,24.56-24.56,24.56H38.64c-13.56,0-24.56-10.99-24.56-24.56V37.37c0-13.56,10.99-24.56,24.56-24.56h122.87c13.56,0,24.56,10.99,24.56,24.56v325.26Z"
        />
        <path
          fill="#000000"
          d="M161.38,7.29H38.78c-16.54,0-29.95,13.41-29.95,29.95v325.52c0,16.54,13.41,29.95,29.95,29.95h122.6c16.54,0,29.95-13.41,29.95-29.95V37.24c0-16.54-13.41-29.95-29.95-29.95ZM186.07,362.57c0,13.6-11.02,24.62-24.62,24.62H38.7c-13.6,0-24.62-11.02-24.62-24.62V37.43c0-13.6,11.02-24.62,24.62-24.62h122.75c13.6,0,24.62,11.02,24.62,24.62v325.14Z"
        />
        {!screen && (
          <rect
            fill="currentColor"
            x="14.08"
            y="12.81"
            width="171.98"
            height="374.37"
            rx="24.62"
            ry="24.62"
          />
        )}
        {src && !screen && (
          <image
            href={src}
            x="14.08"
            y="12.81"
            width="171.98"
            height="374.37"
            preserveAspectRatio="xMidYMid slice"
            clipPath="url(#iphone16pro-rounded-corners)"
          />
        )}
        {!screen && (
          <>
            <path
              fill="#000000"
              d="M119.61,33.86h-38.93c-10.48-.18-10.5-15.78,0-15.96,0,0,38.93,0,38.93,0,4.41,0,7.98,3.57,7.98,7.98,0,4.41-3.57,7.98-7.98,7.98Z"
            />
            <path
              fill="#080d4c"
              d="M118.78,29.21c-4.32.06-4.32-6.73,0-6.66,4.32-.06,4.32,6.73,0,6.66Z"
            />
          </>
        )}
        <defs>
          <clipPath id="iphone16pro-rounded-corners">
            <rect
              x="14.08"
              y="12.81"
              width="171.98"
              height="374.37"
              rx="24.62"
              ry="24.62"
            />
          </clipPath>
        </defs>
      </svg>

      {screen && (
        <>
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

          {/* Dynamic Island: some coberta pelo screen (ele fica por cima na
              pilha do DOM), então repete o recorte aqui, acima de tudo. */}
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="pointer-events-none absolute inset-0 block h-full w-full"
          >
            <path
              fill="#000000"
              d="M119.61,33.86h-38.93c-10.48-.18-10.5-15.78,0-15.96,0,0,38.93,0,38.93,0,4.41,0,7.98,3.57,7.98,7.98,0,4.41-3.57,7.98-7.98,7.98Z"
            />
            <path
              fill="#080d4c"
              d="M118.78,29.21c-4.32.06-4.32-6.73,0-6.66,4.32-.06,4.32,6.73,0,6.66Z"
            />
          </svg>
        </>
      )}
    </div>
  );
}
