import GlowButton from '@/components/ui/GlowButton';
import { CURRICULO_PDF } from '@/config/site';
import { curriculo, CURRICULO_ATUALIZADO, CURRICULO_PAGINAS } from '@/data/curriculo';
import CurriculoDobra from './CurriculoDobra';

/* Currículo no Sobre mim: uma folha discreta que mostra o resumo e, por um
   botão, se abre com o resto. Quem só quer o arquivo tem o botão de baixar no
   cabeçalho da seção, sempre à vista.

   O servidor escreve a folha inteira; o cliente (CurriculoDobra) só abre e
   fecha. O texto vem de data/curriculo.ts, que espelha o PDF. */

type Labels = {
  title: string;
  meta: string;
  download: string;
  open: string;
  close: string;
  role: string;
  summary: string;
  skills: string;
  experience: string;
  projects: string;
  education: string;
  languages: string;
};

/** Seta de baixar: desce para a bandeja. */
export function IconeBaixar() {
  return (
    <svg aria-hidden="true" viewBox="0 0 14 14" className="cv-baixar">
      <path className="cv-baixar__seta" d="M7 1.5v7.5M3.8 6.2 7 9.4l3.2-3.2" />
      <path d="M2 12.2h10" />
    </svg>
  );
}

function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="cv__bloco">
      <h3 className="cv__rotulo label">{titulo}</h3>
      <div className="cv__conteudo">{children}</div>
    </section>
  );
}

export default function Curriculo({ lang, labels }: { lang: 'pt' | 'en'; labels: Labels }) {
  const cv = curriculo[lang];

  const atualizado = new Intl.DateTimeFormat(lang === 'pt' ? 'pt-BR' : 'en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${CURRICULO_ATUALIZADO}-01T00:00:00Z`));

  const meta = labels.meta
    .replace('{paginas}', String(CURRICULO_PAGINAS))
    .replace('{data}', atualizado);

  return (
    <section aria-labelledby="curriculo" className="relative w-full pb-32">
      <div className="mx-auto w-full max-w-6xl px-6 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
          <div>
            <h2
              id="curriculo"
              className="text-[clamp(1.4rem,2.2vw,1.9rem)] leading-tight font-bold tracking-[-0.02em]"
            >
              {labels.title}
            </h2>
            <p className="mt-2 font-mono text-xs text-muted">{meta}</p>
          </div>

          <GlowButton href={CURRICULO_PDF} external tintOpacity={0.22}>
            {labels.download}
            <IconeBaixar />
          </GlowButton>
        </div>

        <div className="cv mt-8">
          <header className="cv__topo">
            <p className="cv__nome">Winiston Alle</p>
            <p className="cv__cargo">{labels.role}</p>
          </header>

          <Bloco titulo={labels.summary}>
            <p className="cv__texto">{cv.resumo}</p>
          </Bloco>

          <CurriculoDobra abrir={labels.open} fechar={labels.close}>
            <Bloco titulo={labels.experience}>
              <ol className="cv__lista">
                {cv.experiencia.map((e) => (
                  <li key={e.cargo} className="cv__item">
                    <div className="cv__cabeca">
                      <p className="cv__titulo">{e.cargo}</p>
                      <p className="cv__periodo">{e.periodo}</p>
                    </div>
                    <p className="cv__sub">{e.empresa}</p>
                    {e.nota && <p className="cv__nota">{e.nota}</p>}
                    <ul className="cv__pontos">
                      {e.pontos.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>
            </Bloco>

            <Bloco titulo={labels.skills}>
              <dl className="cv__pares">
                {cv.habilidades.map((h) => (
                  <div key={h.rotulo} className="cv__par">
                    <dt>{h.rotulo}</dt>
                    <dd>{h.itens}</dd>
                  </div>
                ))}
              </dl>
            </Bloco>

            <Bloco titulo={labels.projects}>
              <ul className="cv__lista">
                {cv.projetos.map((p) => (
                  <li key={p.nome} className="cv__item">
                    <div className="cv__cabeca">
                      <p className="cv__titulo">
                        {p.nome}
                        {p.estado && <span className="cv__estado">{p.estado}</span>}
                      </p>
                    </div>
                    <p className="cv__texto cv__texto--item">{p.texto}</p>
                    <p className="cv__stack">{p.stack}</p>
                  </li>
                ))}
              </ul>
            </Bloco>

            <Bloco titulo={labels.education}>
              <ul className="cv__lista">
                {cv.formacao.map((f) => (
                  <li key={f.curso} className="cv__item">
                    <div className="cv__cabeca">
                      <p className="cv__titulo">{f.curso}</p>
                      <p className="cv__periodo">{f.periodo}</p>
                    </div>
                    <p className="cv__sub">{f.onde}</p>
                  </li>
                ))}
              </ul>
            </Bloco>

            <Bloco titulo={labels.languages}>
              <dl className="cv__pares">
                {cv.idiomas.map((i) => (
                  <div key={i.idioma} className="cv__par">
                    <dt>{i.idioma}</dt>
                    <dd>{i.nivel}</dd>
                  </div>
                ))}
              </dl>
            </Bloco>
          </CurriculoDobra>
        </div>
      </div>
    </section>
  );
}
