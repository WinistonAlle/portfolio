import TransitionLink from '@/components/transition/TransitionLink';
import BorderGlow from '@/components/ui/BorderGlow';
import type { Project } from '@/data/projects';

/* Card da grade de /projetos. O card é a chamada; o texto inteiro mora na
 * página do projeto.
 *
 * A capa usa o print quando ele existe. Enquanto não existe, em vez de um
 * retângulo cinza vazio, ela mostra o número do projeto em corpo enorme e
 * vazado: sem imagem o card continua tendo hierarquia visual, e a grade não
 * fica com buracos até os prints chegarem.
 */
function Cover({ project }: { project: Project }) {
  if (project.media.src) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={project.media.src}
        alt={project.media.alt}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className="flex h-full w-full items-center justify-center bg-surface"
    >
      <span className="font-mono text-[clamp(3rem,7vw,5rem)] leading-none font-bold text-foreground/[0.07]">
        {project.n}
      </span>
    </div>
  );
}

/* Paleta do brilho: os três azuis do próprio site em vez do roxo/rosa que o
   componente traz de fábrica, senão a borda acende numa cor que não existe em
   nenhum outro lugar da página. O `glowColor` é o `--accent` em HSL. */
const GLOW_COLORS = ['#5b9cff', '#7de2ff', '#8f8cff'];
const ACCENT_HSL = '216 100 68';

export default function ProjectCard({ project }: { project: Project }) {
  return (
    /* O -translate no hover é o que faz o card parecer um objeto solto na
       página, e não uma área clicável do fundo. A borda e o fundo agora são
       do BorderGlow, que precisa deles pra montar o recorte do brilho. */
    <li className="group transition-transform duration-300 hover:-translate-y-1">
      <BorderGlow
        borderRadius={16}
        backgroundColor="#05070e"
        colors={GLOW_COLORS}
        glowColor={ACCENT_HSL}
        glowIntensity={1.6}
        glowRadius={38}
        /* Sem a varredura de entrada: ela animava máscara cônica com
           mix-blend-mode em todos os cards ao mesmo tempo, e a página
           engasgava ao abrir. O brilho no hover fica, porque esse só roda
           quando o cursor está sobre um card, um de cada vez. */
      >
        <TransitionLink
          href={`/projetos/${project.slug}`}
          className="flex h-full flex-col outline-none focus-visible:bg-surface"
        >
          <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-line">
            <Cover project={project} />

            {/* Selo só nos projetos que ainda não estão no ar. A linha de
                status em todo card era ruído, mas "em desenvolvimento" muda
                como a pessoa lê o que está vendo, e precisa aparecer antes
                do clique. */}
            {project.status !== 'No ar' && (
              <span className="absolute top-3 left-3 rounded-full border border-white/20 bg-background/75 px-3 py-1 font-mono text-[0.6rem] tracking-[0.18em] text-foreground/85 uppercase backdrop-blur-sm">
                {project.status}
              </span>
            )}
          </div>

          <div className="flex flex-1 flex-col p-8">
            {/* Sem a linha de número, status e contexto: o card abre no nome do
              projeto. Os mesmos dados aparecem melhor como fato dentro do
              texto do que como etiqueta antes dele. */}
            <h2 className="text-xl font-semibold tracking-[-0.01em]">
              {project.name}
            </h2>

            <p className="mt-4 text-sm leading-relaxed text-muted">
              {project.line}
            </p>

            <ul className="mt-5 flex flex-wrap gap-2">
              {project.tags.slice(0, 4).map((t) => (
                <li
                  key={t}
                  className="rounded-full border border-line px-3 py-1 font-mono text-[0.65rem] text-muted"
                >
                  {t}
                </li>
              ))}
            </ul>

            {/* mt-auto: o "ver projeto" desce pro pé do card, então cards de
              alturas diferentes na mesma linha terminam alinhados. */}
            <span className="mt-auto inline-flex items-center gap-2 pt-7 font-mono text-[0.65rem] tracking-[0.22em] text-muted uppercase transition-colors group-hover:text-accent">
              Ver projeto
              <span
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-1"
              >
                →
              </span>
            </span>
          </div>
        </TransitionLink>
      </BorderGlow>
    </li>
  );
}
