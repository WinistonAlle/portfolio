/* A stack em lista, para o celular.
 *
 * O grafo (StackGraph) precisa de largura: numa tela de 390px ele ficava
 * pequeno no meio de uma caixa alta, os nomes se atropelavam e metade da
 * stack era escondida pra caber. Aqui a mesma informação vira um trilho
 * vertical: o núcleo em cima, os quatro pilares descendo, cada um com as
 * ferramentas, e no fim as ligações entre pilares, que são o "como as peças
 * se conversam" que o grafo desenha.
 *
 * Lê os mesmos dados do grafo (stack-dados.ts) e não tem estado nenhum:
 * renderiza no servidor e chega pronta no HTML. */

import { GRAPH } from './stack-dados';
import './stack-lista.css';

type No = (typeof GRAPH.nodes)[number];
type Pilar = keyof typeof GRAPH.pillars;

const ORDEM: Pilar[] = ['frontend', 'ai', 'backend', 'infra'];

const porId = new Map<string, No>(GRAPH.nodes.map((n) => [n.id, n]));
/* Nas ligações vai só o nome principal: "RAG · embeddings + pgvector" se
   repetia três vezes e quebrava linha em todas. */
const curto = (n: No) => n.label.split(' · ')[0];
const ehFolha = (n: No) => n.pillar !== 'core' && !('hub' in n && n.hub);

function Icone({ no }: { no: No }) {
  return (
    <span className="stack-lista__icone" aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`${GRAPH.iconDir}${no.id}.svg`} alt="" width={18} height={18} loading="lazy" />
    </span>
  );
}

export default function StackLista({ conexoesTitulo }: { conexoesTitulo: string }) {
  /* Ligações entre pilares diferentes: as que contam a conversa entre as
     peças. Hub com folha do próprio pilar é só agrupamento. */
  const conexoes = GRAPH.edges
    .map(([a, b]) => [porId.get(a), porId.get(b)] as const)
    .filter(
      (par): par is readonly [No, No] =>
        !!par[0] && !!par[1] && ehFolha(par[0]) && ehFolha(par[1]) && par[0].pillar !== par[1].pillar,
    );

  return (
    <div className="stack-lista">
      <div className="stack-lista__arvore">
      <div className="stack-lista__nucleo" aria-hidden="true">
        W
      </div>

      <ol className="stack-lista__pilares">
        {ORDEM.map((pilar) => {
          const hub = GRAPH.nodes.find((n) => n.pillar === pilar && 'hub' in n && n.hub);
          const itens = GRAPH.nodes.filter((n) => n.pillar === pilar && ehFolha(n));
          return (
            <li
              key={pilar}
              className="stack-lista__pilar"
              style={{ '--cor': GRAPH.pillars[pilar].color } as React.CSSProperties}
            >
              <span className="stack-lista__no" aria-hidden="true" />
              <h3 className="stack-lista__nome">{hub?.label}</h3>
              <ul className="stack-lista__itens">
                {itens.map((n) => (
                  <li key={n.id} className="stack-lista__item">
                    <Icone no={n} />
                    {n.label}
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ol>
      </div>

      <div className="stack-lista__conexoes">
        <h3 className="stack-lista__conexoes-titulo">{conexoesTitulo}</h3>
        <ul>
          {conexoes.map(([a, b]) => (
            <li
              key={`${a.id}-${b.id}`}
              className="stack-lista__conexao"
              style={
                {
                  '--cor-a': GRAPH.pillars[a.pillar as Pilar].color,
                  '--cor-b': GRAPH.pillars[b.pillar as Pilar].color,
                } as React.CSSProperties
              }
            >
              <span className="stack-lista__par" aria-hidden="true">
                <Icone no={a} />
                <i />
                <Icone no={b} />
              </span>
              <span>
                {curto(a)} <span className="stack-lista__e">+</span> {curto(b)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
