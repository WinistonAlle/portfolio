import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import TituloAcento from '@/components/text/TituloAcento';
import CtaBlock from '@/components/ui/CtaBlock';
import GlowButton from '@/components/ui/GlowButton';
import { WHATSAPP_NUMBER } from '@/data/socials';
import { getDictionary } from '@/i18n';
import { isLocale, slugLocal } from '@/i18n/config';

/* Planos e preços. Em português mora em /pt/planos; em inglês o endereço é
   /en/plans, que chega nesta mesma pasta por reescrita (ver next.config e
   SLUGS_TRADUZIDOS). Página toda de servidor: o único pedaço interativo, as
   perguntas frequentes, é <details> nativo e não precisa de JavaScript. */

/* "R$ 1.200" vira moeda pequena e esmaecida + número grande: quem lê uma
   tabela de preço compara os números, não o símbolo repetido. */
function Preco({ valor }: { valor: string }) {
  const [moeda, ...resto] = valor.split(' ');
  return (
    <span className="preco">
      <span className="preco__moeda">{moeda}</span>
      {resto.join(' ')}
    </span>
  );
}

export async function generateMetadata(
  props: PageProps<'/[lang]/planos'>,
): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);

  return {
    title: dict.plans.metaTitle,
    description: dict.plans.metaDescription,
    openGraph: {
      title: dict.plans.metaTitle,
      description: dict.plans.metaDescription,
      url: `/${lang}/${slugLocal('planos', lang)}`,
    },
    alternates: {
      canonical: `/${lang}/${slugLocal('planos', lang)}`,
      languages: {
        'pt-BR': '/pt/planos',
        en: '/en/plans',
        'x-default': '/pt/planos',
      },
    },
  };
}

export default async function PlanosPage(props: PageProps<'/[lang]/planos'>) {
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();

  const t = (await getDictionary(lang)).plans;
  const whatsapp = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(t.whatsappMessage)}`;

  return (
    <main className="relative z-10 flex-1">
      {/* 1. Abertura */}
      <section className="mx-auto w-full max-w-7xl px-6 pt-28 pb-16 lg:px-10 lg:pt-40 lg:pb-24">
        <h1 className="max-w-3xl text-[clamp(2.2rem,4.6vw,3.6rem)] leading-[1.05] font-bold tracking-[-0.03em] text-balance">
          <TituloAcento texto={t.title} />
        </h1>
        <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted">{t.intro}</p>
      </section>

      {/* 2. Preço do site, pagamento único. Duas colunas no desktop: o título
          fica parado à esquerda enquanto a lista passa, e a lista ocupa só a
          largura que precisa (antes, nome e preço ficavam a 1.600px um do
          outro e o olho se perdia no meio). */}
      <section className="planos__bloco">
        <div className="planos__cabeca">
          <h2 className="planos__h2">{t.sitesTitle}</h2>
          <p className="planos__sub">{t.sitesText}</p>
          <p className="planos__rodape">{t.sitesNote}</p>
        </div>
        <ol className="planos__lista">
          {t.sites.map((s, i) => (
            <li key={s.nome} className="planos__linha">
              <span className="planos__indice" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="planos__nome">
                {s.nome}
                {'nota' in s && s.nota && <span className="planos__nota">{s.nota}</span>}
              </span>
              <span className="planos__preco">
                {'prefixo' in s && s.prefixo && (
                  <span className="planos__prefixo">{s.prefixo}</span>
                )}
                <Preco valor={s.preco} />
              </span>
            </li>
          ))}
        </ol>
      </section>

      {/* 3. Planos mensais: os dois lado a lado no desktop, empilhados no
          celular. O recomendado ganha a borda e o selo no azul de destaque. */}
      <section className="mx-auto w-full max-w-7xl px-6 pb-24 lg:px-10">
        <div className="planos__cabeca">
          <h2 className="planos__h2">{t.monthlyTitle}</h2>
          <p className="planos__sub">{t.monthlyText}</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {t.monthly.map((plano) => {
            const destaque = 'destaque' in plano && plano.destaque;
            return (
              <article
                key={plano.nome}
                className={`plano${destaque ? ' plano--destaque' : ''}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="plano__nome">{plano.nome}</h3>
                  {destaque && <span className="plano__selo">{t.recommended}</span>}
                </div>
                <p className="plano__preco">
                  <Preco valor={plano.preco} />
                  <span className="plano__mes">{t.perMonth}</span>
                </p>
                <ul className="plano__itens">
                  {plano.itens.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
        <p className="planos__rodape">{t.annualNote}</p>
      </section>

      {/* 4. Combos: mesma lista do preço do site. */}
      <section className="planos__bloco">
        <div className="planos__cabeca">
          <h2 className="planos__h2">
            <TituloAcento texto={t.combosTitle} />
          </h2>
          <p className="planos__sub">{t.combosText}</p>
        </div>
        <ol className="planos__lista">
          {t.combos.map((c, i) => (
            <li key={c.nome} className="planos__linha">
              <span className="planos__indice" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="planos__nome">{c.nome}</span>
              <span className="planos__preco">
                <Preco valor={c.entrada} />
                <span className="planos__mensal">{c.mensal}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      {/* 5. Perguntas frequentes */}
      <section className="mx-auto w-full max-w-7xl px-6 pb-28 lg:px-10">
        <div className="planos__cabeca">
          <h2 className="planos__h2">{t.faqTitle}</h2>
        </div>
        <div className="planos__faq">
          {t.faq.map((f) => (
            <details key={f.p} className="faq">
              <summary className="faq__pergunta">
                {f.p}
                <span className="faq__icone" aria-hidden="true" />
              </summary>
              <p className="faq__resposta">{f.r}</p>
            </details>
          ))}
        </div>
      </section>

      {/* 6. Fecho */}
      <section className="mx-auto w-full max-w-7xl px-6 pb-32 lg:px-10">
        <CtaBlock titulo={t.ctaTitle} texto={t.ctaText}>
          <GlowButton href={whatsapp} external>
            {t.ctaButton}
          </GlowButton>
        </CtaBlock>
      </section>
    </main>
  );
}
