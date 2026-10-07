/* Dados da stack, compartilhados pelo grafo (StackGraph, no computador) e
   pela lista (StackLista, no celular). Editar aqui muda os dois. */

/* =========================================================================
   CONFIGURAÇÃO DA STACK — é aqui que se edita o conteúdo do grafo.
   pillars: cor, profundidade (menor = mais perto da câmera), âncora do
            cluster e raio de distribuição das folhas.
   nodes:   { id, label, pillar, r (tamanho), hub, glow, mobile, note }
   edges:   [a, b] — hub↔folha e ligações cruzadas.
   Os ícones saem de /stack-icons/<id>.svg; sem arquivo, o nó cai no
   monograma de `mono`.
   ========================================================================= */
export const GRAPH = {
  iconDir: '/stack-icons/',
  mono: {
    w: 'W',
    react: 'R',
    next: 'N',
    ts: 'TS',
    tw: 'TW',
    claude: 'C',
    openai: 'AI',
    aisdk: 'SDK',
    rag: 'RAG',
    mcp: 'MCP',
    n8n: 'n8n',
    node: 'JS',
    python: 'Py',
    pg: 'PG',
    supabase: 'S',
    docker: 'D',
    linux: 'L',
    erps: 'ERP',
  },
  physics: {
    repulsion: 11000,
    spring: 0.014,
    springLength: 92,
    anchor: 0.014,
    damping: 0.86,
  },
  pillars: {
    core: { color: '#f3f6ff', depth: -60, anchor: [0, 0, 0], radius: 0 },
    frontend: {
      color: '#5b9cff',
      depth: -130,
      anchor: [-205, -95, -10],
      radius: 108,
    },
    ai: { color: '#f0a94c', depth: -130, anchor: [200, -62, -10], radius: 132 },
    backend: {
      color: '#93a4b8',
      depth: 40,
      anchor: [-145, 138, 20],
      radius: 96,
    },
    infra: { color: '#5f6873', depth: 190, anchor: [158, 152, 30], radius: 92 },
  },
  nodes: [
    /* noIcon: o centro é o monograma "W" de propósito, então nem tenta
       buscar arquivo (evita 404 no console). */
    { id: 'w', label: 'W', pillar: 'core', r: 25, glow: true, noIcon: true },

    { id: 'h-fe', label: 'FRONTEND', pillar: 'frontend', r: 9, hub: true },
    { id: 'react', label: 'React', pillar: 'frontend', r: 15 },
    { id: 'next', label: 'Next.js', pillar: 'frontend', r: 15 },
    { id: 'ts', label: 'TypeScript', pillar: 'frontend', r: 15 },
    { id: 'tw', label: 'Tailwind', pillar: 'frontend', r: 10 },

    { id: 'h-ai', label: 'IA & AUTOMAÇÃO', pillar: 'ai', r: 9, hub: true },
    { id: 'claude', label: 'Claude / Anthropic API', pillar: 'ai', r: 15 },
    { id: 'openai', label: 'OpenAI API', pillar: 'ai', r: 11 },
    { id: 'aisdk', label: 'Vercel AI SDK', pillar: 'ai', r: 12 },
    { id: 'rag', label: 'RAG · embeddings + pgvector', pillar: 'ai', r: 12 },
    { id: 'mcp', label: 'MCP', pillar: 'ai', r: 10 },
    { id: 'n8n', label: 'n8n', pillar: 'ai', r: 10 },

    { id: 'h-be', label: 'BACKEND & DADOS', pillar: 'backend', r: 8, hub: true },
    { id: 'node', label: 'Node.js', pillar: 'backend', r: 10, mobile: 'hide' },
    { id: 'python', label: 'Python', pillar: 'backend', r: 10, mobile: 'hide' },
    { id: 'pg', label: 'PostgreSQL', pillar: 'backend', r: 10, mobile: 'hide' },
    { id: 'supabase', label: 'Supabase', pillar: 'backend', r: 14 },

    {
      id: 'h-in',
      label: 'INFRA & INTEGRAÇÕES',
      pillar: 'infra',
      r: 7,
      hub: true,
      mobile: 'hide',
    },
    { id: 'docker', label: 'Docker', pillar: 'infra', r: 8, mobile: 'hide' },
    { id: 'linux', label: 'Linux / WSL', pillar: 'infra', r: 8, mobile: 'hide' },
    { id: 'erps', label: 'ERP CIGAM', pillar: 'infra', r: 8, mobile: 'hide' },
  ],
  edges: [
    ['w', 'h-fe'],
    ['w', 'h-ai'],
    ['w', 'h-be'],
    ['w', 'h-in'],
    ['h-fe', 'react'],
    ['h-fe', 'next'],
    ['h-fe', 'ts'],
    ['h-fe', 'tw'],
    ['h-ai', 'claude'],
    ['h-ai', 'openai'],
    ['h-ai', 'aisdk'],
    ['h-ai', 'rag'],
    ['h-ai', 'mcp'],
    ['h-ai', 'n8n'],
    ['h-be', 'node'],
    ['h-be', 'python'],
    ['h-be', 'pg'],
    ['h-be', 'supabase'],
    ['h-in', 'docker'],
    ['h-in', 'linux'],
    ['h-in', 'erps'],
    ['next', 'aisdk'],
    ['aisdk', 'openai'],
    ['aisdk', 'claude'],
    ['mcp', 'claude'],
    ['mcp', 'supabase'],
    ['rag', 'supabase'],
    ['rag', 'pg'],
    ['rag', 'python'],
    ['react', 'supabase'],
    ['supabase', 'pg'],
    ['node', 'docker'],
    ['n8n', 'docker'],
    ['n8n', 'erps'],
  ],
};
