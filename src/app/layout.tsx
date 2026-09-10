import type { Metadata } from 'next';
import { Geist, Geist_Mono, Space_Grotesk } from 'next/font/google';
import './globals.css';
import ParticlesBackground from '@/components/background/ParticlesBackground';
import Header from '@/components/Header';
import { PixelTransitionProvider } from '@/components/transition/PixelTransition';
import SmoothScroll from '@/components/scroll/SmoothScroll';

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

export const metadata: Metadata = {
  title: 'Winiston Alle — Desenvolvedor Full-Stack',
  description:
    'Sistemas em produção: catálogo interno para 255 funcionários, PDV integrado a ERP legado, SaaS multi-tenant. React, Next.js, Supabase.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ParticlesBackground />
        <PixelTransitionProvider>
          {/* Dentro do provider: precisa saber quando o boot trava a rolagem. */}
          <SmoothScroll />
          <Header />
          {children}
        </PixelTransitionProvider>
      </body>
    </html>
  );
}
