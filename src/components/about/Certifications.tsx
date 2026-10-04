import TituloAcento from '@/components/text/TituloAcento';
import { certifications, type Issuer } from '@/data/certifications';
import CertificationsReveal from './CertificationsReveal';

/* Certificações no fim da página Sobre mim. Secundária aos projetos, então
   compacta: uma linha por instituição e os cursos como pílulas. Cada pílula
   com `url` abre a credencial em nova aba; sem `url` ela aparece, mas não é
   link (não existe link morto na página).

   Tudo aqui é servidor. O único pedaço de cliente é a entrada em cascata. */

type Labels = { eyebrow: string; title: string; newTab: string };

export default function Certifications({ lang, labels }: { lang: 'pt' | 'en'; labels: Labels }) {
  const monthYear = new Intl.DateTimeFormat(lang === 'pt' ? 'pt-BR' : 'en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });

  const issuers = [...new Set(certifications.map((c) => c.issuer))] as Issuer[];
  let i = 0;

  return (
    <section aria-labelledby="certificacoes" className="relative w-full pb-28">
      <div className="mx-auto w-full max-w-6xl px-6 lg:px-10">
        <p className="font-mono text-xs tracking-[0.18em] text-muted uppercase">
          {labels.eyebrow} · {certifications.length}
        </p>
        <h2
          id="certificacoes"
          className="mt-3 max-w-2xl text-[clamp(1.4rem,2.2vw,1.9rem)] leading-tight font-bold tracking-[-0.02em] text-balance"
        >
          <TituloAcento texto={labels.title} />
        </h2>

        <CertificationsReveal className="cert-groups mt-8 border-t border-line">
          {issuers.map((issuer) => {
            const list = certifications.filter((c) => c.issuer === issuer);
            return (
              <div
                key={issuer}
                className="grid grid-cols-1 gap-3 border-b border-line py-5 md:grid-cols-[11rem_minmax(0,1fr)] md:gap-8"
              >
                <h3 className="flex items-baseline gap-2 pt-1.5 font-display text-sm font-semibold">
                  {issuer}
                  <span className="font-mono text-[0.65rem] font-normal text-muted tabular-nums">
                    {list.length}
                  </span>
                </h3>
                <ul className="flex flex-wrap gap-2">
                  {list.map((c) => {
                    const body = (
                      <>
                        <span>{c.name}</span>
                        <span className="cert-pill__year font-mono text-[0.65rem] tabular-nums">
                          <span className="sr-only">, </span>
                          {c.date.slice(0, 4)}
                        </span>
                        {c.url && (
                          <>
                            <span aria-hidden="true" className="cert-pill__arrow">↗</span>
                            <span className="sr-only"> ({labels.newTab})</span>
                          </>
                        )}
                      </>
                    );
                    return (
                      <li key={c.name} className="cert-pill-item" style={{ ['--i' as string]: i++ }}>
                        {c.url ? (
                          <a
                            href={c.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={monthYear.format(new Date(`${c.date}-01T00:00:00Z`))}
                            className="cert-pill cert-pill--link"
                          >
                            {body}
                          </a>
                        ) : (
                          <span className="cert-pill">{body}</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </CertificationsReveal>
      </div>
    </section>
  );
}
