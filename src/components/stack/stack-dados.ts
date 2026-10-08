/* Dados da stack, compartilhados pelo grafo (StackGraph, no computador) e
   pela lista (StackLista, no celular). Editar aqui muda os dois. */

/* =========================================================================
   CONFIGURAÇÃO DA STACK — é aqui que se edita o conteúdo do grafo.
   pillars: cor, profundidade, posição da etiqueta do grupo e leque das folhas.
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
  /* Cada pilar: onde fica a etiqueta do grupo (anchor, em unidades do
     desenho, y para baixo) e o leque das folhas em volta dela: `leque` é
     [direção central, abertura] em graus e `raio` a distância até a etiqueta.
     `depth` é a profundidade (negativo = mais perto de quem olha). O arranjo é
     desenhado, não simulado: é o que garante que nada se cobre. */
  pillars: {
    core: { color: '#f3f6ff', depth: -40, anchor: [0, 0], leque: [0, 0], raio: 0 },
    frontend: { color: '#5b9cff', depth: -70, anchor: [-225, -80], leque: [205, 130], raio: 138 },
    ai: { color: '#f0a94c', depth: -70, anchor: [195, -80], leque: [325, 160], raio: 165 },
    backend: { color: '#93a4b8', depth: 40, anchor: [-195, 120], leque: [125, 130], raio: 128 },
    infra: { color: '#7f8a99', depth: 40, anchor: [195, 120], leque: [55, 100], raio: 136 },
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
    /* A ordem é a do leque, de cima para baixo: rótulo curto no topo (onde os
       discos ficam lado a lado) e os compridos na lateral, com espaço livre. */
    { id: 'mcp', label: 'MCP', pillar: 'ai', r: 10 },
    { id: 'openai', label: 'OpenAI API', pillar: 'ai', r: 11 },
    { id: 'aisdk', label: 'Vercel AI SDK', pillar: 'ai', r: 12 },
    { id: 'claude', label: 'Claude / Anthropic API', pillar: 'ai', r: 15 },
    { id: 'rag', label: 'RAG · embeddings + pgvector', pillar: 'ai', r: 12 },
    { id: 'n8n', label: 'n8n', pillar: 'ai', r: 10 },

    { id: 'h-be', label: 'BACKEND & DADOS', pillar: 'backend', r: 8, hub: true },
    { id: 'node', label: 'Node.js', pillar: 'backend', r: 11, mobile: 'hide' },
    { id: 'python', label: 'Python', pillar: 'backend', r: 11, mobile: 'hide' },
    { id: 'pg', label: 'PostgreSQL', pillar: 'backend', r: 11, mobile: 'hide' },
    { id: 'supabase', label: 'Supabase', pillar: 'backend', r: 14 },

    {
      id: 'h-in',
      label: 'INFRA & INTEGRAÇÕES',
      pillar: 'infra',
      r: 7,
      hub: true,
      mobile: 'hide',
    },
    { id: 'docker', label: 'Docker', pillar: 'infra', r: 9.5, mobile: 'hide' },
    { id: 'linux', label: 'Linux / WSL', pillar: 'infra', r: 9.5, mobile: 'hide' },
    { id: 'erps', label: 'ERP CIGAM', pillar: 'infra', r: 9.5, mobile: 'hide' },
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
