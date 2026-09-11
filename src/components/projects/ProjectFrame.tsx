import { MacbookPro } from '@/components/macbook/MacbookPro';
import { Iphone16Pro } from '@/components/iphone/Iphone16Pro';
import { TotemFrame } from '@/components/totem/TotemFrame';
import VideoLoop from '@/components/media/VideoLoop';
import { pick, type Locale } from '@/i18n/config';
import type { ProjectMedia } from '@/data/projects';

/* Print (ou vídeo) dentro da moldura do aparelho certo. As duas molduras do
 * repo (MacbookPro e Iphone16Pro) desenham a tela com `currentColor` quando
 * não recebem `src`, e é por isso que o wrapper leva `text-surface`: sem
 * print, sobra a moldura com a tela apagada, um lugar vazio honesto em vez de
 * um buraco no layout.
 *
 * Quando o projeto tem vídeo, ele entra pela prop `screen` das molduras, que
 * posiciona HTML por cima do SVG. O `poster` é o print, então a tela nunca
 * fica preta enquanto o arquivo carrega.
 */
export default function ProjectFrame({
  media,
  locale,
  className,
}: {
  media: ProjectMedia;
  locale: Locale;
  className?: string;
}) {
  if (media.frame === 'none') return null;

  const screen = media.video ? (
    <VideoLoop
      src={media.video}
      poster={media.poster || media.src}
      className="h-full w-full object-cover"
    />
  ) : undefined;

  if (media.frame === 'totem') {
    /* Bem mais larga que a do celular (min(58vw,240px)): o totem é uma tela
       de 1080x1920 cheia de informação, e no tamanho de um telefone não dá
       pra ler nada do que está nela. */
    return (
      <TotemFrame
        className={`mx-auto w-[min(76vw,360px)] text-surface ${className ?? ''}`}
        src={media.src || undefined}
        screen={screen}
        role="img"
        aria-label={pick(media.alt, locale)}
      />
    );
  }

  if (media.frame === 'mobile') {
    return (
      <Iphone16Pro
        className={`mx-auto w-[min(58vw,240px)] text-surface ${className ?? ''}`}
        src={media.src || undefined}
        screen={screen}
        role="img"
        aria-label={pick(media.alt, locale)}
      />
    );
  }

  return (
    <MacbookPro
      className={`h-auto w-full text-surface ${className ?? ''}`}
      src={media.src || undefined}
      screen={screen}
      role="img"
      aria-label={pick(media.alt, locale)}
    />
  );
}
