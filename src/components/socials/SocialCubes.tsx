/* Cubos isométricos com os canais de contato: cada um levanta e acende na cor
 * da marca no hover.
 *
 * Geometria: um cubo é três losangos/paralelogramos desenhados à mão a partir
 * do vértice esquerdo do topo (lx, ly). Com S de lado, o topo em isométrico
 * fica com meia largura W = 0.866*S e meia altura H = 0.5*S, então os quatro
 * vértices do topo são esquerda (lx, ly), topo (lx+W, ly-H), direita
 * (lx+2W, ly) e base (lx+W, ly+H).
 *
 * O glifo não é redesenhado torto na mão: ele é um ícone normal, em viewBox
 * 24x24, dentro de um <g> com a matriz isométrica. Quem inclina é o
 * navegador, então trocar um ícone é trocar uma string.
 *
 * Empilhamento: SVG não tem z-index, quem vem depois pinta por cima. A fila
 * de baixo é a que está na frente, então ela é renderizada por último.
 */

import { SOCIALS } from '@/data/socials';

/** Lado do quadrado do topo, antes de inclinar. */
const S = 46;
const W = 0.866025 * S;
const H = 0.5 * S;
/** Altura do corpo do cubo. */
const BODY = 30;
/** Sobra em volta do glifo dentro da face de cima. */
const PAD = 12;
/** O quanto o cubo sobe no hover. */
const LIFT = 14;

/* Afastamento entre cubos. Em 1 eles se encaixam como ladrilho, dividindo as
   arestas e virando um mosaico plano; acima disso cada cubo volta a ser um
   objeto solto, que é o que dá a leitura de peças empilhadas. */
const GAP = 1.5;
const DX = W * GAP;
const DY = H * GAP;

/* Desenha um W, que é a inicial do nome: os ímpares ficam em cima (os três
   picos: pontas e meio) e os pares descem meia célula (os dois vales).
   Invertido, com dois picos no meio, isso vira um M, que foi como nasceu.

   A ordem dos cubos é a ordem do SOCIALS, e as posições vão da esquerda para
   a direita, então trocar a ordem lá troca a ordem lida aqui. */
const POSITIONS = [
  { lx: 0, ly: 0 }, // pico
  { lx: DX, ly: DY }, // vale
  { lx: 2 * DX, ly: 0 }, // pico
  { lx: 3 * DX, ly: DY }, // vale
  { lx: 4 * DX, ly: 0 }, // pico
];

/* viewBox medido a partir das posições, não escrito na mão: mexer no GAP ou
   no arranjo não pode cortar cubo nenhum. O topo abre espaço para o pulo do
   hover, que sai da caixa por cima. */
const MIN_Y = Math.min(...POSITIONS.map((p) => p.ly - H)) - LIFT;
const MAX_Y = Math.max(...POSITIONS.map((p) => p.ly + H + BODY));
const MAX_X = Math.max(...POSITIONS.map((p) => p.lx + 2 * W));

function Cube({
  social,
  lx,
  ly,
}: {
  social: (typeof SOCIALS)[number];
  lx: number;
  ly: number;
}) {
  const top = `M${lx},${ly} L${lx + W},${ly - H} L${lx + 2 * W},${ly} L${lx + W},${ly + H} Z`;
  const left = `M${lx},${ly} L${lx},${ly + BODY} L${lx + W},${ly + H + BODY} L${lx + W},${ly + H} Z`;
  const right = `M${lx + W},${ly + H} L${lx + W},${ly + H + BODY} L${lx + 2 * W},${ly + BODY} L${lx + 2 * W},${ly} Z`;

  const glyph = S - PAD * 2;

  return (
    <a
      href={social.href}
      target={social.href.startsWith('http') ? '_blank' : undefined}
      rel={social.href.startsWith('http') ? 'noreferrer' : undefined}
      className="cube"
      style={{ '--brand': social.color } as React.CSSProperties}
      aria-label={social.label}
    >
      <path className="cube__face cube__face--left" d={left} />
      <path className="cube__face cube__face--right" d={right} />
      <path className="cube__top" d={top} />

      {/* Moldura arredondada na face de cima, no espaço inclinado. */}
      <g transform={`matrix(0.866025 -0.5 0.866025 0.5 ${lx} ${ly})`}>
        <rect
          className="cube__plate"
          x={PAD * 0.55}
          y={PAD * 0.55}
          width={S - PAD * 1.1}
          height={S - PAD * 1.1}
          rx={4}
        />
        <g
          transform={`translate(${PAD} ${PAD}) scale(${glyph / 24})`}
          className="cube__glyph"
        >
          <path d={social.path} />
        </g>
      </g>
    </a>
  );
}

export default function SocialCubes() {
  const cubes = SOCIALS.map((social, i) => ({ social, ...POSITIONS[i] }));
  /* Fila de cima primeiro (ly menor), para a de baixo pintar por cima. */
  const ordenados = [...cubes].sort((a, b) => a.ly - b.ly);

  return (
    <svg
      className="social-cubes"
      viewBox={`0 ${MIN_Y} ${MAX_X} ${MAX_Y - MIN_Y}`}
      role="list"
      aria-label="Canais de contato"
    >
      <defs>
        <linearGradient id="social-instagram" x1="0" y1="1" x2="0.4" y2="0">
          <stop offset="0%" stopColor="#f09433" />
          <stop offset="25%" stopColor="#e6683c" />
          <stop offset="50%" stopColor="#dc2743" />
          <stop offset="75%" stopColor="#cc2366" />
          <stop offset="100%" stopColor="#bc1888" />
        </linearGradient>
      </defs>

      {ordenados.map(({ social, lx, ly }) => (
        <Cube key={social.id} social={social} lx={lx} ly={ly} />
      ))}
    </svg>
  );
}
