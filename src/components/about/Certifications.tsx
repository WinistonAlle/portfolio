import { certifications } from '@/data/certifications';
import CertWall, { type WallItem } from './CertWall';

/* Certificações no fim da página Sobre mim, como uma parede de galeria: cada
   certificado é um quadro pendurado, com uma miniatura no estilo da
   instituição e uma plaquinha embaixo. Ideia tirada da foto de referência de
   quadros na parede que o usuário guardou.

   O servidor monta os textos (data por extenso no idioma da página) e o
   cliente só cuida do 3D e da entrada. */

type Labels = { title: string; newTab: string; view: string; prev: string; next: string; page: string };

export default function Certifications({ lang, labels }: { lang: 'pt' | 'en'; labels: Labels }) {
  const fmt = (locale: string, date: string) =>
    new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
      new Date(`${date}-01T00:00:00Z`),
    );

  const items: WallItem[] = certifications.map((c) => ({
    id: `${c.issuer}-${c.name}`,
    name: c.name,
    issuer: c.issuer,
    issued: fmt(lang === 'pt' ? 'pt-BR' : 'en-US', c.date),
    /* A miniatura imita o papel de verdade, então fala a língua do
       certificado e não a da página: Anthropic emite em inglês. */
    faceDate: fmt(c.issuer === 'Anthropic' ? 'en-US' : 'pt-BR', c.date),
    url: c.url,
  }));

  return (
    <section aria-labelledby="certificacoes" className="relative w-full pb-32">
      <div className="mx-auto w-full max-w-6xl px-6 lg:px-10">
        <h2
          id="certificacoes"
          className="flex items-baseline gap-3 text-[clamp(1.4rem,2.2vw,1.9rem)] leading-tight font-bold tracking-[-0.02em]"
        >
          {labels.title}
          <span className="font-mono text-xs font-normal tracking-normal text-muted tabular-nums">
            {String(items.length).padStart(2, '0')}
          </span>
        </h2>
      </div>

      <CertWall
        items={items}
        labels={{ newTab: labels.newTab, view: labels.view, prev: labels.prev, next: labels.next, page: labels.page }}
      />
    </section>
  );
}
