import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/config/site';
import { PROJECTS } from '@/data/projects';
import { HTML_LANG, LOCALES } from '@/i18n/config';

/* Todas as páginas, nos dois idiomas. Cada entrada aponta para a irmã no
   outro idioma (hreflang), que é o que diz ao buscador que /pt/x e /en/x são
   a mesma página traduzida e não conteúdo duplicado. */
const ROTAS = ['', '/sobre-mim', '/projetos', '/contato', ...PROJECTS.map((p) => `/projetos/${p.slug}`)];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROTAS.flatMap((rota) =>
    LOCALES.map((lang) => ({
      url: `${SITE_URL}/${lang}${rota}`,
      changeFrequency: rota === '' || rota === '/projetos' ? ('weekly' as const) : ('monthly' as const),
      priority: rota === '' ? 1 : rota.startsWith('/projetos/') ? 0.6 : 0.8,
      alternates: {
        languages: Object.fromEntries(LOCALES.map((l) => [HTML_LANG[l], `${SITE_URL}/${l}${rota}`])),
      },
    })),
  );
}
