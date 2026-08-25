import LanyardBadge from './lanyard/LanyardBadge';

const STACK = ['TypeScript', 'React', 'Next.js', 'Supabase', 'Postgres', 'Expo'];

export default function Hero() {
  return (
    <section className="ambient relative isolate overflow-hidden">
      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-8 px-6 pt-24 pb-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-4 lg:px-10 lg:pt-16 lg:pb-24">
        {/* ---------------------------------------------------------- copy */}
        <div className="max-w-2xl">
          <p className="label flex items-center gap-2.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            Disponível para novos projetos
          </p>

          <h1 className="mt-6 text-[clamp(2.5rem,6vw,4.25rem)] leading-[1.03] font-bold tracking-[-0.03em] text-balance">
            Software que entra em produção
            <span className="text-muted"> — e continua rodando.</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
            Sou <span className="text-foreground">Winiston Alle</span>, desenvolvedor
            full-stack. Construo sistemas de ponta a ponta — catálogo interno para 255
            funcionários, PDV integrado a um ERP legado, SaaS multi-tenant. Nenhum
            deles é demonstração: estão no ar, com gente usando todo dia.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <a
              href="#projetos"
              className="rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-transform hover:-translate-y-0.5"
            >
              Ver os projetos
            </a>
            <a
              href="mailto:dev.winiston@gmail.com"
              className="rounded-full border border-line px-6 py-3 text-sm font-semibold transition-colors hover:border-accent hover:text-accent"
            >
              Falar comigo
            </a>
          </div>

          <ul className="mt-12 flex flex-wrap gap-x-5 gap-y-2 border-t border-line pt-6">
            {STACK.map((tech) => (
              <li key={tech} className="font-mono text-xs text-muted">
                {tech}
              </li>
            ))}
          </ul>
        </div>

        {/* -------------------------------------------------------- badge */}
        <div className="relative h-[62vh] min-h-[420px] lg:h-[86vh]">
          <LanyardBadge />
          <p className="label pointer-events-none absolute inset-x-0 bottom-2 text-center">
            arraste o crachá
          </p>
        </div>
      </div>
    </section>
  );
}
