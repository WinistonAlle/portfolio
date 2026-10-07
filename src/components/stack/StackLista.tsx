/* A stack em lista, para o celular.
 *
 * O grafo (StackGraph) precisa de largura: numa tela de 390px ele ficava
 * pequeno no meio de uma caixa alta, os nomes se atropelavam e metade da
 * stack era escondida pra caber. Aqui a mesma informação vira um trilho
 * vertical: o núcleo em cima e os quatro pilares descendo, cada um com as
 * ferramentas.
 *
 * Lê os mesmos dados do grafo (stack-dados.ts) e não tem estado nenhum:
 * renderiza no servidor e chega pronta no HTML. O único pedaço de cliente é
 * o LED do trilho (StackLed), que acende com a rolagem. */

import { GRAPH } from './stack-dados';
import StackLed from './StackLed';
import './stack-lista.css';

type No = (typeof GRAPH.nodes)[number];
type Pilar = keyof typeof GRAPH.pillars;

const ORDEM: Pilar[] = ['frontend', 'ai', 'backend', 'infra'];

const ehFolha = (n: No) => n.pillar !== 'core' && !('hub' in n && n.hub);

function Icone({ no }: { no: No }) {
  return (
    <span className="stack-lista__icone" aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`${GRAPH.iconDir}${no.id}.svg`} alt="" width={18} height={18} loading="lazy" />
    </span>
  );
}

export default function StackLista() {
  return (
    <div className="stack-lista">
      <div className="stack-lista__arvore">
      <StackLed />
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

    </div>
  );
}
