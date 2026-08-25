'use client';

import dynamic from 'next/dynamic';

// The whole scene (three + rapier wasm) is client-only and heavy, so it is
// split out and never prerendered. `ssr: false` is only legal inside a Client
// Component, which is why this wrapper exists.
const Lanyard = dynamic(() => import('./Lanyard'), {
  ssr: false,
  loading: () => <BadgeFallback />,
});

/** Shown while the 3D scene loads, and to anyone it never loads for. */
function BadgeFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/badge-front.png"
        alt="Crachá de Winiston Alle, desenvolvedor full-stack"
        className="w-52 rotate-3 rounded-xl opacity-40 shadow-2xl transition-opacity md:w-64"
      />
    </div>
  );
}

export default function LanyardBadge() {
  return (
    <Lanyard
      position={[0, -0.8, 22]}
      gravity={[0, -40, 0]}
      fov={20}
      frontImage="/badge-front.png"
      backImage="/badge-back.png"
      imageFit="cover"
      lanyardImage="/lanyard-band.png"
      lanyardWidth={1.1}
    />
  );
}
