import type { Metadata } from 'next';
import {
  Bricolage_Grotesque,
  Geist,
  Instrument_Serif,
  JetBrains_Mono,
} from 'next/font/google';
import { notFound } from 'next/navigation';
import { lang } from 'next/root-params';
import '../globals.css';
import ParticlesBackground from '@/components/background/ParticlesBackground';
import Header from '@/components/Header';
import { PixelTransitionProvider } from '@/components/transition/PixelTransition';
import SmoothScroll from '@/components/scroll/SmoothScroll';
import { getDictionary } from '@/i18n';
import { HTML_LANG, LOCALES, isLocale } from '@/i18n/config';

/* Quatro famílias, cada uma com um trabalho que as outras não fazem. Antes
   eram três sem divisão clara: a Geist fazia corpo E todos os títulos, a mono
   aparecia em vinte lugares (inclusive na navegação, onde não há dado nenhum),
   e a Space Grotesk baixava inteira pra ser usada em dois títulos.

   1. DISPLAY (Bricolage Grotesque) — marca, navegação, títulos, rótulos de
      interface. Tem eixo óptico (`opsz`), então a mesma família serve a um
      título de 13rem e a um link de 13px sem parecer a mesma letra esticada.
   2. TEXTO (Geist) — parágrafo. Fica porque ler texto longo é o que ela faz
      melhor, e os textos dos cases são longos.
   3. ACENTO (Instrument Serif itálica) — uma expressão dentro de um título,
      nunca um título inteiro. É o contraste que tira o site do genérico.
   4. DADO (JetBrains Mono) — número, tag de stack, id de ERP. Só onde
      monoespaçado significa alguma coisa. */
const display = Bricolage_Grotesque({
  variable: '--font-display-face',
  subsets: ['latin'],
  axes: ['opsz'],
});

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

/* Só o itálico: o romano desta serifa não é usado em lugar nenhum, e pedir os
   dois dobraria o download por nada. */
const serifAccent = Instrument_Serif({
  variable: '--font-serif-accent',
  subsets: ['latin'],
  weight: '400',
  style: 'italic',
});

const mono = JetBrains_Mono({
  variable: '--font-mono-data',
  subsets: ['latin'],
  weight: ['400', '500'],
});

/* Os dois idiomas são gerados no build. Sem isto, /en existiria só quando
   alguém pedisse, e o que a gente quer é HTML pronto pro robô de busca. */
export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata(): Promise<Metadata> {
  const atual = await lang();
  if (!atual || !isLocale(atual)) return {};
  const dict = await getDictionary(atual);

  return {
    title: dict.meta.title,
    description: dict.meta.description,
    /* hreflang: diz ao buscador que estas duas páginas são a MESMA página em
       idiomas diferentes, e não conteúdo duplicado. Sem isso, as duas
       competem entre si no índice em vez de se complementarem. */
    alternates: {
      languages: {
        'pt-BR': '/pt',
        en: '/en',
        'x-default': '/pt',
      },
    },
  };
}

export default async function RootLayout({ children }: LayoutProps<'/[lang]'>) {
  const atual = await lang();
  /* Um caminho como /fr chega aqui como segmento válido de rota, mas não é
     idioma que exista: 404 é a resposta honesta, e não a página em português
     servida numa URL que promete francês. */
  if (!atual || !isLocale(atual)) notFound();

  const dict = await getDictionary(atual);

  return (
    <html
      lang={HTML_LANG[atual]}
      className={`${display.variable} ${geistSans.variable} ${serifAccent.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ParticlesBackground />
        <PixelTransitionProvider>
          {/* Dentro do provider: precisa saber quando o boot trava a rolagem. */}
          <SmoothScroll />
          {/* O Header é componente de cliente, então recebe texto por prop em
              vez de importar dicionário: import atravessaria a fronteira e
              levaria as duas traduções inteiras pro bundle. */}
          <Header
            locale={atual}
            nav={dict.nav}
            switchLabel={dict.header.switchLabel}
          />
          {children}
        </PixelTransitionProvider>
      </body>
    </html>
  );
}
