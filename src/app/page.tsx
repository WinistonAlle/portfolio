'use client';

import dynamic from 'next/dynamic';
import Hero from '@/components/Hero';
import MacbookPortal from '@/components/macbook/MacbookPortal';

// WindowStack (o bloco com as abas "sobre-mim.md / projetos.tsx /
// producao.log") saiu da home a pedido do usuário — vai voltar em outro
// lugar depois. Componente intacto em '@/components/WindowStack'.

// Browser-only: reveals the page via the pixel curtain and drives the
// PixelTransition context's `bootActive` flag, both client-side state.
const BootIntro = dynamic(() => import('@/components/boot/BootIntro'), {
  ssr: false,
});

export default function Home() {
  return (
    <main className="relative z-10 flex-1">
      <BootIntro />
      {/* A home inteira mora dentro do MacBook: a abertura é só a moldura
          sobre o fundo animado, e a rolagem entra no site. */}
      <MacbookPortal>
        <Hero />
      </MacbookPortal>
    </main>
  );
}
