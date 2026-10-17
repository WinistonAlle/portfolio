'use client';

import { useEffect, useRef } from 'react';

/* Vídeo em loop para dentro das molduras de aparelho (Iphone16Pro e
 * MacbookPro). Mora em `media/` e não em `iphone/` porque as duas molduras
 * usam ele.
 *
 * <video autoPlay muted> às vezes não basta: alguns navegadores só respeitam
 * autoplay se `muted` estiver setado como propriedade do elemento antes do
 * play, não só como atributo JSX. Forçar aqui garante que toca sozinho, sem
 * precisar de clique.
 */
export default function VideoLoop({
  src,
  poster,
  className,
}: {
  src: string;
  /** Imagem exibida enquanto o vídeo carrega, para a tela não piscar preta. */
  poster?: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    video.muted = true;

    /* Só toca quando está perto da tela. Antes todo vídeo da página baixava
       e decodificava desde a abertura, inclusive os lá embaixo: banda e
       processador gastos com o que ninguém está vendo, e travada na rolagem
       do celular. Fora da tela ele pausa. */
    let visivel = false;
    const tryPlay = () => {
      if (visivel) video.play().catch(() => {});
    };
    const observer = new IntersectionObserver(
      ([entrada]) => {
        visivel = entrada.isIntersecting;
        if (visivel) tryPlay();
        else video.pause();
      },
      { rootMargin: '200px 0px' },
    );
    observer.observe(video);

    /* Alguns navegadores (Safari com "Never Auto-Play" nas preferências do
       site, por exemplo) recusam até o autoplay mudo. Nesse caso, a primeira
       interação em qualquer lugar da página já destrava o play. */
    const onFirstInteraction = () => {
      tryPlay();
      window.removeEventListener('pointerdown', onFirstInteraction);
      window.removeEventListener('keydown', onFirstInteraction);
    };
    window.addEventListener('pointerdown', onFirstInteraction);
    window.addEventListener('keydown', onFirstInteraction);
    return () => {
      observer.disconnect();
      window.removeEventListener('pointerdown', onFirstInteraction);
      window.removeEventListener('keydown', onFirstInteraction);
    };
  }, []);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      className={className}
      loop
      muted
      playsInline
      preload="none"
      disablePictureInPicture
    />
  );
}
