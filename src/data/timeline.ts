export type TimelineEntry = {
  id: string;
  /** Usado no atributo datetime do <time>, formato AAAA-MM. */
  iso: string;
  month: string;
  year: string;
  role: string;
  place: string;
  line: string;
  /** Último ponto da linha: ganha o pulso de "ainda acontecendo". */
  current?: boolean;
};

export const TIMELINE: TimelineEntry[] = [
  {
    id: 'estacio',
    iso: '2023-01',
    month: 'Janeiro',
    year: '2023',
    role: 'Gestão Financeira',
    place: 'Estácio',
    line: 'Primeira graduação, na área financeira.',
  },
  {
    id: 'claritti',
    iso: '2023-07',
    month: 'Julho',
    year: '2023',
    role: 'Assistente administrativo e financeiro',
    place: 'Claritti, indústria de vidros e esquadrias',
    line: 'Primeiro emprego formal, na rotina administrativa e financeira.',
  },
  {
    id: 'ucb',
    iso: '2024-07',
    month: 'Julho',
    year: '2024',
    role: 'Engenharia de Software',
    place: 'Universidade Católica de Brasília',
    line: 'Troquei de área e recomecei a graduação, agora em software.',
  },
  {
    id: 'gm-estagio',
    iso: '2025-11',
    month: 'Novembro',
    year: '2025',
    role: 'Estágio em TI',
    place: 'Gostinho Mineiro, indústria de alimentos',
    line: 'Entrei como estagiário, cuidando dos sistemas internos da indústria.',
  },
  {
    id: 'gm-junior',
    iso: '2026-02',
    month: 'Fevereiro',
    year: '2026',
    role: 'Desenvolvedor júnior',
    place: 'Gostinho Mineiro',
    line: 'Efetivado. Hoje respondo pelos sistemas internos, incluindo o portal de pedidos usado por cerca de 250 funcionários todo dia.',
    current: true,
  },
];
