import type { Metadata } from 'next';
import { Geist, Geist_Mono, Space_Grotesk } from 'next/font/google';
import { notFound } from 'next/navigation';
import { lang } from 'next/root-params';
import '../globals.css';
import ParticlesBackground from '@/components/background/ParticlesBackground';
import Header from '@/components/Header';
import { PixelTransitionProvider } from '@/components/transition/PixelTransition';
import SmoothScroll from '@/components/scroll/SmoothScroll';
import { getDictionary } from '@/i18n';
import { HTML_LANG, LOCALES, isLocale } from '@/i18n/config';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

/* Geométrica e reta, só para o título do Hero: peso pesado sem nada de
   cursivo/manuscrito, séria mesmo em contorno vazado (echo-text--outlined).
   Contraste de propósito com o resto do site, todo em Geist/mono — o título
   não precisa combinar, precisa chamar atenção. */
const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
  weight: ['700'],
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
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} h-full antialiased`}
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
