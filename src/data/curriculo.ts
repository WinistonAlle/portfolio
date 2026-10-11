import type { Localized } from '@/i18n/config';

/* O currículo em texto, para a dobra "Currículo" do Sobre mim. É o mesmo
   conteúdo do PDF (`CURRICULO_PDF` em config/site.ts): mudou o PDF, muda aqui.

   Ficam de fora, de propósito, o que a página já mostra em outro lugar: os
   contatos (página de contato) e as certificações (parede logo acima).

   O PDF só existe em português; a versão em inglês daqui é tradução dele. */

export type Curriculo = {
  resumo: string;
  habilidades: { rotulo: string; itens: string }[];
  experiencia: {
    cargo: string;
    empresa: string;
    periodo: string;
    nota?: string;
    pontos: string[];
  }[];
  projetos: { nome: string; estado?: string; texto: string; stack: string }[];
  formacao: { curso: string; onde: string; periodo: string }[];
  idiomas: { idioma: string; nivel: string }[];
};

/** 'AAAA-MM' da última revisão do PDF. Vira "outubro de 2026" na tela. */
export const CURRICULO_ATUALIZADO = '2026-10';
export const CURRICULO_PAGINAS = 2;

export const curriculo: Localized<Curriculo> = {
  pt: {
    resumo:
      'Desenvolvedor full-stack com sistemas em produção usados todos os dias em uma indústria de alimentos: portal de pedidos para cerca de 250 funcionários, PDV e totem de autoatendimento integrados ao ERP CIGAM e painel de monitoramento de sete sistemas. Foco em frontend (React, Next.js, TypeScript) e em IA aplicada e automação (RAG, OpenAI API, Claude API, n8n, MCP). Estudante de Engenharia de Software e sócio fundador da Coro Hub, empresa de automação com IA.',
    habilidades: [
      {
        rotulo: 'Frontend',
        itens:
          'React, Next.js, TypeScript, JavaScript, HTML, CSS, Tailwind CSS, Astro, React Native (Expo), Three.js, PWA',
      },
      { rotulo: 'Backend e dados', itens: 'Node.js, Python, PostgreSQL, Supabase' },
      {
        rotulo: 'IA e automação',
        itens:
          'OpenAI API, Claude (Anthropic API), Vercel AI SDK, RAG (embeddings e pgvector), MCP, n8n, Groq',
      },
      {
        rotulo: 'Infraestrutura e integrações',
        itens: 'Integração com ERP CIGAM, Docker, Linux/WSL, Vercel',
      },
      {
        rotulo: 'Sistemas e hardware',
        itens:
          'Linux (Ubuntu), macOS e Windows; conhecimento intermediário em montagem e manutenção de computadores',
      },
      { rotulo: 'Outras linguagens', itens: 'Noções de linguagem C' },
      { rotulo: 'Práticas', itens: 'Testes automatizados, Git, Scrum' },
    ],
    experiencia: [
      {
        cargo: 'Desenvolvedor de Sistemas',
        empresa: 'Gostinho Mineiro, indústria de alimentos · Brasília, DF',
        periodo: 'Nov/2025 – atual',
        nota: 'Estágio em TI até fev/2026, depois efetivado como desenvolvedor.',
        pontos: [
          'Responsável pelos sistemas internos da empresa: desenvolvimento, integração com o ERP CIGAM e manutenção, com React, TypeScript, Node.js e Supabase.',
          'Catálogo de Funcionários (portal de pedidos): substituiu pedidos enviados por WhatsApp e digitados um a um pelo faturamento. 363 pedidos desde abril/2026; 83 de 85 pedidos entraram sozinhos no ERP desde agosto/2026.',
          'PDV da loja: refeito para fechar a venda em poucos cliques, com preço e estoque vindos do CIGAM e a venda lançada de volta no ERP. 684 vendas em produção desde 14/08/2026 e 890 testes automatizados.',
          'Totem de autoatendimento (PWA): o cliente monta o pedido, que chega pronto para cobrança no PDV e vira documento no CIGAM. 178 produtos no catálogo, 177 conciliados com o ERP.',
          'Delivery (loja online): pedido montado pelo cliente e enviado pronto por WhatsApp, com painel administrativo e funil de desistência. 353 pedidos e 337 clientes desde abril/2026; 187 produtos vendidos por quilo ou pacote; Supabase hospedado no servidor da empresa.',
          'Painel de Operações: monitoramento de 7 sistemas com 71 checagens a cada 30 segundos, exibido em TV como escritório 3D (React, TypeScript, Three.js, Node).',
        ],
      },
      {
        cargo: 'Sócio Fundador, Head de Marketing, Design e Finanças',
        empresa: 'Coro Hub',
        periodo: 'Set/2026 – atual',
        pontos: [
          'Fundou, com sócios, empresa de automação e IA aplicada. Responsável por marca, conteúdo, design e finanças.',
          'Desenvolveu o site institucional da empresa em Astro, TypeScript, GSAP e WebGL.',
        ],
      },
      {
        cargo: 'Assistente Administrativo e Financeiro',
        empresa: 'Claritti, indústria de vidros e esquadrias',
        periodo: 'Jul/2023 – 2025',
        pontos: ['Atuou na rotina administrativa e financeira da empresa.'],
      },
    ],
    projetos: [
      {
        nome: 'Dashboard Financeiro',
        texto:
          'Painel de vendas para a diretoria com 138 meses de faturamento de três empresas e 18 análises comparativas, de Pareto 80/20 a coorte de retenção. Sistema real em uso; o portfólio exibe dados fictícios.',
        stack: 'React, Recharts, Python, Vite',
      },
      {
        nome: 'Estud.AI',
        estado: 'em desenvolvimento',
        texto:
          'App de estudos que transforma PDF em flashcards com IA e indica a hora certa de revisar cada um.',
        stack: 'Next.js, TypeScript, Supabase, Groq',
      },
      {
        nome: 'Chega Aí',
        estado: 'em desenvolvimento',
        texto:
          'Convite digital de festa com áudio, confirmação de presença e QR de portaria.',
        stack: 'Next.js, TypeScript, Supabase, Mercado Pago',
      },
      {
        nome: 'habit.exe',
        estado: 'em desenvolvimento',
        texto:
          'Habit tracker gamificado para desenvolvedores, com XP e moeda por hábito cumprido.',
        stack: 'Expo, React Native, TypeScript, Supabase',
      },
      {
        nome: 'Onboarding de clientes',
        texto:
          'Formulário e quadro de acompanhamento para clientes que contratam sites, com envio de fotos por link.',
        stack: 'Next.js, TypeScript, Supabase, Tailwind CSS',
      },
      {
        nome: 'Sites e landing pages para clientes',
        texto:
          'Mais de 10 projetos com foco em conversão de visita em orçamento via WhatsApp (por exemplo Aluplex e Alucraft).',
        stack: 'React, Astro, Next.js, JavaScript',
      },
      {
        nome: 'Portfólio',
        texto:
          'winiston.com.br, bilíngue (português e inglês), com 20 projetos documentados.',
        stack: 'Next.js, TypeScript, Three.js, Tailwind CSS',
      },
    ],
    formacao: [
      {
        curso: 'Bacharelado em Engenharia de Software',
        onde: 'Universidade Católica de Brasília (UCB)',
        periodo: 'Jul/2024 – em andamento',
      },
      { curso: 'Gestão Financeira', onde: 'Estácio', periodo: 'Início em jan/2023' },
    ],
    idiomas: [
      { idioma: 'Português', nivel: 'nativo' },
      { idioma: 'Inglês', nivel: 'intermediário' },
    ],
  },

  en: {
    resumo:
      'Full-stack developer with systems in production, used every day at a food manufacturer: an ordering portal for around 250 employees, a point of sale and a self-service kiosk integrated with the CIGAM ERP, and a monitoring dashboard covering seven systems. Focused on frontend (React, Next.js, TypeScript) and on applied AI and automation (RAG, OpenAI API, Claude API, n8n, MCP). Software Engineering student and co-founder of Coro Hub, an AI automation company.',
    habilidades: [
      {
        rotulo: 'Frontend',
        itens:
          'React, Next.js, TypeScript, JavaScript, HTML, CSS, Tailwind CSS, Astro, React Native (Expo), Three.js, PWA',
      },
      { rotulo: 'Backend and data', itens: 'Node.js, Python, PostgreSQL, Supabase' },
      {
        rotulo: 'AI and automation',
        itens:
          'OpenAI API, Claude (Anthropic API), Vercel AI SDK, RAG (embeddings and pgvector), MCP, n8n, Groq',
      },
      {
        rotulo: 'Infrastructure and integrations',
        itens: 'CIGAM ERP integration, Docker, Linux/WSL, Vercel',
      },
      {
        rotulo: 'Systems and hardware',
        itens:
          'Linux (Ubuntu), macOS and Windows; intermediate knowledge of building and maintaining computers',
      },
      { rotulo: 'Other languages', itens: 'Basics of C' },
      { rotulo: 'Practices', itens: 'Automated testing, Git, Scrum' },
    ],
    experiencia: [
      {
        cargo: 'Systems Developer',
        empresa: 'Gostinho Mineiro, food manufacturer · Brasília, Brazil',
        periodo: 'Nov 2025 – present',
        nota: 'IT intern until Feb 2026, then hired as a developer.',
        pontos: [
          "Owner of the company's internal systems: development, integration with the CIGAM ERP and maintenance, with React, TypeScript, Node.js and Supabase.",
          'Employee Catalog (ordering portal): replaced orders sent over WhatsApp and typed in one by one by billing. 363 orders since April 2026; 83 of 85 orders entered the ERP on their own since August 2026.',
          'Store point of sale: rebuilt to close a sale in a few clicks, with price and stock coming from CIGAM and the sale posted back to the ERP. 684 sales in production since Aug 14, 2026 and 890 automated tests.',
          'Self-service kiosk (PWA): the customer builds the order, which arrives ready for payment at the point of sale and becomes a document in CIGAM. 178 products in the catalog, 177 reconciled with the ERP.',
          'Delivery (online store): the customer builds the order and sends it ready over WhatsApp, with an admin panel and a drop-off funnel. 353 orders and 337 customers since April 2026; 187 products sold by the kilo or by the pack; Supabase hosted on the company server.',
          'Operations Dashboard: monitoring of 7 systems with 71 checks every 30 seconds, shown on a TV as a 3D office (React, TypeScript, Three.js, Node).',
        ],
      },
      {
        cargo: 'Co-founder, Head of Marketing, Design and Finance',
        empresa: 'Coro Hub',
        periodo: 'Sep 2026 – present',
        pontos: [
          'Founded, with partners, an automation and applied AI company. In charge of brand, content, design and finance.',
          "Built the company's website in Astro, TypeScript, GSAP and WebGL.",
        ],
      },
      {
        cargo: 'Administrative and Financial Assistant',
        empresa: 'Claritti, glass and window frame manufacturer',
        periodo: 'Jul 2023 – 2025',
        pontos: ["Worked on the company's administrative and financial routine."],
      },
    ],
    projetos: [
      {
        nome: 'Financial Dashboard',
        texto:
          'Sales dashboard for the board with 138 months of revenue from three companies and 18 comparative analyses, from Pareto 80/20 to retention cohorts. A real system in use; the portfolio shows fictional data.',
        stack: 'React, Recharts, Python, Vite',
      },
      {
        nome: 'Estud.AI',
        estado: 'in development',
        texto:
          'Study app that turns a PDF into flashcards with AI and tells you the right time to review each one.',
        stack: 'Next.js, TypeScript, Supabase, Groq',
      },
      {
        nome: 'Chega Aí',
        estado: 'in development',
        texto: 'Digital party invitation with audio, RSVP and a QR code for the door.',
        stack: 'Next.js, TypeScript, Supabase, Mercado Pago',
      },
      {
        nome: 'habit.exe',
        estado: 'in development',
        texto:
          'Gamified habit tracker for developers, with XP and coins for every habit completed.',
        stack: 'Expo, React Native, TypeScript, Supabase',
      },
      {
        nome: 'Client onboarding',
        texto:
          'Form and tracking board for clients who hire a website, with photo upload by link.',
        stack: 'Next.js, TypeScript, Supabase, Tailwind CSS',
      },
      {
        nome: 'Websites and landing pages for clients',
        texto:
          'More than 10 projects focused on turning a visit into a quote request over WhatsApp (Aluplex and Alucraft, for example).',
        stack: 'React, Astro, Next.js, JavaScript',
      },
      {
        nome: 'Portfolio',
        texto:
          'winiston.com.br, bilingual (Portuguese and English), with 20 documented projects.',
        stack: 'Next.js, TypeScript, Three.js, Tailwind CSS',
      },
    ],
    formacao: [
      {
        curso: "Bachelor's degree in Software Engineering",
        onde: 'Universidade Católica de Brasília (UCB)',
        periodo: 'Jul 2024 – in progress',
      },
      { curso: 'Financial Management', onde: 'Estácio', periodo: 'Started in Jan 2023' },
    ],
    idiomas: [
      { idioma: 'Portuguese', nivel: 'native' },
      { idioma: 'English', nivel: 'intermediate' },
    ],
  },
};
