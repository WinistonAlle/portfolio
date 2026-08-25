'use client';

import dynamic from 'next/dynamic';

// The whole scene (three + rapier wasm) is client-only and heavy, so it is
// split out and never prerendered. `ssr: false` is only legal inside a Client
// Component, which is why this wrapper exists.
const Lanyard = dynamic(() => import('./Lanyard'), {
  ssr: false,
  loading: () => <BadgeLoading />,
});

/**
 * Shown while the chunk and the 2.4MB card.glb load — useGLTF suspends until
 * the model is parsed. It has to read as "loading", not as a finished badge:
 * a crisp static image here just looks like the 3D never arrived.
 */
function BadgeLoading() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/badge-front.png"
        alt=""
        aria-hidden
        className="w-44 animate-pulse rounded-xl opacity-15 blur-[1px] md:w-52"
      />
      <p className="label animate-pulse">carregando crachá</p>
    </div>
  );
}

export default function LanyardBadge() {
  return (
    <Lanyard
      position={[0, -1.3, 13.5]}
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
