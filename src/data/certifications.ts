/* Certificações da página Sobre mim. Ficam fora do dicionário porque nome de
   curso e de instituição não se traduz: é o mesmo texto nos dois idiomas,
   igual nome de projeto e de tecnologia em projects.ts.

   `date` é ano-mês: ordena a lista e vira "outubro de 2026" no cartão.
   `url` é o link da credencial. Sem ele a linha aparece, mas não é clicável. */

export type Issuer = 'Anthropic' | 'Asimov Academy' | 'D2L';

export type Certification = {
  name: string;
  issuer: Issuer;
  /** 'AAAA-MM' */
  date: string;
  url?: string;
};

/** Sigla do selo de cada instituição no cartão da credencial. */
export const ISSUER_MARK: Record<Issuer, string> = {
  Anthropic: 'A',
  'Asimov Academy': 'AA',
  D2L: 'D2L',
};

const CERTIFICATIONS: Certification[] = [
  { name: 'Claude Academy: Introduction to Claude Cowork', issuer: 'Anthropic', date: '2026-10' },
  { name: 'Claude Academy: Claude Code 101', issuer: 'Anthropic', date: '2026-10' },
  { name: 'Claude Academy: Claude 101', issuer: 'Anthropic', date: '2026-10' },
  { name: 'Construindo sites profissionais com Astro', issuer: 'Asimov Academy', date: '2026-09' },
  { name: 'Fundamentos do Vibe Design', issuer: 'Asimov Academy', date: '2026-06' },
  { name: 'Masterclass Claude Code', issuer: 'Asimov Academy', date: '2026-06' },
  { name: 'Construindo sites profissionais com IA', issuer: 'Asimov Academy', date: '2026-06' },
  { name: 'Dominando o OpenClaw', issuer: 'Asimov Academy', date: '2026-05' },
  { name: 'Claude Desktop', issuer: 'Asimov Academy', date: '2026-05' },
  { name: 'Agente com ChatGPT', issuer: 'Asimov Academy', date: '2026-05' },
  { name: 'Certificação SCRUM', issuer: 'D2L', date: '2024-10' },
  { name: 'Conclusão TIC em trilhas: GIT', issuer: 'D2L', date: '2024-10' },
];

/** Mais recentes primeiro; empate mantém a ordem da lista acima. */
export const certifications = [...CERTIFICATIONS].sort((a, b) => b.date.localeCompare(a.date));
