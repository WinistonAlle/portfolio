import 'server-only';
import type { Locale } from './config';

/* Carregador dos dicionários.

   `server-only` no topo é a trava que faz esta arquitetura valer: se um
   componente de cliente importar este módulo, o build falha na hora, em vez de
   silenciosamente empacotar as DUAS traduções inteiras no bundle do navegador.
   Componente de cliente que precisa de texto recebe por prop, do servidor.

   Import dinâmico por idioma: quem abre /pt nunca baixa o dicionário em inglês. */

const dictionaries = {
  pt: () => import('./dictionaries/pt').then((m) => m.default),
  en: () => import('./dictionaries/en').then((m) => m.default),
};

export type Dictionary = Awaited<ReturnType<(typeof dictionaries)['pt']>>;

export const getDictionary = async (locale: Locale): Promise<Dictionary> =>
  dictionaries[locale]();
