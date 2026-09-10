import type { Shot } from '@/data/projects';
import { pick, type Locale } from '@/i18n/config';

/* Galeria de prints da página do projeto. Sem moldura de aparelho aqui: a
 * moldura já apareceu no topo, e repetir ela em cada print rouba pixel da
 * tela, que é o que a pessoa veio ver. Cada print é uma figura com legenda,
 * porque um print sem legenda não conta o que está acontecendo nele.
 *
 * Uma imagem sozinha ocupa a largura inteira; a partir de duas, vão em duas
 * colunas.
 */
export default function Gallery({
  shots,
  locale,
}: {
  shots: Shot[];
  locale: Locale;
}) {
  if (!shots.length) return null;

  return (
    <ul
      className={`grid grid-cols-1 gap-8 ${shots.length > 1 ? 'md:grid-cols-2' : ''}`}
    >
      {shots.map((shot) => (
        <li key={shot.src}>
          <figure>
            <div className="overflow-hidden rounded-xl border border-line bg-surface">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={shot.src}
                alt={pick(shot.alt, locale)}
                className="block h-auto w-full"
                loading="lazy"
              />
            </div>
            {shot.caption && (
              <figcaption className="mt-3 text-sm leading-relaxed text-muted">
                {pick(shot.caption, locale)}
              </figcaption>
            )}
          </figure>
        </li>
      ))}
    </ul>
  );
}
