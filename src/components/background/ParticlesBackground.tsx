'use client';

import dynamic from 'next/dynamic';

const Particles = dynamic(() => import('./Particles'), { ssr: false });

// Module constant: a fresh array each render would tear down and rebuild the
// whole WebGL context on every re-render.
const COLORS = ['#5b9cff', '#9dc0ff', '#f3f6ff'];

export default function ParticlesBackground() {
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
        scrollRoll={0.06}
      />
    </div>
  );
}
