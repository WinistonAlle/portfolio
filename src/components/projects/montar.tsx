import ProjectCard from '@/components/projects/ProjectCard';
import type { Aba, Item } from '@/components/projects/ProjectGrid';
import { PROJECTS, PROJECT_GROUPS } from '@/data/projects';
import { getDictionary } from '@/i18n';
import type { Locale } from '@/i18n/config';

/* As gavetas e os cards são montados AQUI, no servidor, e vão pro filtro já
   prontos. É o que mantém o texto dos cases fora do bundle do navegador; a
   razão longa está no comentário do ProjectGrid.

   Este arquivo saiu de dentro do Projects.tsx quando a home passou a mostrar
   projetos em destaque: as duas telas precisam dos MESMOS cards, e duas cópias
   da montagem é como um card ganha rótulo diferente em cada lugar. */

type Dict = Awaited<ReturnType<typeof getDictionary>>;

/* Só entram gavetas com projeto dentro: a lista cresce um projeto por vez e um
   filtro que devolve grade vazia é um botão que só serve pra frustrar. */
export function montarAbas(dict: Dict): Aba[] {
  const usadas = PROJECT_GROUPS.filter((g) =>
    PROJECTS.some((p) => p.groups.includes(g)),
  );
  /* A CHAVE do filtro é o rótulo traduzido, e não o identificador da gaveta:
     o estado do filtro vive no cliente e só precisa casar consigo mesmo. Assim
     o componente de cliente não conhece nem o tipo ProjectGroup, e continua
     sem nenhuma linha de import apontando pro módulo dos projetos. */
  return [
    { chave: dict.projects.filterAll, total: PROJECTS.length },
    ...usadas.map((g) => ({
      chave: dict.projects.groups[g],
      total: PROJECTS.filter((p) => p.groups.includes(g)).length,
    })),
  ];
}

/**
 * Cards já renderizados, do mais recente para o mais antigo.
 *
 * `limite` existe para a home, que mostra um recorte. A ordem é invertida de
 * propósito: `PROJECTS` cresce por acréscimo no fim, então os seis primeiros da
 * lista crua seriam sempre os seis mais antigos — a home mostraria para sempre
 * o trabalho de 2024.
 */
export function montarItens(dict: Dict, locale: Locale, limite?: number): Item[] {
  const lista = limite ? [...PROJECTS].reverse().slice(0, limite) : PROJECTS;
  return lista.map((project) => ({
    slug: project.slug,
    grupos: project.groups.map((g) => dict.projects.groups[g]),
    card: (
      <ProjectCard
        project={project}
        locale={locale}
        cardCta={dict.projects.cardCta}
        statusWip={dict.project.statusWip}
      />
    ),
  }));
}

/** Quantos projetos existem, para a home dizer "ver os N" sem chutar. */
export const TOTAL_PROJETOS = PROJECTS.length;
