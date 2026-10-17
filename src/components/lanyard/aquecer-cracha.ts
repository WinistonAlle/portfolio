/* Puxa o crachá 3D pro cache do navegador antes de alguém pedir por ele.
 *
 * A página "sobre mim" mostrava "carregando crachá" por segundos porque tudo
 * dela começava tarde: o chunk do three/rapier só entra na fila depois que a
 * rota monta, e o modelo só depois do chunk. Vindo da home, porém, existe um
 * tempo morto enorme (a abertura do MacBook) em que a rede está ociosa.
 *
 * Duas regras que este arquivo respeita de propósito:
 *
 * 1. Espera a ociosidade. Aquecer durante a abertura competiria com a cena 3D
 *    da própria home, que é o que a pessoa está olhando naquele instante.
 * 2. Não importa nada do Lanyard no topo. Se este módulo importasse a cena
 *    pra "referenciá-la", ela entraria no bundle da home e o aquecimento
 *    viraria custo fixo. O import dinâmico dentro da função é o ponto todo.
 */

import { aoCenaPronta } from '@/components/background/abertura';

let jaFoi = false;

/* 3. Só onde o crachá 3D existe. Abaixo de 1024px o Sobre mim mostra o
 *    cartão em imagem (CrachaCartao), e aquecer era baixar 2,2 MB de física
 *    (rapier, WASM embutido no JS) que o celular nunca ia usar.
 * 4. Nem com economia de dados ou rede lenta.
 * 5. requestIdleCallback sozinho não basta: o navegador considera o
 *    carregamento "ocioso" e disparava no meio da abertura. Agora espera a
 *    cena 3D pintar e mais uns segundos antes de pedir a ociosidade. */
function vale() {
  if (!window.matchMedia('(min-width: 1024px)').matches) return false;
  const rede = (navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string };
  }).connection;
  if (rede?.saveData) return false;
  if (rede?.effectiveType && /(^|-)(2g|3g)$/.test(rede.effectiveType)) return false;
  return true;
}

export function aquecerCracha() {
  if (jaFoi || typeof window === 'undefined' || !vale()) return;
  jaFoi = true;

  const ocioso =
    window.requestIdleCallback ??
    ((fn: () => void) => window.setTimeout(fn, 2000));

  aoCenaPronta(() => {
    window.setTimeout(() => {
      ocioso(
        () => {
          /* Baixa em prioridade baixa: se a pessoa nunca for pra "sobre mim",
             isto não pode ter atrapalhado nada no caminho. */
          fetch('/card.glb', { priority: 'low' } as RequestInit).catch(() => {});
          import('./Lanyard').catch(() => {});
        },
        { timeout: 8000 },
      );
    }, 4000);
  });
}
