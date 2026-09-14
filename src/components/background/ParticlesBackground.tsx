'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import Salvaguarda3D from '@/components/3d/Salvaguarda3D';
import { temWebGL } from '@/lib/tem-webgl';

const Particles = dynamic(() => import('./Particles'), { ssr: false });

// Module constant: a fresh array each render would tear down and rebuild the
// whole WebGL context on every re-render.
const COLORS = ['#5b9cff', '#9dc0ff', '#f3f6ff'];

export default function ParticlesBackground() {
  /* Este é o componente MAIS PERIGOSO do site, e não parece.
   *
   * Ele vive no layout raiz, ou seja, em TODA página, e desenha com OGL. A
   * `Renderer` da OGL, quando o navegador recusa o contexto, faz isto:
   *
   *     this.gl || console.error("unable to create webgl context"),
   *     this.gl.renderer = this
   *
   * Ela avisa que falhou e escreve na variável nula na linha seguinte. O
   * `TypeError` sobe de dentro de um efeito, o React desmonta a árvore e a
   * pessoa recebe uma página em branco — em todas as rotas, não só nas que
   * têm 3D. Foi isso que o amigo do usuário viu no Windows, no Chrome e no
   * Opera: os dois são Chromium, e o que uma máquina tem em comum entre eles
   * é a lista de bloqueio de GPU.
   *
   * O fundo de partículas é enfeite. Sem ele o site é o mesmo site. */
  const [podeWebGL, setPodeWebGL] = useState(false);
  useEffect(() => {
    setPodeWebGL(temWebGL());
  }, []);

  if (!podeWebGL) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        // The layer is fixed, so this fade is viewport-relative: the field is
        // always densest near the top of the screen and quiets toward the fold.
        maskImage:
          'linear-gradient(to bottom, #000 0%, #000 55%, rgba(0,0,0,0.25) 100%)',
      }}
    >
      {/* scrollParallaxCap: uncapped, 2.4 units of drift per viewport walked
          the field clean out of frame within three screens, so the bottom of a
          long page scrolled over an empty background.

          The ceiling has to be read against what the camera sees, not against
          the size of the field: fov 15 at distance 22 is a band of only ±2.9
          world units at z=0, and the particles that carry the look are the
          near ones, inside that band. Measured on /sobre-mim, the field still
          renders normally at 3.6 units of drift and is completely gone by 4.2.
          2.6 keeps it inside the proven range with room to spare, and still
          slides the field by most of a half-screen, so the parallax reads. */}
      <Salvaguarda3D alternativa={null}>
        <Particles
          particleCount={260}
          particleSpread={13}
          speed={0.08}
          particleColors={COLORS}
          particleBaseSize={78}
          sizeRandomness={1}
          alphaParticles
          moveParticlesOnHover
          particleHoverFactor={0.5}
          cameraDistance={22}
          scrollParallax={2.4}
          scrollParallaxCap={2.6}
          scrollRoll={0.06}
        />
      </Salvaguarda3D>
    </div>
  );
}
