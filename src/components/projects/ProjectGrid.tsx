'use client';

import { Fragment, useMemo, useState, type ReactNode } from 'react';

/* Filtro + grade de /projetos.

   Este arquivo NÃO importa `@/data/projects`, e isso é o ponto. Código atravessa
   a fronteira do 'use client' por import: bastava importar uma constante do
   módulo dos projetos pra arrastar o módulo inteiro pro bundle, e com ele o
   texto de todo case (problem, solution e as legendas da galeria) que esta
   página não usa. Medido: eram 29 KB de dados num chunk de cliente, e crescendo
   a cada projeto novo.

   Então quem monta os cards é o servidor, e o que chega aqui é o elemento já
   renderizado. Dado atravessa por prop, e elemento React é prop serializável
   como qualquer outra. Os tipos são `string` de propósito, e não `ProjectGroup`:
   importar o tipo seria seguro (tipo se apaga na compilação), mas deixaria uma
   linha de import apontando pro módulo pesado, esperando pra virar import de
   valor no primeiro descuido.

   Sem filtro na URL de propósito: ninguém manda "olha essa gaveta" pra alguém,
   é a própria pessoa varrendo a página. Estado local é o que o caso pede.

   O servidor só manda gaveta que tem projeto dentro, então não dá pra chegar
   numa grade vazia clicando, e não existe estado vazio a desenhar. */

export type Aba = { chave: string; total: number };
/* `grupos` no plural: um projeto pode aparecer em mais de um filtro. Os
   rótulos já chegam traduzidos, então este componente segue sem conhecer o
   módulo dos projetos. */
export type Item = { slug: string; grupos: string[]; card: ReactNode };

export default function ProjectGrid({
  abas,
  itens,
  filterLabel,
  countOne,
  countMany,
}: {
  abas: Aba[];
  itens: Item[];
  filterLabel: string;
  countOne: string;
  countMany: string;
}) {
  /* O estado começa na primeira aba, que o servidor sempre monta como o
     "todos" do idioma. Guardar a string literal 'Todos' aqui deixaria o filtro
     quebrado em inglês, onde essa aba se chama 'All'. */
  const [filtro, setFiltro] = useState(abas[0]?.chave ?? '');

  const visiveis = useMemo(
    () =>
      filtro === abas[0]?.chave
        ? itens
        : itens.filter((i) => i.grupos.includes(filtro)),
    [filtro, itens, abas],
  );

  return (
    <>
      <div
        role="group"
        aria-label={filterLabel}
        className="mt-12 flex flex-wrap gap-2.5"
      >
        {abas.map(({ chave, total }) => {
          const ativo = filtro === chave;
          return (
            <button
              key={chave}
              type="button"
              aria-pressed={ativo}
              onClick={() => setFiltro(chave)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-[0.65rem] tracking-[0.18em] uppercase transition-colors ${
                ativo
                  ? 'border-accent/55 bg-accent/10 text-foreground'
                  : 'border-line text-muted hover:border-white/25 hover:text-foreground'
              }`}
            >
              {chave}
              {/* tabular-nums: o número não muda de largura entre 1 e 9, então
                  a fileira de botões não dança ao trocar de filtro. */}
              <span className="text-[0.6rem] tabular-nums opacity-55">
                {total}
              </span>
            </button>
          );
        })}
      </div>

      {/* Quem navega por leitor de tela clica no filtro e ouve quantos projetos
          sobraram, em vez de sair varrendo a grade pra saber se mudou algo. */}
      <p aria-live="polite" className="sr-only">
        {visiveis.length} {visiveis.length === 1 ? countOne : countMany}
      </p>

      {/* Fragment e não <li> em volta: o ProjectCard já é o próprio <li>, e
          envolver de novo daria lista dentro de item de lista. */}
      <ul className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
        {visiveis.map((i) => (
          <Fragment key={i.slug}>{i.card}</Fragment>
        ))}
      </ul>
    </>
  );
}
