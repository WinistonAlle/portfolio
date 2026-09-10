import { NextResponse, type NextRequest } from 'next/server';
import { DEFAULT_LOCALE, isLocale } from '@/i18n/config';

/* Todo caminho do site vive sob um idioma (/pt/... ou /en/...). Este arquivo
   cuida de quem chega na raiz, ou em qualquer caminho sem prefixo, e manda pro
   idioma certo.

   A escolha vem do cabeçalho Accept-Language, que é a preferência que a pessoa
   já configurou no navegador. É melhor do que adivinhar por país: brasileiro
   viajando continua querendo ler em português, e um americano abrindo daqui
   não quer a página em português só porque o IP é daqui.

   Redirecionamento é 307 (temporário) e não 308: a raiz não pertence a um
   idioma, ela pertence a quem está pedindo. Um 308 seria cacheado pelo
   navegador e a próxima pessoa naquele computador cairia no idioma da
   anterior. */

function escolherIdioma(req: NextRequest) {
  const header = req.headers.get('accept-language');
  if (!header) return DEFAULT_LOCALE;

  /* Accept-Language vem como "en-US,en;q=0.9,pt;q=0.8": lista de idiomas com
     peso. Ordena por peso e fica com o primeiro que a gente fala. */
  const preferidos = header
    .split(',')
    .map((parte) => {
      const [tag, q] = parte.trim().split(';q=');
      return { tag: tag.split('-')[0].toLowerCase(), peso: q ? Number(q) : 1 };
    })
    .filter((x) => Number.isFinite(x.peso))
    .sort((a, b) => b.peso - a.peso);

  return preferidos.find((p) => isLocale(p.tag))?.tag ?? DEFAULT_LOCALE;
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const primeiro = pathname.split('/')[1];
  if (isLocale(primeiro)) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = `/${escolherIdioma(req)}${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(url, 307);
}

export const config = {
  /* Fora: os arquivos internos do Next, o favicon e qualquer caminho com
     ponto (arquivo estático de public/, como /cases/... .jpg e .mp4). Sem o
     recorte do ponto, um redirecionamento de idioma cairia em cima das
     imagens dos cases e elas parariam de carregar. */
  matcher: ['/((?!_next|favicon.ico|.*\\.).*)'],
};
