/* Um sinal só: "a abertura do MacBook está no ar?"
 *
 * Existe porque duas coisas precisam saber disso e uma não é filha da outra: o
 * portal (`MacbookPortal`, dentro da página) e o fundo de partículas
 * (`ParticlesBackground`, no layout raiz). Passar por props exigiria erguer o
 * estado até o layout, que é Server Component; passar por contexto colocaria
 * um provider em volta do site inteiro por causa de um booleano.
 *
 * Por que os dois não podem coexistir: cada um abre o SEU contexto WebGL, e a
 * abertura é o momento mais pesado da home — cena 3D do notebook, física do
 * crachá aquecendo, chunks baixando. Dois fundos animados disputando GPU ali é
 * justamente onde a animação precisa estar lisa. E, à parte o custo, o pedido
 * era um efeito DIFERENTE nesta página: dois ao mesmo tempo não seriam
 * diferentes, seriam sobrepostos.
 */

let ativa = false;
const inscritos = new Set<(v: boolean) => void>();

export function definirAbertura(valor: boolean) {
  if (ativa === valor) return;
  ativa = valor;
  for (const avisar of inscritos) avisar(ativa);
}

export function aberturaAtiva() {
  return ativa;
}

/** Assina o sinal e devolve a função de cancelar, no formato que o React usa. */
export function assinarAbertura(avisar: (v: boolean) => void) {
  inscritos.add(avisar);
  return () => {
    inscritos.delete(avisar);
  };
}
