/* Estrutura da trajetória. O TEXTO de cada ponto (mês, cargo, lugar e a
   frase) vive no dicionário, indexado por este mesmo `id`: aqui fica só o que
   não muda com o idioma. Data em ISO, ano em número e a marca do ponto atual
   são iguais em português e em inglês. */

export type TimelineEntry = {
  id: string;
  /** Usado no atributo datetime do <time>, formato AAAA-MM. */
  iso: string;
  year: string;
  /** Último ponto da linha: ganha o pulso de "ainda acontecendo". */
  current?: boolean;
};

export const TIMELINE: TimelineEntry[] = [
  { id: 'estacio', iso: '2023-01', year: '2023' },
  { id: 'claritti', iso: '2023-07', year: '2023' },
  { id: 'ucb', iso: '2024-07', year: '2024' },
  { id: 'gm-estagio', iso: '2025-11', year: '2025' },
  { id: 'gm-junior', iso: '2026-02', year: '2026', current: true },
];
