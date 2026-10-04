import { certifications, type Certification } from '@/data/certifications';

/* Certificações no fim da página Sobre mim. É camada extra de informação, não
   destaque: lista em duas colunas, letra menor que o resto da página, linha
   fina entre os itens, cara de ficha técnica. Server component, não manda JS.

   A linha inteira é o link da credencial (sem botão de "exibir"). Item sem
   `url` aparece igual, só que não clicável. */

type Labels = {
  title: string;
  /** Texto só para leitor de tela, avisando que o link abre outra aba. */
  newTab: string;
};

function Row({ cert, newTab }: { cert: Certification; newTab: string }) {
  const year = cert.date.slice(0, 4);
  const content = (
    <>
      <span className="min-w-0">
        <span className="block text-pretty text-foreground/90 transition-colors group-hover:text-foreground">
          {cert.name}
        </span>
        <span className="block text-xs text-muted">{cert.issuer}</span>
      </span>
      <span className="flex shrink-0 items-center gap-2 font-mono text-xs text-muted tabular-nums">
        {year}
        {cert.url && (
          <span
            aria-hidden="true"
            className="text-accent opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
          >
            ↗
          </span>
        )}
      </span>
    </>
  );

  const rowClass = 'flex items-center justify-between gap-4 py-3 text-sm';

  if (!cert.url) {
    return <div className={rowClass}>{content}</div>;
  }

  return (
    <a
      href={cert.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group ${rowClass} -mx-2 rounded-md px-2 transition-colors hover:bg-surface focus-visible:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent`}
    >
      {content}
      <span className="sr-only"> ({newTab})</span>
    </a>
  );
}

export default function Certifications({ labels }: { labels: Labels }) {
  /* Em duas colunas a lista desce pela esquerda e continua na direita, como
     uma ficha. Sem isso o grid preenche por linha e a ordem por data fica
     alternando de um lado pro outro. A ordem do HTML continua a mesma da tela. */
  const rows = Math.ceil(certifications.length / 2);

  return (
    <section aria-labelledby="certificacoes" className="relative w-full pb-28">
      <div className="mx-auto w-full max-w-6xl px-6 lg:px-10">
        <h2
          id="certificacoes"
          className="font-mono text-xs tracking-[0.18em] text-muted uppercase"
        >
          {labels.title}
          <span aria-hidden="true"> · </span>
          <span className="tabular-nums">{certifications.length}</span>
        </h2>

        <ul
          className="mt-5 grid grid-cols-1 gap-x-12 md:grid-flow-col md:grid-cols-2 md:grid-rows-[repeat(var(--rows),auto)]"
          style={{ '--rows': rows } as React.CSSProperties}
        >
          {certifications.map((cert) => (
            <li key={`${cert.issuer}-${cert.name}`} className="border-b border-line">
              <Row cert={cert} newTab={labels.newTab} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
