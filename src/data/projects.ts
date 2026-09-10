/* Conteúdo de /projetos. Cada projeto aparece como card na grade e ganha uma
   página própria em /projetos/[slug].

   O que existe aqui pra todo projeto (`line`, `stat`, `tags`) é o que a grade
   mostra e o que a página abre. Os campos do case (`body`, `problem`,
   `solution`, `gallery`) são opcionais de propósito: os projetos vão ser
   detalhados um a um, e quem ainda não foi abre a página com o texto curto em
   vez de abrir uma página vazia.

   `media.src` fica vazio até o print existir; a moldura aparece com a tela
   apagada, então falta de imagem não quebra layout nem esconde o projeto. */

export type ProjectMedia = {
  /** Qual moldura emoldura o print. `none` deixa o texto ocupar a faixa. */
  frame: 'desktop' | 'mobile' | 'none';
  /** Caminho em public/, ex.: '/cases/pdv/caixa.png'. Vazio = moldura vazia. */
  src?: string;
  /* O vídeo só aparece na página do projeto, dentro da moldura; o card da
     grade continua no print estático. Nove vídeos com autoplay na grade
     custariam megabytes para mostrar tudo ao mesmo tempo e não deixar ler
     nada. */
  /** Vídeo em loop na tela da moldura, ex.: '/cases/aluplex/scroll.mp4'. */
  video?: string;
  /** Frame exibido enquanto o vídeo carrega. Sem ele a tela pisca preta. */
  poster?: string;
  alt: string;
};

/** Link externo da página do projeto. */
export type ProjectLink = {
  label: string;
  href: string;
};

/** Print da galeria da página do projeto. */
export type Shot = {
  src: string;
  alt: string;
  /** Legenda curta. É ela que explica o que a tela faz. */
  caption?: string;
};

export type Project = {
  n: string;
  /** Vira o `id` do bloco, para link direto (ex.: /projetos#pdv). */
  slug: string;
  name: string;
  /** Etiqueta de estado, na linha do número. */
  status: string;
  /** Onde o projeto vive: empresa, produto próprio, etc. */
  context: string;
  /** Uma frase. É o que a pessoa lê se ler só uma linha do bloco. */
  line: string;
  /* Opcional: quando o `line` e os `stat` já dizem tudo, um parágrafo de
     resumo logo abaixo deles só repete o que a pessoa acabou de ler. */
  /** O problema e o que o sistema faz. Três ou quatro frases. */
  body?: string;
  /** Números e fatos verificáveis, em fonte mono. */
  stat: string[];
  tags: string[];
  media: ProjectMedia;
  /* Lista, e não um `href` só: a Aluplex tem site no ar e repositório
     público, e os dois interessam a quem está olhando. */
  /** Links externos, quando existe algo público pra ver. */
  links?: ProjectLink[];

  /* Daqui pra baixo: só os projetos já detalhados. Um parágrafo por item. */

  /** Como era antes do sistema existir, e o que doía. */
  problem?: string[];
  /** O que foi construído e o que mudou na prática. */
  solution?: string[];
  gallery?: Shot[];
};

export const projectBySlug = (slug: string) =>
  PROJECTS.find((p) => p.slug === slug);

/** A página do projeto só tem case escrito quando estes campos existem. */
export const hasCase = (p: Project) =>
  Boolean(p.problem?.length || p.solution?.length || p.gallery?.length);

