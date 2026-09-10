/* Projetos escritos mas ainda sem case e sem print.
 *
 * Este arquivo não é importado por nada: nada daqui vai pro bundle nem
 * aparece no site. Ele existe porque o texto de cada projeto já está pronto,
 * e apagar isso do `projects.ts` perderia o trabalho.
 *
 * Fluxo: quando um projeto for detalhado (print, vídeo, `problem` e
 * `solution`), a entrada dele sai daqui, ganha o `n` da vez e entra no
 * `PROJECTS` de `projects.ts`.
 */

import type { Project } from './projects';

export const BACKLOG: Project[] = [
  {
    n: '01',
    slug: 'portal-de-pedidos',
    name: 'Portal de pedidos do funcionário',
    status: 'Em produção',
    context: 'Gostinho Mineiro',
    line: 'Cerca de 250 funcionários fazem o pedido do mês pelo celular, e ele entra sozinho no ERP da empresa.',
    body: 'Antes o pedido chegava por WhatsApp e alguém do faturamento digitava um por um no CIGAM. Hoje o funcionário monta o pedido no catálogo, o sistema respeita o corte das 13h40, gera em PDF a lista que a portaria usa pra liberar a mercadoria e lança o recibo direto no ERP. O RH também consegue liberar um pedido atrasado pra sair no mesmo dia, uma regra que antes vivia fora do sistema, em recado de voz.',
    stat: [
      '~250 funcionários',
      '157 testes verdes',
      'Lançamento no ERP via REST',
    ],
    tags: ['React', 'Vite', 'Supabase', 'CIGAM', 'pm2'],
    media: {
      frame: 'mobile',
      src: '',
      alt: 'Tela do portal de pedidos no celular, com o catálogo de produtos',
    },
  },
  {
    n: '02',
    slug: 'pdv',
    name: 'PDV da loja',
    status: 'Em produção',
    context: 'Gostinho Mineiro',
    line: 'O caixa da loja: venda, cupom impresso e nota fiscal emitida no ERP, tudo na mesma tela.',
    body: 'Frontend React e backend Express rodando na rede da própria loja, imprimindo direto nas térmicas por CUPS. Tem abertura e fechamento de caixa com relatório de conferência pro financeiro, transferência interna entre unidades e venda para parceiro com boleto. Cada mudança aqui tem consequência no mesmo dia: é venda real, impressora real e pedido real dentro do CIGAM.',
    stat: [
      'Em uso diário no balcão',
      'Impressão térmica por CUPS',
      'NF emitida no ERP',
    ],
    tags: ['React', 'Express', 'TypeScript', 'Postgres', 'CUPS/IPP'],
    media: {
      frame: 'desktop',
      src: '',
      alt: 'Tela de venda do PDV com os itens do cupom',
    },
  },
  {
    n: '03',
    slug: 'totem',
    name: 'Totem de autoatendimento',
    status: 'Em produção',
    context: 'Gostinho Mineiro',
    line: 'Totem de pedidos na loja, com o lançamento no ERP trocado de robô de navegador para API.',
    body: 'O checkout dependia de um robô que preenchia as telas do ERP na unha e quebrava a cada mudança de layout. Reescrevi o lançamento em cima da API REST do CIGAM, com nota fiscal real emitida na série da loja, e aposentei o robô. Os 162 produtos do catálogo foram casados um a um com os códigos do ERP por um script de matching.',
    stat: [
      '162 produtos mapeados',
      'Robô de navegador aposentado',
      'PWA em tablet',
    ],
    tags: ['React', 'Vite', 'Supabase', 'PWA', 'CIGAM'],
    media: {
      frame: 'desktop',
      src: '',
      alt: 'Tela do totem com a grade de produtos',
    },
  },
  {
    n: '04',
    slug: 'varejo',
    name: 'Varejo e delivery',
    status: 'No ar',
    context: 'Gostinho Mineiro',
    line: 'A loja online da empresa, servida pelo servidor da própria casa.',
    body: 'Catálogo, carrinho e um painel administrativo pra equipe cadastrar produto e trocar foto sem depender de mim. Roda no servidor da empresa, com Supabase self-hosted e Nginx na frente.',
    stat: [
      'No ar em varejo.gostinhomineiro.com',
      'Supabase self-hosted',
      'Painel admin próprio',
    ],
    tags: ['React', 'Vite', 'Express', 'Supabase', 'Nginx'],
    media: {
      frame: 'desktop',
      src: '',
      alt: 'Vitrine da loja online com os produtos',
    },
    links: [
      { label: 'Abrir a loja', href: 'https://varejo.gostinhomineiro.com' },
    ],
  },
  {
    n: '05',
    slug: 'wmove',
    name: 'WMove',
    status: 'Produto próprio',
    context: 'SaaS',
    line: 'Sistema de gestão para locadoras de veículos, do login até o DRE.',
    body: 'São 18 telas com CRUD real: frota, clientes, aluguéis, agendamento, oficina, vistoria, multas, sinistros e financeiro. O isolamento entre empresas é feito nas políticas do banco, não na aplicação, então uma locadora não enxerga a outra nem por engano. Tem quatro planos de assinatura, com cobrança anual calculada na hora.',
    stat: [
      '18 telas conectadas',
      'Isolamento por empresa no banco',
      '4 planos de assinatura',
    ],
    tags: ['React', 'Supabase', 'RLS', 'Recharts', 'Tailwind'],
    media: {
      frame: 'desktop',
      src: '',
      alt: 'Dashboard do WMove com os gráficos da frota',
    },
  },
  {
    n: '06',
    slug: 'habit-exe',
    name: 'habit.exe',
    status: 'Em desenvolvimento',
    context: 'Produto próprio',
    line: 'Habit tracker em pixel art onde o avatar evolui junto com os seus hábitos.',
    body: 'Web e mobile saem do mesmo código. Cumprir um hábito gera moeda e XP, que compram móveis pro quarto isométrico do personagem, então o progresso aparece na tela em vez de virar mais uma lista de check. O onboarding é um questionário de oito perguntas que termina numa oferta de plano anual.',
    stat: [
      '104 testes verdes',
      'Web e mobile no mesmo código',
      'Repositório público',
    ],
    tags: ['Expo', 'React Native', 'TypeScript', 'Supabase', 'Jest'],
    media: {
      frame: 'mobile',
      src: '',
      alt: 'Quarto isométrico em pixel art do habit.exe',
    },
    links: [
      {
        label: 'Ver no GitHub',
        href: 'https://github.com/WinistonAlle/dev-quest',
      },
    ],
  },
  {
    n: '07',
    slug: 'kings-table',
    name: "King's Table",
    status: 'Em desenvolvimento',
    context: 'Produto próprio',
    line: 'App de poker para home game: relógio de blinds, torneio e ranking da temporada.',
    body: 'O relógio continua certo mesmo com o app em segundo plano ou com o celular bloqueado, que é onde esse tipo de app costuma falhar na mesa. A criação de torneio acontece em quatro passos e o ranking fecha com pódio. iOS primeiro, web depois.',
    stat: [
      'Timer que sobrevive ao background',
      '9 tabelas com RLS',
      'iOS primeiro',
    ],
    tags: ['Expo Router', 'React Native', 'Zustand', 'Supabase'],
    media: {
      frame: 'mobile',
      src: '',
      alt: "Relógio de blinds do King's Table em tela cheia",
    },
  },
  {
    n: '08',
    slug: 'portfolio',
    name: 'Este portfólio',
    status: 'No ar',
    context: 'Pessoal',
    line: 'O site que você está lendo, sem template: crachá com física, cortina de pixels e a home dentro de um MacBook.',
    body: 'O crachá pendurado no cordão é uma cena 3D com física de corda de verdade, e dá pra arrastar. A troca de página não é fade: uma grade de pixels fecha a tela e abre do outro lado. A home abre com um zoom pra dentro da tela do notebook, e só entrega a página quando termina.',
    stat: ['Next 16 com App Router', 'three.js + Rapier', 'Nada de template'],
    tags: ['Next.js', 'React Three Fiber', 'Rapier', 'Tailwind 4'],
    media: {
      frame: 'none',
      src: '',
      alt: '',
    },
  },
];
