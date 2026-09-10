'use client';

/* Header no topo do documento, rolando junto com a página (não é fixo), com
   o mesmo vidro fosco o tempo todo. Já teve dois estados (transparente sobre
   o hero, opaco depois de rolar), uma barra de progresso de leitura e
   position:fixed; os três saíram a pedido do usuário. Sem esses estados, o
   componente não precisa ouvir o scroll. */

import TransitionLink from '@/components/transition/TransitionLink';
import { usePixelTransition } from '@/components/transition/PixelTransition';

const NAV = [
  { label: 'Sobre mim', href: '/sobre-mim' },
  { label: 'Projetos', href: '/projetos' },
  { label: 'Contato', href: '/contato' },
];

export default function Header({ inPortal = false }: { inPortal?: boolean }) {
  const { bootActive, chromeHidden } = usePixelTransition();

  /* Cópia dentro da tela do MacBook (inPortal): só se esconde durante o boot,
     já que quem controla se ela existe é o próprio MacbookPortal. A do
     layout raiz também some enquanto o portal não foi atravessado
     (chromeHidden) — nesse meio tempo quem aparece é a cópia de dentro do
     notebook. Fica invisível em vez de sair do DOM para não empurrar a
     página quando volta. */
  const hidden = inPortal ? bootActive : bootActive || chromeHidden;

  return (
    <header
      className={`site-header${hidden ? ' site-header--hidden' : ''}`}
    >
      <div className="mx-auto flex h-[72px] w-full max-w-7xl items-center justify-between px-6 lg:px-10">
        <TransitionLink href="/" className="site-header__brand">
          Winiston Alle
        </TransitionLink>
        <nav className="flex items-center gap-6 lg:gap-8">
          {NAV.map((item) =>
            item.href.startsWith('/') ? (
              <TransitionLink
                key={item.label}
                href={item.href}
                className="site-header__link"
              >
                {item.label}
              </TransitionLink>
            ) : (
              <a
                key={item.label}
                href={item.href}
                className="site-header__link"
              >
                {item.label}
              </a>
            ),
          )}
        </nav>
      </div>
      {/* filete aceso na borda de baixo: fica sempre inteiro, não acompanha
          mais o progresso de rolagem */}
      <div className="site-header__glow" />
    </header>
  );
}
