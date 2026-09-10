import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Projects from '@/components/Projects';
import { getDictionary } from '@/i18n';
import { isLocale } from '@/i18n/config';

export async function generateMetadata(
  props: PageProps<'/[lang]/projetos'>,
): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);

  return {
    title: dict.projects.metaTitle,
    description: dict.projects.metaDescription,
    /* O alternate aponta pra ESTA página no outro idioma, não pra capa.
       hreflang errado é pior que hreflang nenhum: diria ao buscador que a
       versão inglesa desta página é a home, e ele trataria as duas como
       conteúdo duplicado. */
    alternates: {
      languages: {
        'pt-BR': '/pt/projetos',
        en: '/en/projetos',
        'x-default': '/pt/projetos',
      },
    },
  };
}

export default async function ProjetosPage(
  props: PageProps<'/[lang]/projetos'>,
) {
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();

  return (
    <main className="relative z-10 flex-1">
      <Projects locale={lang} />
    </main>
  );
}