export const PROJECTS: Project[] = [
  {
    n: '01',
    slug: 'aluplex',
    name: 'Aluplex',
    status: 'No ar',
    context: 'Cliente',
    line: 'Landing de uma empresa de fachadas de vidro, feita pra transformar visita em orçamento no WhatsApp.',
    stat: [
      'Uma página, sem framework e sem build',
      'Formulário qualifica o lead e abre o WhatsApp',
      'Hospedada na Vercel',
    ],
    tags: ['HTML', 'CSS', 'JavaScript', 'Vercel'],
    media: {
      frame: 'desktop',
      src: '/cases/aluplex/capa.jpg',
      video: '/cases/aluplex/scroll.mp4',
      poster: '/cases/aluplex/poster.jpg',
      alt: 'Topo da landing da Aluplex, com uma fachada de vidro ao fundo',
    },
    links: [
      { label: 'Abrir o site', href: 'https://site-aluplex.vercel.app' },
      {
        label: 'Ver no GitHub',
        href: 'https://github.com/WinistonAlle/site-aluplex',
      },
    ],
    gallery: [
      {
        src: '/cases/aluplex/solucoes.jpg',
        alt: 'Grade com as cinco soluções da Aluplex',
        caption:
          'As cinco soluções da empresa, cada uma com a foto da coisa pronta. Quem chega procurando "guarda-corpo de vidro" acha o nome que procurava sem ler o resto da página.',
      },
      {
        src: '/cases/aluplex/obras.jpg',
        alt: 'Carrossel de obras entregues, com a peça central colorida',
        caption:
          'O carrossel de obras entregues. Só a peça em foco fica colorida, as vizinhas ficam em preto e branco, então o olho sabe onde parar.',
      },
      {
        src: '/cases/aluplex/numeros.jpg',
        alt: 'Seção de engenharia com os números da empresa',
        caption:
          'Os números que sustentam o discurso: 250 obras entregues, 120 mil m² instalados, 15 anos de mercado. Numa compra cara, é isso que responde "posso confiar?".',
      },
      {
        src: '/cases/aluplex/orcamento.jpg',
        alt: 'Formulário de orçamento com escopo e faixa de investimento',
        caption:
          'O formulário de orçamento. Escopo e faixa de investimento viram uma mensagem pronta no WhatsApp da empresa, e o vendedor já abre a conversa sabendo do que se trata.',
      },
    ],
  },
  {
    n: '02',
    slug: 'alucraft',
    name: 'Alucraft',
    status: 'No ar',
    context: 'Cliente',
    line: 'Landing de uma fábrica de esquadrias de alumínio, do hero que se expande até o orçamento no WhatsApp.',
    stat: [
      'React 18 direto do CDN, sem etapa de build',
      'Hero que abre conforme a página rola',
      'Formulário abre o WhatsApp com a mensagem pronta',
    ],
    tags: ['React', 'JavaScript', 'CSS', 'Vercel'],
    media: {
      frame: 'desktop',
      src: '/cases/alucraft/capa.jpg',
      video: '/cases/alucraft/scroll.mp4',
      poster: '/cases/alucraft/poster.jpg',
      alt: 'Hero da Alucraft, com a fachada de um prédio ocupando a tela inteira',
    },
    links: [
      { label: 'Abrir o site', href: 'https://site-alucraft.vercel.app' },
      {
        label: 'Ver no GitHub',
        href: 'https://github.com/WinistonAlle/site-alucraft',
      },
    ],
    gallery: [
      {
        src: '/cases/alucraft/catalogo.jpg',
        alt: 'Carrossel de produtos da Alucraft, com a peça central em destaque',
        caption:
          'Os produtos num carrossel em coverflow: a peça central vem à frente e as vizinhas recuam. Numa fábrica que faz seis coisas diferentes, isso deixa mostrar uma de cada vez sem esconder o resto.',
      },
      {
        src: '/cases/alucraft/garantias.jpg',
        alt: 'Seção com as três garantias da Alucraft',
        caption:
          'As três objeções que aparecem em toda obra, respondidas antes de virarem pergunta: o alumínio é certificado, o prazo está em contrato e o atendimento é direto com quem executa.',
      },
      {
        src: '/cases/alucraft/etapas.jpg',
        alt: 'As quatro etapas do processo e os depoimentos de clientes',
        caption:
          'Medição, projeto, fabricação e instalação, com data marcada em cada etapa, e logo abaixo os depoimentos. Quem está decidindo uma obra cara quer ver o processo antes do preço.',
      },
      {
        src: '/cases/alucraft/orcamento.jpg',
        alt: 'Formulário de orçamento da Alucraft',
        caption:
          'O formulário de orçamento. Nome, WhatsApp e tipo de esquadria viram uma mensagem pronta, e o envio abre a conversa direto no WhatsApp da fábrica.',
      },
    ],
  },
  {
    n: '03',
    slug: 'gostinho-mineiro',
    name: 'Gostinho Mineiro',
    status: 'No ar',
    context: 'Cliente',
    line: 'Site institucional da indústria de alimentos onde eu trabalho, feito pra vender no atacado, não no varejo.',
    stat: [
      'SPA em Vite e React, com duas rotas',
      'Fala com padaria, mercado e food service',
      'Publicado na Vercel',
    ],
    tags: ['React', 'Vite', 'TypeScript', 'Vercel'],
    media: {
      frame: 'desktop',
      src: '/cases/gostinho-mineiro/capa.jpg',
      video: '/cases/gostinho-mineiro/scroll.mp4',
      poster: '/cases/gostinho-mineiro/poster.jpg',
      alt: 'Topo do site da Gostinho Mineiro, com pães de queijo ao fundo',
    },
    links: [
      { label: 'Abrir o site', href: 'https://gostinho-mineiro.vercel.app' },
      {
        label: 'Ver no GitHub',
        href: 'https://github.com/WinistonAlle/site-gm',
      },
    ],
    gallery: [
      {
        src: '/cases/gostinho-mineiro/linha.jpg',
        alt: 'Página da linha de pães de queijo',
        caption:
          'A segunda rota do site, dedicada a uma linha de produto. É ela que responde a pergunta que o comprador de padaria faz primeiro: quais gramaturas e embalagens existem.',
      },
      {
        src: '/cases/gostinho-mineiro/galeria.jpg',
        alt: 'Galeria de fotos de produto sob a marca #GostinhoMineiro',
        caption:
          'A vitrine de produto. Num negócio de alimento, a foto é metade do argumento, então ela ocupa a largura toda em vez de virar miniatura numa grade.',
      },
      {
        src: '/cases/gostinho-mineiro/contato.jpg',
        alt: 'Formulário de atendimento comercial',
        caption:
          'O atendimento comercial. Nome, empresa e interesse chegam junto, então o time já abre a conversa sabendo se é padaria, mercado ou food service.',
      },
      {
        src: '/cases/gostinho-mineiro/onde.jpg',
        alt: 'Seção de localização com mapa e horário de atendimento',
        caption:
          'Endereço, mapa e horário de atendimento. Parece detalhe, mas venda no atacado passa por visita e retirada, e sem isso a pessoa liga só pra perguntar onde fica.',
      },
    ],
  },
  {
    n: '04',
    slug: 'habit-exe',
    name: 'habit.exe',
    status: 'Em desenvolvimento',
    context: 'Produto próprio',
    line: 'Habit tracker feito pra dev: hábito cumprido vira XP e moeda pra montar o setup do personagem.',
    stat: [
      'Landing pronta, aplicativo em construção',
      'Expo: web e mobile saem do mesmo código',
      'Lista de espera para os 500 primeiros',
    ],
    tags: ['Expo', 'React Native', 'TypeScript', 'Supabase'],
    media: {
      frame: 'desktop',
      src: '/cases/habit-exe/capa.jpg',
      video: '/cases/habit-exe/scroll.mp4',
      poster: '/cases/habit-exe/poster.jpg',
      alt: 'Topo da landing do habit.exe, em verde sobre preto, com um terminal ao lado',
    },
    links: [
      {
        label: 'Ver no GitHub',
        href: 'https://github.com/WinistonAlle/dev-quest',
      },
    ],
    gallery: [
      {
        src: '/cases/habit-exe/features.jpg',
        alt: 'Seção de mecânicas do habit.exe, com um checklist de hábitos ao lado',
        caption:
          'As mecânicas, explicadas ao lado da tela onde elas acontecem. A promessa é gamificação de verdade, com moeda e loja, e não checkbox com confete.',
      },
      {
        src: '/cases/habit-exe/comandos.jpg',
        alt: 'Os três comandos do habit.exe escritos como linha de comando',
        caption:
          'O uso do app escrito como comando de terminal: add, done e shop buy. É uma tradução do produto para a linguagem de quem ele quer atingir, e é o que faz o dev entender em três linhas.',
      },
      {
        src: '/cases/habit-exe/depoimentos.jpg',
        alt: 'Depoimentos formatados como log do git',
        caption:
          'Os depoimentos vêm formatados como git log, com autor e "há 2 dias" no lugar da foto e do cargo. Mesmo conteúdo de sempre, na convenção que o público lê todo dia.',
      },
      {
        src: '/cases/habit-exe/waitlist.jpg',
        alt: 'Formulário de lista de espera do habit.exe',
        caption:
          'A lista de espera. Como o app ainda está em construção, a landing não tenta vender: ela reserva vaga e promete a conquista early_adopter pros 500 primeiros.',
      },
    ],
  },
  {
    n: '05',
    slug: 'delivery-gm',
    name: 'Delivery Gostinho Mineiro',
    status: 'No ar',
    context: 'Cliente',
    line: 'A loja online da mesma fábrica: o cliente monta o carrinho e o pedido chega pronto no WhatsApp de quem separa.',
    stat: [
      '353 pedidos e 337 clientes desde abril de 2026',
      '187 produtos, vendidos por quilo ou por pacote',
      'Supabase próprio, rodando no servidor da empresa',
    ],
    tags: ['React', 'TypeScript', 'Supabase', 'Tailwind'],
    media: {
      frame: 'desktop',
      src: '/cases/delivery-gm/capa.jpg',
      video: '/cases/delivery-gm/scroll.mp4',
      poster: '/cases/delivery-gm/poster.jpg',
      alt: 'Topo do catálogo do delivery da Gostinho Mineiro, com os produtos em destaque',
    },
    links: [
      { label: 'Abrir o site', href: 'https://varejo.gostinhomineiro.com' },
      {
        label: 'Ver no GitHub',
        href: 'https://github.com/WinistonAlle/delivery-gm',
      },
    ],
    problem: [
      'O pedido chegava por telefone ou numa conversa de WhatsApp. Alguém da loja atendia, consultava o preço e montava a conta no meio do diálogo.',
      'Quase tudo é vendido por quilo, e o pacote custa o preço do quilo vezes o peso: 5kg de pão de queijo a R$ 20,25 dá R$ 101,25. Essa conta era refeita a cada ligação, para 187 produtos.',
      'E o registro do pedido era a própria conversa.',
    ],
    solution: [
      'O WhatsApp continua sendo o canal, e isso foi escolha: é onde o cliente já sabe pedir. O que mudou é quem digita. O cliente monta o carrinho e o sistema entrega a mensagem pronta, com item, quantidade, valor unitário, frete e total.',
      'O catálogo ainda responde sozinho o que antes ocupava a ligação: rende pra quantas pessoas, quanto sai o frete, quanto pesa o carrinho e como assar o congelado.',
      'E o pedido virou registro: 353 pedidos e 337 clientes desde abril. O painel mostra onde o cliente desistiu e quais desistências têm telefone.',
    ],
    gallery: [
      {
        src: '/cases/delivery-gm/combos.jpg',
        alt: 'Combos prontos, busca e filtros por categoria no catálogo',
        caption:
          'Combos montados por ocasião, com o total já somado. Quem vai receber trinta pessoas não sabe quantos pacotes pedir, e a pergunta "dá pra quantos?" é a que trava a compra.',
      },
      {
        src: '/cases/delivery-gm/carrinho.jpg',
        alt: 'Carrinho aberto, com aviso de frete grátis atingido e o peso total',
        caption:
          'O carrinho avisa que o frete ficou grátis e mostra o peso total. Num produto vendido por quilo, saber que são 11kg é o que evita o pedido chegar em quantidade errada.',
      },
      {
        src: '/cases/delivery-gm/preparo.jpg',
        alt: 'Página de modos de preparo, com vídeos por produto',
        caption:
          'Modos de preparo em vídeo, por produto. Congelado que assa errado vira reclamação e cliente perdido, então ensinar o forno certo é parte de vender.',
      },
      {
        src: '/cases/delivery-gm/admin.jpg',
        alt: 'Painel de produtos do admin, com 187 itens cadastrados',
        caption:
          'O painel onde os 187 produtos são mantidos: preço, categoria, peso, foto e se aparece ou não no catálogo. Quem mexe é o time da loja, sem passar por mim.',
      },
      {
        src: '/cases/delivery-gm/temas.jpg',
        alt: 'Tela de temas do site, com opções sazonais',
        caption:
          'Sete temas sazonais que trocam o visual do catálogo inteiro em um clique. Black Friday, Natal, Festa Junina e Copa do Mundo já vêm prontos, e publicar não exige deploy.',
      },
      {
        src: '/cases/delivery-gm/funil.jpg',
        alt: 'Painel de recuperação de clientes, com o funil de saída por etapa',
        caption:
          'O funil mostra em que etapa o cliente desistiu e quais desistências têm telefone conhecido. Deixa de ser "vendemos menos essa semana" e vira uma lista de quem ligar.',
      },
    ],
  },
  {
    n: '06',
    slug: 'catalogo-funcionarios',
    name: 'Catálogo de Funcionários',
    status: 'No ar',
    context: 'Cliente',
    line: 'Loja interna da fábrica: o funcionário compra com crédito da folha e o pedido entra sozinho no ERP como recibo.',
    stat: [
      '379 funcionários, 363 pedidos desde abril de 2026',
      '83 dos 85 pedidos entraram sozinhos no ERP desde agosto',
      'Crédito, corte de horário e lista da portaria no automático',
    ],
    tags: ['React', 'TypeScript', 'Supabase', 'CIGAM'],
    media: {
      frame: 'desktop',
      src: '/cases/catalogo-funcionarios/capa.jpg',
      video: '/cases/catalogo-funcionarios/scroll.mp4',
      poster: '/cases/catalogo-funcionarios/poster.jpg',
      alt: 'Painel de operação do catálogo de funcionários, com as ações de sincronizar, restaurar saldo e liberar pedido',
    },
    links: [
      {
        label: 'Ver no GitHub',
        href: 'https://github.com/WinistonAlle/catalogo-funcionarios',
      },
    ],
    problem: [
      'O funcionário mandava mensagem para o faturamento. Alguém lá parava o próprio trabalho e digitava o pedido no sistema, item por item.',
      'Ia item errado, ia valor errado, e demorava. O preço não era só o erro: era o tempo do faturamento, todo dia, gasto num trabalho que não era o deles.',
    ],
    solution: [
      'O funcionário monta o próprio pedido, com o saldo à vista e o preço já calculado. Ninguém digita mais nada em nome de ninguém.',
      'Dali o pedido entra sozinho no ERP, vira recibo e sai liberado para faturamento. Desde que a integração subiu, em agosto, 83 dos 85 pedidos fizeram esse caminho sem ninguém tocar.',
      'Ao faturamento sobrou imprimir a lista e entregar para a separação.',
    ],
    gallery: [
      {
        src: '/cases/catalogo-funcionarios/acessos.jpg',
        alt: 'Tela de entrada, com as opções Sou Funcionário e Sou Cliente',
        caption:
          'A porta de entrada separa dois públicos que veem preços diferentes do mesmo produto. Funcionário entra com CPF, sem senha: o público é o chão de fábrica e uma senha a mais viraria papel colado no armário.',
      },
      {
        src: '/cases/catalogo-funcionarios/catalogo.jpg',
        alt: 'Catálogo interno, com o saldo do funcionário no topo',
        caption:
          'O saldo fica no topo, do lado do nome, e acompanha a pessoa por todas as telas. Comprar aqui é gastar um crédito que tem limite, então esconder quanto sobrou seria esconder justo o que decide a compra.',
      },
      {
        src: '/cases/catalogo-funcionarios/pedidos.jpg',
        alt: 'Administração de pedidos, com a faixa de pedido liberado para hoje',
        caption:
          'A tela do faturamento. A faixa verde no topo é um pedido feito depois das 13:40 que o RH liberou para sair no mesmo dia: antes isso vivia fora do sistema, como recado por voz, e o pedido nascia no papel do dia seguinte.',
      },
      {
        src: '/cases/catalogo-funcionarios/relatorios.jpg',
        alt: 'Relatório de pedidos, com faturamento, ticket médio e comparação entre meses',
        caption:
          'O relatório que o RH usa para fechar o mês. Compara ciclo com ciclo, não mês do calendário com mês do calendário, porque o ciclo real vai do dia 27 ao 26 e essa diferença fazia o total não bater com a folha.',
      },
      {
        src: '/cases/catalogo-funcionarios/auditoria.jpg',
        alt: 'Histórico operacional, com o registro das sincronizações',
        caption:
          'Toda sincronização deixa rastro, inclusive as que rodam sozinhas de vinte em vinte minutos. A recarga de crédito já ficou quatro meses morta sem ninguém perceber, e foi essa tela que passou a ser o lugar onde isso apareceria.',
      },
      {
        src: '/cases/catalogo-funcionarios/destaques.jpg',
        alt: 'Tela de destaques do catálogo, com ordenação por arrastar',
        caption:
          'Os destaques da home são escolhidos e ordenados arrastando, com a prévia do carrossel logo acima. Quem monta a vitrine é a equipe, e a prévia existe para não ter que publicar pra descobrir como ficou.',
      },
    ],
  },
];
