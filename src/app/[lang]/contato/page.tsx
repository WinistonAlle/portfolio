import type { Metadata } from 'next';
import SocialCubes from '@/components/socials/SocialCubes';
import QuickMessage from '@/components/contact/QuickMessage';

export const metadata: Metadata = {
  title: 'Contato — Winiston Alle',
  description:
    'Fale com Winiston Alle sobre uma vaga, um projeto freelance ou uma ideia.',
};

export default function ContatoPage() {
  return (
    <main className="relative z-10 flex-1">
      {/* items-start, não center: os cubos ficam no alto da coluna da direita,
          alinhados com o começo do texto. Centralizados, eles desciam para o
          meio do bloco e o W perdia o encaixe com o título. */}
      <section className="mx-auto grid w-full max-w-7xl grid-cols-1 items-start gap-14 px-6 pt-28 pb-24 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12 lg:px-10 lg:pt-40">
        <div>
          <h1 className="text-[clamp(2.2rem,4.6vw,3.4rem)] leading-[1.05] font-bold tracking-[-0.03em] text-balance">
            Escolhe por onde
            <span className="text-muted"> a gente começa.</span>
          </h1>

          <p className="mt-7 max-w-md text-lg leading-relaxed text-muted">
            Vaga, projeto freelance ou só uma ideia pra validar. É só clicar no
            bloco do canal que você preferir aí do lado: todos caem direto
            comigo, sem intermediário no meio do caminho.
          </p>
        </div>

        {/* O SVG ocupa a largura da coluna, então é a coluna que dita o
            tamanho dos cubos. */}
        <div>
          <SocialCubes />
        </div>
      </section>

      {/* Segunda seção: para quem já chegou decidido e não quer trocar de app
          antes de escrever. */}
      <section className="relative w-full pb-32">
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
          <div className="border-t border-line pt-14">
            <h2 className="max-w-xl text-[clamp(1.5rem,2.4vw,2rem)] leading-tight font-bold tracking-[-0.02em] text-balance">
              Ou já me chama no WhatsApp.
            </h2>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-muted">
              Preenche as três linhas abaixo que eu abro a conversa com a
              mensagem montada. Do seu lado é só conferir e apertar enviar.
            </p>

            <div className="mt-10">
              <QuickMessage />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
