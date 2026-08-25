const PROJECTS = [
  {
    n: '01',
    name: 'Ecossistema Gostinho Mineiro',
    line: 'Quatro sistemas em produção numa rede de supermercados, todos conversando com um ERP legado: catálogo de funcionários, PDV, totem de loja e dashboard comercial.',
    tags: ['Next.js', 'Supabase', 'CIGAM', 'Postgres'],
    stat: '255 funcionários · 124 pedidos/mês no pico',
  },
  {
    n: '02',
    name: 'WMove',
    line: 'SaaS de gestão para locadoras de veículos: 18 telas, RLS multi-tenant, DRE e fluxo de caixa, billing com quatro planos.',
    tags: ['React', 'Supabase', 'RLS', 'Recharts'],
    stat: 'Produto completo, ponta a ponta',
  },
  {
    n: '03',
    name: 'habit.exe',
    line: 'Habit tracker com estética pixel art 8-bit — o avatar evolui junto com os hábitos, num diorama isométrico montado sprite a sprite.',
    tags: ['Expo', 'React Native', 'TypeScript', 'Jest'],
    stat: '104 testes verdes · web e mobile',
  },
  {
    n: '04',
    name: "King's Table",
    line: 'App de home game de poker para iOS: relógio de blinds, ranking com pódio, criação de torneio em quatro passos.',
    tags: ['Expo Router', 'Zustand', 'Supabase'],
    stat: 'iOS primeiro, web depois',
  },
];

export default function Projects() {
  return (
    <section
      id="projetos"
      className="relative mx-auto w-full max-w-7xl px-6 py-28 lg:px-10"
    >
      <p className="label">Projetos</p>
      <h2 className="mt-4 max-w-3xl text-[clamp(1.9rem,3.6vw,2.9rem)] leading-tight font-bold tracking-[-0.02em] text-balance">
        Quatro que valem ser lidos por inteiro.
      </h2>

      <ul className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-2">
        {PROJECTS.map((p) => (
          <li
            key={p.n}
            className="group bg-background p-8 transition-colors hover:bg-surface"
          >
            <div className="flex items-baseline gap-4">
              <span className="font-mono text-xs text-accent">{p.n}</span>
              <h3 className="text-xl font-semibold tracking-[-0.01em]">
                {p.name}
              </h3>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted">{p.line}</p>
            <p className="mt-5 font-mono text-xs text-foreground/70">
              {p.stat}
            </p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {p.tags.map((t) => (
                <li
                  key={t}
                  className="rounded-full border border-line px-3 py-1 font-mono text-[0.65rem] text-muted"
                >
                  {t}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      <p className="label mt-10">Estudos de caso completos em construção</p>
    </section>
  );
}
