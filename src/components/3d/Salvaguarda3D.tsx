'use client';

import { Component, type ReactNode } from 'react';

/* A rede embaixo de toda cena 3D do site.
 *
 * Cena 3D é o único código aqui que depende de uma coisa que o navegador pode
 * simplesmente RECUSAR: o contexto gráfico. E quando ele recusa, o three lança
 * de dentro de um efeito do React, longe de qualquer `try`. Sem um limite de
 * erro no caminho, o React desmonta a árvore inteira e a pessoa recebe uma
 * página em branco por causa de um enfeite.
 *
 * Foi o que aconteceu: um amigo do usuário abriu o site num PC Windows, no
 * Chrome e no Opera, e "abriu bem bugado" nos dois. Os dois são Chromium, e o
 * que Chromium tem em comum numa máquina só é a lista de bloqueio de GPU.
 * Reproduzido em 14/09/2026 num Chrome sem GPU: `TypeError: Cannot set
 * properties of null (setting 'renderer')` sem tratamento, e o documento
 * parado em uma tela de altura.
 *
 * Duas camadas, porque são falhas diferentes:
 *
 * 1. O PORTÃO (`ativo`), decidido por quem chama com `temWebGL()`: se o
 *    contexto nem abre, a cena não chega a ser montada.
 * 2. O LIMITE DE ERRO, para tudo que escapa do portão: driver que morre no
 *    meio, wasm do Rapier que não baixa, modelo corrompido. O portão responde
 *    ANTES, o limite responde DEPOIS, e nenhum dos dois cobre o caso do outro.
 *
 * Em qualquer um dos casos entra `alternativa`, e o resto da página continua
 * viva. Um crachá que não gira é um detalhe; um site que não abre é o site.
 */

type Props = {
  children: ReactNode;
  /** O que mostrar quando a cena não pode existir. */
  alternativa: ReactNode;
  /** `false` quando o portão já reprovou o navegador. */
  ativo?: boolean;
};

export default class Salvaguarda3D extends Component<Props, { caiu: boolean }> {
  state = { caiu: false };

  static getDerivedStateFromError() {
    return { caiu: true };
  }

  componentDidCatch(erro: unknown) {
    /* Fica no console e só: quem abriu o site não tem o que fazer com isto, e
       um aviso na tela chamaria atenção para a falha em vez de escondê-la
       atrás da alternativa, que é o ponto. */
    console.error('[3d] a cena caiu, seguindo com a alternativa:', erro);
  }

  render() {
    const { children, alternativa, ativo = true } = this.props;
    if (!ativo || this.state.caiu) return <>{alternativa}</>;
    return <>{children}</>;
  }
}
