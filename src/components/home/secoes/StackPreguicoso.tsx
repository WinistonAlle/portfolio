'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';

/* O mapa da stack, montado só quando chega perto da tela.
 *
 * Na página "sobre mim" ele podia ser importado direto: é o segundo bloco, e
 * quem abre aquela página vai vê-lo em segundos. Na home ele está lá embaixo,
 * depois do hero e da bio, e a maioria das visitas nunca chega nele.
 *
 * Isso importa mais do que o tamanho do bundle: o StackGraph roda um laço de
 * animação contínuo com física própria (repulsão e mola, projeção 3D à mão).
 * Montado no topo da página, ele gasta bateria desenhando um grafo que ninguém
 * está olhando — e na home ele dividiria esse tempo de CPU com a abertura 3D do
 * MacBook, que é justamente o momento em que a animação precisa estar lisa.
 */

const StackGraph = dynamic(() => import('@/components/stack/StackGraph'), {
  ssr: false,
  /* Reserva a altura antes de montar. Sem isso a página daria um pulo quando o
     grafo aparecesse, e o pulo aconteceria debaixo do dedo de quem rola. */
  loading: () => <div style={{ height: 520 }} aria-hidden />,
});

export default function StackPreguicoso() {
  const alvo = useRef<HTMLDivElement>(null);
  const [perto, setPerto] = useState(false);

  useEffect(() => {
    const el = alvo.current;
    if (!el) return;
    /* Sem IntersectionObserver (navegador antigo), monta logo: melhor gastar
       um pouco do que não mostrar a seção. */
    if (typeof IntersectionObserver === 'undefined') {
      setPerto(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada.isIntersecting) return;
        setPerto(true);
        obs.disconnect();
      },
      /* Uma tela de antecedência: o grafo tem tempo de montar e assentar antes
         de entrar em quadro, então quem chega já encontra ele pronto. */
      { rootMargin: '100% 0px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={alvo}>
      {perto ? <StackGraph /> : <div style={{ height: 520 }} aria-hidden />}
    </div>
  );
}
