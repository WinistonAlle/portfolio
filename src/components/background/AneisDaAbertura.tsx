'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import Salvaguarda3D from '@/components/3d/Salvaguarda3D';
import { temWebGL } from '@/lib/tem-webgl';

const MagicRings = dynamic(() => import('./MagicRings'), { ssr: false });

/* O fundo da abertura: anéis de luz atrás do notebook.
 *
 * É o único lugar do site com este efeito, de propósito. O resto das páginas
 * tem o campo de partículas; aqui, nos poucos segundos em que o MacBook gira e
 * a home cresce de dentro da tela dele, o fundo é outro. Os dois nunca rodam
 * juntos — ver `abertura.ts` para o porquê.
 *
 * Três decisões que valem registrar:
 *
 * - **Vive dentro do `.portal`**, e não no layout, porque lê `--p` (o
 *   progresso da abertura, escrito pelo JS a cada quadro). Os anéis somem
 *   conforme o notebook cresce: quando a tela dele vira a página inteira, um
 *   fundo animado por trás não seria mais fundo de nada.
 *
 * - **z-index 2**: acima do nada e abaixo da cena 3D do notebook (5) e do
 *   conteúdo do portal (20). Um passo acima e os anéis passariam na frente do
 *   laptop.
 *
 * - **Zero interação.** `hoverScale` em 1 e `parallax` em 0 fazem o MagicRings
 *   nem registrar ouvintes de ponteiro e aplicar `pointer-events: none`. Este
 *   site já teve canvas comendo o gesto de rolagem; fundo decorativo não
 *   disputa ponteiro com ninguém.
 */
export default function AneisDaAbertura() {
  const [podeWebGL, setPodeWebGL] = useState(false);
  useEffect(() => {
    setPodeWebGL(temWebGL());
  }, []);

  if (!podeWebGL) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0"
      style={{
        zIndex: 2,
        /* Some junto com a abertura. O `--p` vem do `.portal`, que é ancestral
           deste nó; a curva ao quadrado segura o brilho na primeira metade e
           tira nos últimos instantes, em vez de apagar linearmente desde o
           começo. */
        opacity: 'calc((1 - var(--p, 0)) * (1 - var(--p, 0)))',
        /* Os anéis são maiores que a tela, então as bordas os CORTAM: no lugar
           de arcos de luz, o olho lê duas faixas verticais com a ponta
           decepada. A máscara apaga justamente onde o corte aconteceria, e o
           que fica é o arco terminando por conta própria. */
        maskImage:
          'radial-gradient(88% 108% at 50% 45%, #000 22%, rgba(0,0,0,0.62) 66%, transparent 100%)',
        WebkitMaskImage:
          'radial-gradient(88% 108% at 50% 45%, #000 22%, rgba(0,0,0,0.62) 66%, transparent 100%)',
      }}
    >
      <Salvaguarda3D alternativa={null}>
        <MagicRings
          /* A paleta é a do site (azul #5b9cff) puxada para o violeta: precisa
             ler como "outro momento", não como "outro site". O magenta/ciano
             padrão do React Bits não tem relação com nada aqui. */
          color="#5b9cff"
          colorTwo="#a47bff"
          ringCount={7}
          /* Devagar: o assunto da tela é o notebook girando. Fundo que corre
             mais que o primeiro plano rouba o olho. */
          speed={0.55}
          attenuation={26}
          lineThickness={8}
          baseRadius={0.3}
          radiusStep={0.14}
          scaleRate={0.22}
          opacity={0.55}
          blur={14}
          noiseAmount={0}
          rotation={-12}
          ringGap={1.35}
          fadeIn={1.4}
          fadeOut={2.6}
          followMouse={false}
          hoverScale={1}
          parallax={0}
          clickBurst={false}
          /* O fundo do site é escuro, então o alfa por luminância é o modo
             certo: as linhas acendem em vez de recortar uma forma. */
          alphaMode="luminance"
          /* 1.5 e não 2: é fragmento puro em tela cheia, dividindo GPU com a
             cena 3D do notebook no momento mais pesado da home. */
          dprMax={1.5}
        />
      </Salvaguarda3D>
    </div>
  );
}
