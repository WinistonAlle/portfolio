import type { ReactNode } from 'react';

/* O fecho de seção: título centrado, uma linha de texto e dois botões.
 *
 * Existia duas vezes, copiado quase igual entre a página "sobre mim" e a de
 * projetos. Virou componente quando a home passou a ter o seu — três cópias da
 * mesma caixa é como uma delas fica com espaçamento diferente e ninguém
 * percebe até ver as duas lado a lado.
 */
export default function CtaBlock({
  titulo,
  texto,
  children,
}: {
  titulo: string;
  texto: string;
  /** Os botões. Ficam por children porque a ordem e o destino mudam em cada
   *  tela: quem chegou pelos projetos quer conversar, quem chegou pela bio
   *  quer ver trabalho. */
  children: ReactNode;
}) {
  return (
    <div className="cta">
      <div className="cta__inner">
        <h2 className="mx-auto max-w-2xl text-[clamp(1.8rem,3.2vw,2.6rem)] leading-tight font-bold tracking-[-0.02em] text-balance">
          {titulo}
        </h2>

        <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted">
          {texto}
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          {children}
        </div>
      </div>
    </div>
  );
}
