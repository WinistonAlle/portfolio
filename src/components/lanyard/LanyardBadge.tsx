'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';

// The whole scene (three + rapier wasm) is client-only and heavy, so it is
// split out and never prerendered. `ssr: false` is only legal inside a Client
// Component, which is why this wrapper exists.
const Lanyard = dynamic(() => import('./Lanyard'), {
  ssr: false,
  loading: () => <BadgeLoading />,
});

/* Camera settings live here because the stage math needs them: with a
   perspective camera the visible world height is fixed by fov + distance, and
   everything else (world units per pixel, where the anchor has to sit) falls
   out of it. Keep in sync with the <Lanyard> props below. */
const CAM_Z = 13.5;
const FOV = 20;
const VISIBLE_WORLD_HEIGHT = 2 * CAM_Z * Math.tan(((FOV / 2) * Math.PI) / 180);

type Stage = { left: number; width: number; anchorX: number };

/**
 * Shown while the chunk and the 2.4MB card.glb load — useGLTF suspends until
 * the model is parsed. It has to read as "loading", not as a finished badge:
 * a crisp static image here just looks like the 3D never arrived.
 */
function BadgeLoading({ saindo = false }: { saindo?: boolean }) {
  return (
    <div
      aria-hidden={saindo}
      className={`flex h-full w-full flex-col items-center justify-center gap-6 transition-opacity duration-500 ${
        saindo ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
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

/**
 * Three only draws inside the canvas rectangle, so a canvas the size of the
 * hero's right column meant the card vanished the moment you dragged it over
 * the copy. The fix is a canvas as wide as the viewport, painted *under* the
 * text (the copy carries `z-10`), with the band's anchor pushed sideways in
 * world units so the badge still hangs over the right column instead of over
 * the middle of the page.
 *
 * Canvas height stays exactly the slot height, which is what fixes the card's
 * on-screen size — widening alone changes nothing about scale.
 */
export default function LanyardBadge({
  active = true,
}: {
  active?: boolean;
}) {
  const slotRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState<Stage | null>(null);
  /* A cena nasce invisível de propósito (a corda precisa de alguns quadros pra
     parar de balançar, e desenhar essa queda era a piscada que o usuário via).
     Sem este estado sobrava um buraco: o placeholder saía junto com o chunk e
     a cena ainda estava escondida. Agora o placeholder só sai quando a cena
     entra, e os dois se cruzam num fade. */
  const [revelou, setRevelou] = useState(false);

  useEffect(() => {
    const slot = slotRef.current;
    if (!slot) return;

    let settleTimer = 0;

    const measure = () => {
      const rect = slot.getBoundingClientRect();
      if (!rect.height || !rect.width) return;

      const viewport = document.documentElement.clientWidth;
      const worldPerPx = VISIBLE_WORLD_HEIGHT / rect.height;
      const slotCenter = rect.left + rect.width / 2;

      setStage((current) => {
        const next = {
          left: -rect.left,
          width: viewport,
          anchorX: (slotCenter - viewport / 2) * worldPerPx,
        };
        return current &&
          current.left === next.left &&
          current.width === next.width
          ? current
          : next;
      });
    };

    /* Layout leva alguns frames pra acomodar (fonte carregando, o texto ao
       lado mudando de largura) e cada acomodação dispara o ResizeObserver.
       Como Lanyard remonta a cena inteira a cada `stage` novo (comentário no
       key abaixo), medir sem esperar acomodar fazia o crachá nascer, cair de
       novo e nascer de novo em sequência — a "bugadinha" no load. Só nasce
       depois que as medidas pararem de mudar por um instante. */
    const scheduleMeasure = () => {
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(measure, 120);
    };

    scheduleMeasure();
    const observer = new ResizeObserver(scheduleMeasure);
    observer.observe(slot);
    observer.observe(document.documentElement);
    return () => {
      window.clearTimeout(settleTimer);
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={slotRef} className="relative h-full w-full">
      <div
        className="absolute inset-y-0"
        style={
          stage
            ? { left: stage.left, width: stage.width }
            : { left: 0, right: 0 }
        }
      >
        {/* Camada de espera POR TRÁS da cena, não no lugar dela: enquanto a
            corda assenta é ela que ocupa o espaço do crachá. */}
        <div className="absolute inset-0">
          <BadgeLoading saindo={revelou} />
        </div>

        {stage ? (
          <Lanyard
            onReveal={() => setRevelou(true)}
            /* Rapier reads each body's world transform once, at creation, so a
               moved anchor only takes effect on a fresh scene. Resizes are rare
               and drei caches the glb, so remounting is the cheap way out. */
            key={Math.round(stage.anchorX * 20)}
            position={[0, -1.3, CAM_Z]}
            gravity={[0, -40, 0]}
            fov={FOV}
            anchor={[stage.anchorX, 4, 0]}
            frontImage="/badge-front.png"
            backImage="/badge-back.png"
            imageFit="cover"
            lanyardImage="/lanyard-band.png"
            lanyardWidth={1.1}
            paused={!active}
          />
        ) : null}
      </div>
    </div>
  );
}
