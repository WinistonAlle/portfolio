'use client';

/* Header no topo do documento, rolando junto com a página (não é fixo), com
   o mesmo vidro fosco o tempo todo. Já teve dois estados (transparente sobre
   o hero, opaco depois de rolar), uma barra de progresso de leitura e
   position:fixed; os três saíram a pedido do usuário. Sem esses estados, o
   componente não precisa ouvir o scroll.

   Componente de cliente, então o texto chega por prop: importar o dicionário
   aqui arrastaria as duas traduções inteiras pro bundle do navegador. */

import { usePathname } from 'next/navigation';
import TransitionLink from '@/components/transition/TransitionLink';
import { usePixelTransition } from '@/components/transition/PixelTransition';
import { LOCALE_FLAG, pathWithLocale, type Locale } from '@/i18n/config';

type Nav = { about: string; projects: string; contact: string };

export default function Header({
  locale,
  nav,
  switchLabel,
  inPortal = false,
}: {
  locale: Locale;
  nav: Nav;
  switchLabel: string;
  inPortal?: boolean;
}) {
  const { bootActive, chromeHidden } = usePixelTransition();
  const pathname = usePathname();

  /* Cópia dentro da tela do MacBook (inPortal): só se esconde durante o boot,
     já que quem controla se ela existe é o próprio MacbookPortal. A do
     layout raiz também some enquanto o portal não foi atravessado
     (chromeHidden) — nesse meio tempo quem aparece é a cópia de dentro do
     notebook. Fica invisível em vez de sair do DOM para não empurrar a
     página quando volta. */
  const hidden = inPortal ? bootActive : bootActive || chromeHidden;

  const outro: Locale = locale === 'pt' ? 'en' : 'pt';

  /* O link de idioma aponta pra MESMA página no outro idioma, não pra home.
     Quem está lendo um projeto em português e clica em "Read in English" quer
     aquele projeto em inglês; mandar pra capa é perder o lugar da leitura. */
  const hrefOutroIdioma = pathWithLocale(pathname ?? `/${locale}`, outro);

  const itens = [
    { label: nav.about, href: `/${locale}/sobre-mim` },
    { label: nav.projects, href: `/${locale}/projetos` },
    { label: nav.contact, href: `/${locale}/contato` },
  ];

  return (
    <header className={`site-header${hidden ? ' site-header--hidden' : ''}`}>
      <div className="mx-auto flex h-[72px] w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-10">
        <TransitionLink href={`/${locale}`} className="site-header__brand">
          Winiston Alle
        </TransitionLink>
        {/* gap menor no celular: com gap-6 a barra estourava a tela. */}
        <nav className="flex items-center gap-3 sm:gap-6 lg:gap-8">
          {itens.map((item) => (
            <TransitionLink
              key={item.href}
              href={item.href}
              className="site-header__link"
            >
              {item.label}
            </TransitionLink>
          ))}

          {/* As duas bandeiras ficam sempre visíveis, com a ativa acesa e a
              outra apagada: switch precisa mostrar os dois estados, senão vira
              ícone e ninguém sabe que dá pra clicar.

              Bandeira não tem nome acessível nenhum, então o `aria-label` leva
              a frase inteira ("Read in English") e as bandeiras ficam
              aria-hidden. Quem usa leitor de tela ouve o que o clique faz; não
              ouve "bandeira do Brasil, bandeira dos Estados Unidos".

              hrefLang avisa buscador e navegador que o link muda de idioma. */}
          <TransitionLink
            href={hrefOutroIdioma}
            hrefLang={outro}
            aria-label={switchLabel}
            title={switchLabel}
            data-locale={locale}
            className="lang-switch"
          >
            <span className="lang-switch__knob" aria-hidden="true" />
            <span
              aria-hidden="true"
              className="lang-switch__flag lang-switch__flag--pt"
            >
              {LOCALE_FLAG.pt}
            </span>
            <span
              aria-hidden="true"
              className="lang-switch__flag lang-switch__flag--en"
            >
              {LOCALE_FLAG.en}
            </span>
          </TransitionLink>
        </nav>
      </div>
      {/* filete aceso na borda de baixo: fica sempre inteiro, não acompanha
          mais o progresso de rolagem */}
      <div className="site-header__glow" />
    </header>
  );
}
