/* Idiomas do site.

   Este arquivo é neutro de propósito: só tipos e constantes, nenhum texto.
   Ele é o único módulo de i18n que componente de cliente pode importar sem
   arrastar as duas traduções inteiras pro bundle do navegador. Quem carrega
   dicionário é o `getDictionary`, e aquele módulo é marcado `server-only`. */

export const LOCALES = ['pt', 'en'] as const;

export type Locale = (typeof LOCALES)[number];

/** Português é o padrão: é onde o site nasceu e onde está a maior parte do público. */
export const DEFAULT_LOCALE: Locale = 'pt';

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/* Valor que muda com o idioma. Como os dois campos são obrigatórios, o
   TypeScript recusa um projeto traduzido pela metade: acrescentar um caso novo
   sem o inglês não compila, em vez de aparecer em branco na tela. */
export type Localized<T> = { pt: T; en: T };

export function pick<T>(value: Localized<T>, locale: Locale): T {
  return value[locale];
}

/** Código de idioma para o atributo `lang` do HTML e para o hreflang. */
export const HTML_LANG: Record<Locale, string> = {
  pt: 'pt-BR',
  en: 'en',
};

/* Bandeira de cada idioma, para o switch do header.

   Bandeira é país, não idioma: 🇧🇷 não é "português" e 🇺🇸 não é "inglês". Aqui
   passa porque o site é de um brasileiro e os dois públicos são exatamente
   esses, mas o nome do idioma continua existindo no `aria-label` do switch,
   que é o que o leitor de tela anuncia.

   Emoji de bandeira é um par de indicadores regionais, e o Windows não traz
   glifo pra isso: lá o navegador desenha as duas LETRAS ("BR", "US"). O switch
   é desenhado pra continuar legível nesse caso, com cada bandeira no seu
   compartimento. */
export const LOCALE_FLAG: Record<Locale, string> = {
  pt: '🇧🇷',
  en: '🇺🇸',
};

/** Troca o prefixo de idioma de um caminho, preservando o resto. */
export function pathWithLocale(pathname: string, locale: Locale): string {
  const partes = pathname.split('/').filter(Boolean);
  if (partes.length && isLocale(partes[0])) partes[0] = locale;
  else partes.unshift(locale);
  return `/${partes.join('/')}`;
}
