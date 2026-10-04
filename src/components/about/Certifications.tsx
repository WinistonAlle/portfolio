import TituloAcento from '@/components/text/TituloAcento';
import { certifications, ISSUER_MARK, type Issuer } from '@/data/certifications';
import CertificationsIndex, { type CertItem } from './CertificationsIndex';

/* Certificações no fim da página Sobre mim. Continua secundária aos projetos
   (vem depois da trajetória e usa título menor que o das outras seções), mas
   tem a mesma linguagem do resto da página: índice numerado, filtro igual ao
   de /projetos e um cartão de credencial que acompanha o cursor, primo do
   crachá lá do topo.

   O servidor monta os textos (data por extenso no idioma da página) e o
   cliente só cuida da interação. */

type Labels = {
  eyebrow: string;
  title: string;
  all: string;
  filterLabel: string;
  issuedIn: string;
  verify: string;
  newTab: string;
  countOne: string;
  countMany: string;
};

export default function Certifications({ lang, labels }: { lang: 'pt' | 'en'; labels: Labels }) {
  const monthYear = new Intl.DateTimeFormat(lang === 'pt' ? 'pt-BR' : 'en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });

  const items: CertItem[] = certifications.map((c, i) => ({
    id: `${c.issuer}-${c.name}`,
    n: String(i + 1).padStart(2, '0'),
    name: c.name,
    issuer: c.issuer,
    mark: ISSUER_MARK[c.issuer],
    year: c.date.slice(0, 4),
    issued: monthYear.format(new Date(`${c.date}-01T00:00:00Z`)),
    url: c.url,
  }));

  const issuers = [...new Set(certifications.map((c) => c.issuer))] as Issuer[];
  const tabs = [
    { key: 'all', label: labels.all, total: items.length },
    ...issuers.map((issuer) => ({
      key: issuer,
      label: issuer,
      total: items.filter((i) => i.issuer === issuer).length,
    })),
  ];

  return (
    <section aria-labelledby="certificacoes" className="relative w-full pb-28">
      <div className="mx-auto w-full max-w-6xl px-6 lg:px-10">
        <p className="font-mono text-xs tracking-[0.18em] text-muted uppercase">
          {labels.eyebrow}
        </p>
        <h2
          id="certificacoes"
          className="mt-3 max-w-2xl text-[clamp(1.4rem,2.2vw,1.9rem)] leading-tight font-bold tracking-[-0.02em] text-balance"
        >
          <TituloAcento texto={labels.title} />
        </h2>

        <CertificationsIndex
          items={items}
          tabs={tabs}
          labels={{
            filterLabel: labels.filterLabel,
            issuedIn: labels.issuedIn,
            verify: labels.verify,
            newTab: labels.newTab,
            countOne: labels.countOne,
            countMany: labels.countMany,
          }}
        />
      </div>
    </section>
  );
}
