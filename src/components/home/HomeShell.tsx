'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import Hero from '@/components/Hero';
import { aquecerCracha } from '@/components/lanyard/aquecer-cracha';
import MacbookPortal from '@/components/macbook/MacbookPortal';
import type { Locale } from '@/i18n/config';

/* A casca de cliente da home.

   Ela existe porque a página precisa de duas coisas incompatíveis: ler o
   dicionário no servidor, e montar o BootIntro com `ssr: false`, que só um
   componente de cliente pode fazer. A saída é a página continuar sendo de
   servidor, buscar o texto, e entregar tudo pronto aqui por prop.

   O texto vem em `t` e não por import de dicionário: import atravessaria a
   fronteira e levaria as duas traduções inteiras pro bundle. */

// Só no navegador: revela a página pela cortina de pixels e é quem liga o
// `bootActive` do contexto do PixelTransition, os dois estado de cliente.
const BootIntro = dynamic(() => import('@/components/boot/BootIntro'), {
  ssr: false,
});

type Nav = { about: string; projects: string; contact: string };

export default function HomeShell({
  locale,
  t,
  nav,
  switchLabel,
}: {
  locale: Locale;
  t: { title: string; ctaProjects: string; ctaAbout: string };
  nav: Nav;
  switchLabel: string;
}) {
  /* A abertura do MacBook deixa a rede parada por vários segundos. É nela que
     o crachá da página "sobre mim" é baixado, pra que chegar lá seja instantâneo
     em vez de esperar o modelo do zero. */
  useEffect(() => {
    aquecerCracha();
  }, []);

  return (
    <main className="relative z-10 flex-1">
      <BootIntro />
      {/* A home inteira mora dentro do MacBook: a abertura é só a moldura
          sobre o fundo animado, e a rolagem entra no site. */}
      <MacbookPortal header={{ locale, nav, switchLabel }}>
        <Hero locale={locale} t={t} />
      </MacbookPortal>
    </main>
  );
}
