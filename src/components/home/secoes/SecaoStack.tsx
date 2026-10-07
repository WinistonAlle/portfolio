import GlowButton from '@/components/ui/GlowButton';
import TituloAcento from '@/components/text/TituloAcento';
import StackPreguicoso from './StackPreguicoso';
import type { Locale } from '@/i18n/config';

/* O mapa da stack.
 *
 * Vem inteiro, e não resumido, porque ele já É o resumo: o argumento do bloco
 * é que as peças se conversam, e isso só se vê no desenho. Cortá-lo pela
 * metade devolveria uma lista de tecnologias, que é exatamente o que o grafo
 * existe para não ser.
 *
 * O canvas em si é montado só quando chega perto — ver StackPreguicoso.
 */
export default function SecaoStack({
  locale,
  titulo,
  verMais,
}: {
  locale: Locale;
  titulo: string;
  verMais: string;
}) {
  return (
    <section className="relative w-full pb-24">
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
        <h2 className="max-w-2xl text-[clamp(1.8rem,3vw,2.6rem)] leading-tight font-bold tracking-[-0.02em] text-balance">
          <TituloAcento texto={titulo} />
        </h2>
      </div>

      {/* Sem moldura e de ponta a ponta, como na página: as legendas longas
          fazem a largura ser o gargalo do encaixe, então tela cheia é o que
          deixa o grafo maior. */}
      <div className="mt-4 w-full">
        <StackPreguicoso />
      </div>

      <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
        <GlowButton href={`/${locale}/sobre-mim`} variant="secondary">
          {verMais}
        </GlowButton>
      </div>
    </section>
  );
}
