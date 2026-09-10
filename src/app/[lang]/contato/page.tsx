import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SocialCubes from '@/components/socials/SocialCubes';
import QuickMessage from '@/components/contact/QuickMessage';
import { getDictionary } from '@/i18n';
import { isLocale } from '@/i18n/config';

export async function generateMetadata(
  props: PageProps<'/[lang]/contato'>,
): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);

  return {
    title: dict.contact.metaTitle,
    description: dict.contact.metaDescription,
    alternates: {
      languages: {
        'pt-BR': '/pt/contato',
        en: '/en/contato',
        'x-default': '/pt/contato',
      },
    },
  };
}

export default async function ContatoPage(
  props: PageProps<'/[lang]/contato'>,
) {
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <main className="relative z-10 flex-1">
      {/* items-start, não center: os cubos ficam no alto da coluna da direita,
          alinhados com o começo do texto. Centralizados, eles desciam para o
          meio do bloco e o W perdia o encaixe com o título. */}
      <section className="mx-auto grid w-full max-w-7xl grid-cols-1 items-start gap-14 px-6 pt-28 pb-24 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12 lg:px-10 lg:pt-40">
        <div>
          <h1 className="text-[clamp(2.2rem,4.6vw,3.4rem)] leading-[1.05] font-bold tracking-[-0.03em] text-balance">
            {dict.contact.titleStart}
            <span className="text-muted">{dict.contact.titleEnd}</span>
          </h1>

          <p className="mt-7 max-w-md text-lg leading-relaxed text-muted">
            {dict.contact.intro}
          </p>
        </div>

        {/* O SVG ocupa a largura da coluna, então é a coluna que dita o
            tamanho dos cubos. */}
        <div>
          <SocialCubes greeting={dict.contact.whatsappGreeting} />
        </div>
      </section>

      {/* Segunda seção: para quem já chegou decidido e não quer trocar de app
          antes de escrever. */}
      <section className="relative w-full pb-32">
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
          <div className="border-t border-line pt-14">
            <h2 className="max-w-xl text-[clamp(1.5rem,2.4vw,2rem)] leading-tight font-bold tracking-[-0.02em] text-balance">
              {dict.contact.quickTitle}
            </h2>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-muted">
              {dict.contact.quickText}
            </p>

            <div className="mt-10">
              <QuickMessage t={dict.contact.form} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
