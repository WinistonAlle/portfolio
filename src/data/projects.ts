import type { Localized } from '@/i18n/config';

/* Conteúdo de /projetos. Cada projeto aparece como card na grade e ganha uma
   página própria em /[lang]/projetos/[slug].

   Tudo que a pessoa lê na tela é `Localized`: os dois idiomas moram lado a
   lado, no mesmo objeto. Foi escolha contra a alternativa óbvia, que era um
   `projects.en.ts` separado. Dois arquivos derivam: alguém acrescenta um
   projeto num e esquece o outro, e o site fica com seis cards em português e
   cinco em inglês. Aqui o TypeScript recusa o projeto pela metade.

   O que NÃO é traduzido, de propósito: nome de projeto, nome de tecnologia,
   caminho de imagem e URL. "Supabase" e "Gostinho Mineiro" são os mesmos nos
   dois idiomas, e traduzir isso só criaria oportunidade de divergir.

   Os campos do case (`problem`, `solution`, `gallery`) são opcionais porque os
   projetos vão sendo detalhados um a um: quem ainda não foi abre a página com
   o texto curto em vez de abrir uma página vazia. */

export type ProjectMedia = {
  /** Qual moldura emoldura o print. `none` deixa o texto ocupar a faixa. */
  frame: 'desktop' | 'mobile' | 'totem' | 'none';
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
  alt: Localized<string>;
};

/* Link externo da página do projeto. O rótulo vem do dicionário, não daqui:
   "Abrir o site" é igual nos seis projetos, e repetir a string em cada um é
   repetir a chance de traduzir diferente. */
export type ProjectLink = {
  kind: 'site' | 'github';
  href: string;
};

/** Print da galeria da página do projeto. */
export type Shot = {
  src: string;
  alt: Localized<string>;
  /** Legenda curta. É ela que explica o que a tela faz. */
  caption?: Localized<string>;
};

/* Etiqueta do filtro, como CHAVE e não como rótulo: o texto do botão está no
   dicionário, então o filtro funciona igual nos dois idiomas.

   Um projeto pode ter mais de uma, e é de propósito. Os rótulos não são do
   mesmo eixo: "Gostinho Mineiro" diz PARA QUEM, "Landing pages e sites" diz O
   QUE É. O site institucional da GM é as duas coisas ao mesmo tempo, e forçar
   uma escolha escondia ele de quem filtrasse por sites.

   O preço é que a soma dos filtros passa do total (hoje 3 + 4 + 1 = 8 para
   seis projetos). É esperado: as contagens dizem quantos projetos há em cada
   etiqueta, não como o total se reparte. */
export type ProjectGroup = 'gostinho-mineiro' | 'sites' | 'outros';

/** A ordem aqui é a ordem dos filtros na tela. */
export const PROJECT_GROUPS: ProjectGroup[] = [
  'gostinho-mineiro',
  'sites',
  'outros',
];

/** Estado do projeto. O card só mostra selo quando não está no ar. */
export type ProjectStatus = 'live' | 'wip';

export type Project = {
  n: string;
  /** Vira o `id` do bloco, para link direto (ex.: /projetos#pdv). */
  slug: string;
  name: string;
  status: ProjectStatus;
  /* Metadado interno, não aparece em tela nenhuma hoje. Por isso não é
     `Localized`: traduzir texto que ninguém lê é custo sem retorno. */
  context: string;
  /** Uma ou mais etiquetas. O card aparece em todos os filtros que listar. */
  groups: ProjectGroup[];
  /** Uma frase. É o que a pessoa lê se ler só uma linha do bloco. */
  line: Localized<string>;
  /** Números e fatos verificáveis, em fonte mono. */
  stat: Localized<string[]>;
  tags: string[];
  media: ProjectMedia;
  links?: ProjectLink[];
  /** Aviso destacado no topo do case. Existe para o dashboard financeiro, cujos
   *  números são todos inventados: dizer isso numa linha perdida do meio do
   *  texto seria a mesma coisa que não dizer. */
  nota?: Localized<string>;

  /* Daqui pra baixo: só os projetos já detalhados. Um parágrafo por item. */

  /** Como era antes do sistema existir, e o que doía. */
  problem?: Localized<string[]>;
  /** O que foi construído e o que mudou na prática. */
  solution?: Localized<string[]>;
  gallery?: Shot[];
};

export const projectBySlug = (slug: string) =>
  PROJECTS.find((p) => p.slug === slug);

/** A página do projeto só tem case escrito quando estes campos existem. */
export const hasCase = (p: Project) =>
  Boolean(p.problem || p.solution || p.gallery?.length);

export const PROJECTS: Project[] = [
  {
    n: '01',
    slug: 'aluplex',
    name: 'Aluplex',
    status: 'live',
    context: 'Cliente',
    groups: ['sites'],
    line: {
      pt: 'Landing de uma empresa de fachadas de vidro, feita pra transformar visita em orçamento no WhatsApp.',
      en: 'Landing page for a glass façade company, built to turn a visit into a quote on WhatsApp.',
    },
    stat: {
      pt: [
        'Uma página, sem framework e sem build',
        'Formulário qualifica o lead e abre o WhatsApp',
        'Hospedada na Vercel',
      ],
      en: [
        'One page, no framework and no build step',
        'The form qualifies the lead and opens WhatsApp',
        'Hosted on Vercel',
      ],
    },
    tags: ['HTML', 'CSS', 'JavaScript', 'Vercel'],
    media: {
      frame: 'desktop',
      src: '/cases/aluplex/capa.webp',
      video: '/cases/aluplex/scroll.mp4',
      poster: '/cases/aluplex/poster.webp',
      alt: {
        pt: 'Topo da landing da Aluplex, com uma fachada de vidro ao fundo',
        en: 'Top of the Aluplex landing page, with a glass façade behind it',
      },
    },
    links: [
      { kind: 'site', href: 'https://site-aluplex.vercel.app' },
      { kind: 'github', href: 'https://github.com/WinistonAlle/site-aluplex' },
    ],
    gallery: [
      {
        src: '/cases/aluplex/solucoes.webp',
        alt: {
          pt: 'Grade com as cinco soluções da Aluplex',
          en: "Grid with Aluplex's five solutions",
        },
        caption: {
          pt: 'As cinco soluções da empresa, cada uma com a foto da coisa pronta. Quem chega procurando "guarda-corpo de vidro" acha o nome que procurava sem ler o resto da página.',
          en: 'The five solutions, each with a photo of the finished job. Someone arriving in search of "glass railing" finds the words they came for without reading the rest of the page.',
        },
      },
      {
        src: '/cases/aluplex/obras.webp',
        alt: {
          pt: 'Carrossel de obras entregues, com a peça central colorida',
          en: 'Carousel of completed jobs, with the centre item in colour',
        },
        caption: {
          pt: 'O carrossel de obras entregues. Só a peça em foco fica colorida, as vizinhas ficam em preto e branco, então o olho sabe onde parar.',
          en: 'The carousel of completed jobs. Only the item in focus keeps its colour, its neighbours go black and white, so the eye knows where to stop.',
        },
      },
      {
        src: '/cases/aluplex/numeros.webp',
        alt: {
          pt: 'Seção de engenharia com os números da empresa',
          en: "Engineering section with the company's numbers",
        },
        caption: {
          pt: 'Os números que sustentam o discurso: 250 obras entregues, 120 mil m² instalados, 15 anos de mercado. Numa compra cara, é isso que responde "posso confiar?".',
          en: 'The numbers that back the pitch: 250 jobs delivered, 120,000 m² installed, 15 years in business. On an expensive purchase, this is what answers "can I trust them?".',
        },
      },
      {
        src: '/cases/aluplex/orcamento.webp',
        alt: {
          pt: 'Formulário de orçamento com escopo e faixa de investimento',
          en: 'Quote form with scope and budget range',
        },
        caption: {
          pt: 'O formulário de orçamento. Escopo e faixa de investimento viram uma mensagem pronta no WhatsApp da empresa, e o vendedor já abre a conversa sabendo do que se trata.',
          en: "The quote form. Scope and budget range become a ready-made message in the company's WhatsApp, so the salesperson opens the conversation already knowing what it is about.",
        },
      },
    ],
  },
  {
    n: '02',
    slug: 'alucraft',
    name: 'Alucraft',
    status: 'live',
    context: 'Cliente',
    groups: ['sites'],
    line: {
      pt: 'Landing de uma fábrica de esquadrias de alumínio, do hero que se expande até o orçamento no WhatsApp.',
      en: 'Landing page for an aluminium frame manufacturer, from the expanding hero to the quote on WhatsApp.',
    },
    stat: {
      pt: [
        'React 18 direto do CDN, sem etapa de build',
        'Hero que abre conforme a página rola',
        'Formulário abre o WhatsApp com a mensagem pronta',
      ],
      en: [
        'React 18 straight from the CDN, no build step',
        'A hero that opens up as the page scrolls',
        'The form opens WhatsApp with the message written',
      ],
    },
    tags: ['React', 'JavaScript', 'CSS', 'Vercel'],
    media: {
      frame: 'desktop',
      src: '/cases/alucraft/capa.webp',
      video: '/cases/alucraft/scroll.mp4',
      poster: '/cases/alucraft/poster.webp',
      alt: {
        pt: 'Hero da Alucraft, com a fachada de um prédio ocupando a tela inteira',
        en: 'Alucraft hero, with a building façade filling the whole screen',
      },
    },
    links: [
      { kind: 'site', href: 'https://site-alucraft.vercel.app' },
      { kind: 'github', href: 'https://github.com/WinistonAlle/site-alucraft' },
    ],
    gallery: [
      {
        src: '/cases/alucraft/catalogo.webp',
        alt: {
          pt: 'Carrossel de produtos da Alucraft, com a peça central em destaque',
          en: 'Alucraft product carousel, with the centre item brought forward',
        },
        caption: {
          pt: 'Os produtos num carrossel em coverflow: a peça central vem à frente e as vizinhas recuam. Numa fábrica que faz seis coisas diferentes, isso deixa mostrar uma de cada vez sem esconder o resto.',
          en: 'Products in a coverflow carousel: the centre item comes forward and its neighbours fall back. In a factory that makes six different things, this shows one at a time without hiding the rest.',
        },
      },
      {
        src: '/cases/alucraft/garantias.webp',
        alt: {
          pt: 'Seção com as três garantias da Alucraft',
          en: "Section with Alucraft's three guarantees",
        },
        caption: {
          pt: 'As três objeções que aparecem em toda obra, respondidas antes de virarem pergunta: o alumínio é certificado, o prazo está em contrato e o atendimento é direto com quem executa.',
          en: 'The three objections that come up on every job, answered before they turn into questions: the aluminium is certified, the deadline is in the contract, and you deal directly with the people doing the work.',
        },
      },
      {
        src: '/cases/alucraft/etapas.webp',
        alt: {
          pt: 'As quatro etapas do processo e os depoimentos de clientes',
          en: 'The four stages of the process and the customer testimonials',
        },
        caption: {
          pt: 'Medição, projeto, fabricação e instalação, com data marcada em cada etapa, e logo abaixo os depoimentos. Quem está decidindo uma obra cara quer ver o processo antes do preço.',
          en: 'Measurement, design, manufacturing and installation, each with a date attached, and the testimonials right below. Someone deciding on an expensive job wants to see the process before the price.',
        },
      },
      {
        src: '/cases/alucraft/orcamento.webp',
        alt: {
          pt: 'Formulário de orçamento da Alucraft',
          en: 'Alucraft quote form',
        },
        caption: {
          pt: 'O formulário de orçamento. Nome, WhatsApp e tipo de esquadria viram uma mensagem pronta, e o envio abre a conversa direto no WhatsApp da fábrica.',
          en: "Name, WhatsApp and frame type become a ready-made message, and submitting opens the conversation straight in the factory's WhatsApp.",
        },
      },
    ],
  },
  {
    n: '03',
    slug: 'gostinho-mineiro',
    name: 'Gostinho Mineiro',
    status: 'live',
    context: 'Cliente',
    groups: ['gostinho-mineiro', 'sites'],
    line: {
      pt: 'Site institucional da indústria de alimentos onde eu trabalho, feito pra vender no atacado, não no varejo.',
      en: 'Corporate site for the food manufacturer I work at, built to sell wholesale, not retail.',
    },
    stat: {
      pt: [
        'SPA em Vite e React, com duas rotas',
        'Fala com padaria, mercado e food service',
        'Publicado na Vercel',
      ],
      en: [
        'A Vite and React SPA, with two routes',
        'Speaks to bakeries, grocers and food service',
        'Published on Vercel',
      ],
    },
    tags: ['React', 'Vite', 'TypeScript', 'Vercel'],
    media: {
      frame: 'desktop',
      src: '/cases/gostinho-mineiro/capa.webp',
      video: '/cases/gostinho-mineiro/scroll.mp4',
      poster: '/cases/gostinho-mineiro/poster.webp',
      alt: {
        pt: 'Topo do site da Gostinho Mineiro, com pães de queijo ao fundo',
        en: 'Top of the Gostinho Mineiro site, with cheese breads behind it',
      },
    },
    links: [
      { kind: 'site', href: 'https://gostinho-mineiro.vercel.app' },
      { kind: 'github', href: 'https://github.com/WinistonAlle/site-gm' },
    ],
    gallery: [
      {
        src: '/cases/gostinho-mineiro/linha.webp',
        alt: {
          pt: 'Página da linha de pães de queijo',
          en: 'Page for the cheese bread product line',
        },
        caption: {
          pt: 'A segunda rota do site, dedicada a uma linha de produto. É ela que responde a pergunta que o comprador de padaria faz primeiro: quais gramaturas e embalagens existem.',
          en: "The site's second route, given over to a single product line. It answers the question a bakery buyer asks first: which weights and pack sizes exist.",
        },
      },
      {
        src: '/cases/gostinho-mineiro/galeria.webp',
        alt: {
          pt: 'Galeria de fotos de produto sob a marca #GostinhoMineiro',
          en: 'Product photo gallery under the #GostinhoMineiro brand',
        },
        caption: {
          pt: 'A vitrine de produto. Num negócio de alimento, a foto é metade do argumento, então ela ocupa a largura toda em vez de virar miniatura numa grade.',
          en: 'The product showcase. In a food business the photo is half the argument, so it takes the full width instead of shrinking into a thumbnail grid.',
        },
      },
      {
        src: '/cases/gostinho-mineiro/contato.webp',
        alt: {
          pt: 'Formulário de atendimento comercial',
          en: 'Sales enquiry form',
        },
        caption: {
          pt: 'O atendimento comercial. Nome, empresa e interesse chegam junto, então o time já abre a conversa sabendo se é padaria, mercado ou food service.',
          en: 'The sales enquiry. Name, company and interest arrive together, so the team opens the conversation already knowing whether it is a bakery, a grocer or food service.',
        },
      },
      {
        src: '/cases/gostinho-mineiro/onde.webp',
        alt: {
          pt: 'Seção de localização com mapa e horário de atendimento',
          en: 'Location section with a map and opening hours',
        },
        caption: {
          pt: 'Endereço, mapa e horário de atendimento. Parece detalhe, mas venda no atacado passa por visita e retirada, e sem isso a pessoa liga só pra perguntar onde fica.',
          en: 'Address, map and opening hours. It looks like a detail, but wholesale runs on visits and pickups, and without this people phone just to ask where the place is.',
        },
      },
    ],
  },
  {
    n: '04',
    slug: 'habit-exe',
    name: 'habit.exe',
    status: 'wip',
    context: 'Produto próprio',
    groups: ['outros', 'sites'],
    line: {
      pt: 'Habit tracker feito pra dev: hábito cumprido vira XP e moeda pra montar o setup do personagem.',
      en: 'A habit tracker built for developers: a habit kept turns into XP and coins to kit out your character.',
    },
    stat: {
      pt: [
        'Landing pronta, aplicativo em construção',
        'Expo: web e mobile saem do mesmo código',
        'Lista de espera para os 500 primeiros',
      ],
      en: [
        'Landing page done, app under construction',
        'Expo: web and mobile from the same codebase',
        'Waiting list for the first 500',
      ],
    },
    tags: ['Expo', 'React Native', 'TypeScript', 'Supabase'],
    media: {
      frame: 'desktop',
      src: '/cases/habit-exe/capa.webp',
      video: '/cases/habit-exe/scroll.mp4',
      poster: '/cases/habit-exe/poster.webp',
      alt: {
        pt: 'Topo da landing do habit.exe, em verde sobre preto, com um terminal ao lado',
        en: 'Top of the habit.exe landing page, green on black, with a terminal beside it',
      },
    },
    links: [
      { kind: 'github', href: 'https://github.com/WinistonAlle/dev-quest' },
    ],
    gallery: [
      {
        src: '/cases/habit-exe/features.webp',
        alt: {
          pt: 'Seção de mecânicas do habit.exe, com um checklist de hábitos ao lado',
          en: 'habit.exe mechanics section, with a habit checklist beside it',
        },
        caption: {
          pt: 'As mecânicas, explicadas ao lado da tela onde elas acontecem. A promessa é gamificação de verdade, com moeda e loja, e não checkbox com confete.',
          en: 'The mechanics, explained next to the screen where they happen. The promise is real gamification, with currency and a shop, not a checkbox with confetti.',
        },
      },
      {
        src: '/cases/habit-exe/comandos.webp',
        alt: {
          pt: 'Os três comandos do habit.exe escritos como linha de comando',
          en: "habit.exe's three commands written as a command line",
        },
        caption: {
          pt: 'O uso do app escrito como comando de terminal: add, done e shop buy. É uma tradução do produto para a linguagem de quem ele quer atingir, e é o que faz o dev entender em três linhas.',
          en: 'Using the app written as terminal commands: add, done and shop buy. It translates the product into the language of the people it wants to reach, and it lets a developer get it in three lines.',
        },
      },
      {
        src: '/cases/habit-exe/depoimentos.webp',
        alt: {
          pt: 'Depoimentos formatados como log do git',
          en: 'Testimonials formatted as a git log',
        },
        caption: {
          pt: 'Os depoimentos vêm formatados como git log, com autor e "há 2 dias" no lugar da foto e do cargo. Mesmo conteúdo de sempre, na convenção que o público lê todo dia.',
          en: 'The testimonials come formatted as a git log, with an author and "2 days ago" in place of a photo and a job title. The same content as ever, in the convention this audience reads every day.',
        },
      },
      {
        src: '/cases/habit-exe/waitlist.webp',
        alt: {
          pt: 'Formulário de lista de espera do habit.exe',
          en: 'habit.exe waiting list form',
        },
        caption: {
          pt: 'A lista de espera. Como o app ainda está em construção, a landing não tenta vender: ela reserva vaga e promete a conquista early_adopter pros 500 primeiros.',
          en: 'The waiting list. Since the app is still being built, the landing page does not try to sell: it holds a spot and promises the early_adopter achievement to the first 500.',
        },
      },
    ],
  },
  {
    n: '05',
    slug: 'delivery-gm',
    name: 'Delivery Gostinho Mineiro',
    status: 'live',
    context: 'Cliente',
    groups: ['gostinho-mineiro'],
    line: {
      pt: 'A loja online da mesma fábrica: o cliente monta o carrinho e o pedido chega pronto no WhatsApp de quem separa.',
      en: "The same factory's online shop: the customer builds the cart and the order lands ready in the packing team's WhatsApp.",
    },
    stat: {
      pt: [
        '353 pedidos e 337 clientes desde abril de 2026',
        '187 produtos, vendidos por quilo ou por pacote',
        'Supabase próprio, rodando no servidor da empresa',
      ],
      en: [
        '353 orders and 337 customers since April 2026',
        '187 products, sold by the kilo or by the pack',
        "Self-hosted Supabase, on the company's own server",
      ],
    },
    tags: ['React', 'TypeScript', 'Supabase', 'Tailwind'],
    media: {
      frame: 'desktop',
      src: '/cases/delivery-gm/capa.webp',
      video: '/cases/delivery-gm/scroll.mp4',
      poster: '/cases/delivery-gm/poster.webp',
      alt: {
        pt: 'Topo do catálogo do delivery da Gostinho Mineiro, com os produtos em destaque',
        en: 'Top of the Gostinho Mineiro delivery catalog, with the featured products',
      },
    },
    links: [
      { kind: 'site', href: 'https://varejo.gostinhomineiro.com' },
      { kind: 'github', href: 'https://github.com/WinistonAlle/delivery-gm' },
    ],
    problem: {
      pt: [
        'O pedido chegava por telefone ou numa conversa de WhatsApp. Alguém da loja atendia, consultava o preço e montava a conta no meio do diálogo.',
        'Quase tudo é vendido por quilo, e o pacote custa o preço do quilo vezes o peso: 5kg de pão de queijo a R$ 20,25 dá R$ 101,25. Essa conta era refeita a cada ligação, para 187 produtos.',
        'E o registro do pedido era a própria conversa.',
      ],
      en: [
        'Orders came in by phone or in a WhatsApp thread. Someone at the shop picked up, looked up prices and added up the bill in the middle of the conversation.',
        'Almost everything is sold by the kilo, and a pack costs the price per kilo times its weight: 5kg of cheese bread at R$ 20.25 comes to R$ 101.25. That sum was redone on every call, across 187 products.',
        'And the record of the order was the conversation itself.',
      ],
    },
    solution: {
      pt: [
        'O WhatsApp continua sendo o canal, e isso foi escolha: é onde o cliente já sabe pedir. O que mudou é quem digita. O cliente monta o carrinho e o sistema entrega a mensagem pronta, com item, quantidade, valor unitário, frete e total.',
        'O catálogo ainda responde sozinho o que antes ocupava a ligação: rende pra quantas pessoas, quanto sai o frete, quanto pesa o carrinho e como assar o congelado.',
        'E o pedido virou registro: 353 pedidos e 337 clientes desde abril. O painel mostra onde o cliente desistiu e quais desistências têm telefone.',
      ],
      en: [
        'WhatsApp is still the channel, and that was a choice: it is where the customer already knows how to order. What changed is who types. The customer builds the cart and the system hands over a finished message, with item, quantity, unit price, delivery fee and total.',
        'The catalog also answers on its own what used to take up the call: how many people a pack serves, what delivery costs, how much the cart weighs, and how to bake what arrives frozen.',
        'And the order became a record: 353 orders and 337 customers since April. The dashboard shows where customers dropped off, and which of those drop-offs left a phone number.',
      ],
    },
    gallery: [
      {
        src: '/cases/delivery-gm/combos.webp',
        alt: {
          pt: 'Combos prontos, busca e filtros por categoria no catálogo',
          en: 'Ready-made bundles, search and category filters in the catalog',
        },
        caption: {
          pt: 'Combos montados por ocasião, com o total já somado. Quem vai receber trinta pessoas não sabe quantos pacotes pedir, e a pergunta "dá pra quantos?" é a que trava a compra.',
          en: 'Bundles built around an occasion, with the total already added up. Someone hosting thirty people has no idea how many packs to order, and "how many does it serve?" is the question that stalls the sale.',
        },
      },
      {
        src: '/cases/delivery-gm/carrinho.webp',
        alt: {
          pt: 'Carrinho aberto, com aviso de frete grátis atingido e o peso total',
          en: 'Open cart, showing free delivery unlocked and the total weight',
        },
        caption: {
          pt: 'O carrinho avisa que o frete ficou grátis e mostra o peso total. Num produto vendido por quilo, saber que são 11kg é o que evita o pedido chegar em quantidade errada.',
          en: 'The cart says delivery just became free and shows the total weight. On a product sold by the kilo, knowing it adds up to 11kg is what stops the order arriving in the wrong quantity.',
        },
      },
      {
        src: '/cases/delivery-gm/preparo.webp',
        alt: {
          pt: 'Página de modos de preparo, com vídeos por produto',
          en: 'Preparation guides page, with a video per product',
        },
        caption: {
          pt: 'Modos de preparo em vídeo, por produto. Congelado que assa errado vira reclamação e cliente perdido, então ensinar o forno certo é parte de vender.',
          en: 'Preparation guides on video, product by product. Frozen food baked wrong turns into a complaint and a lost customer, so teaching the right oven setting is part of selling.',
        },
      },
      {
        src: '/cases/delivery-gm/admin.webp',
        alt: {
          pt: 'Painel de produtos do admin, com 187 itens cadastrados',
          en: 'Admin product panel, with 187 items registered',
        },
        caption: {
          pt: 'O painel onde os 187 produtos são mantidos: preço, categoria, peso, foto e se aparece ou não no catálogo. Quem mexe é o time da loja, sem passar por mim.',
          en: 'The panel where the 187 products are maintained: price, category, weight, photo, and whether it shows in the catalog at all. The shop team handles it without going through me.',
        },
      },
      {
        src: '/cases/delivery-gm/temas.webp',
        alt: {
          pt: 'Tela de temas do site, com opções sazonais',
          en: 'Site themes screen, with seasonal options',
        },
        caption: {
          pt: 'Sete temas sazonais que trocam o visual do catálogo inteiro em um clique. Black Friday, Natal, Festa Junina e Copa do Mundo já vêm prontos, e publicar não exige deploy.',
          en: 'Seven seasonal themes that swap the look of the whole catalog in one click. Black Friday, Christmas, Festa Junina and the World Cup ship ready, and publishing one needs no deploy.',
        },
      },
      {
        src: '/cases/delivery-gm/funil.webp',
        alt: {
          pt: 'Painel de recuperação de clientes, com o funil de saída por etapa',
          en: 'Customer recovery panel, with the drop-off funnel by stage',
        },
        caption: {
          pt: 'O funil mostra em que etapa o cliente desistiu e quais desistências têm telefone conhecido. Deixa de ser "vendemos menos essa semana" e vira uma lista de quem ligar.',
          en: 'The funnel shows which stage the customer gave up at, and which of those drop-offs left a phone number. It stops being "we sold less this week" and becomes a list of who to call.',
        },
      },
    ],
  },
  {
    n: '06',
    slug: 'catalogo-funcionarios',
    name: 'Catálogo de Funcionários',
    status: 'live',
    context: 'Cliente',
    groups: ['gostinho-mineiro'],
    line: {
      pt: 'Loja interna da fábrica: o funcionário compra com crédito da folha e o pedido entra sozinho no ERP como recibo.',
      en: "The factory's internal shop: employees buy against payroll credit and the order posts itself into the ERP as a receipt.",
    },
    stat: {
      pt: [
        '379 funcionários, 363 pedidos desde abril de 2026',
        '83 dos 85 pedidos entraram sozinhos no ERP desde agosto',
        'Crédito, corte de horário e lista da portaria no automático',
      ],
      en: [
        '379 employees, 363 orders since April 2026',
        '83 of 85 orders posted themselves to the ERP since August',
        'Credit, order cut-off and the gate list all run themselves',
      ],
    },
    tags: ['React', 'TypeScript', 'Supabase', 'CIGAM'],
    media: {
      frame: 'desktop',
      /* Nome próprio em vez de `capa.jpg`: a capa deste projeto já foi trocada
         duas vezes, e reaproveitar o mesmo nome deixa o navegador servindo a
         imagem antiga, porque a URL não muda. Nome que descreve o conteúdo
         muda junto com ele. */
      src: '/cases/catalogo-funcionarios/entrada.webp',
      video: '/cases/catalogo-funcionarios/scroll.mp4',
      poster: '/cases/catalogo-funcionarios/poster.webp',
      alt: {
        pt: 'Tela de entrada do sistema, com as opções Sou Funcionário e Sou Cliente',
        en: 'System entry screen, with the options I am an Employee and I am a Customer',
      },
    },
    links: [
      {
        kind: 'github',
        href: 'https://github.com/WinistonAlle/catalogo-funcionarios',
      },
    ],
    problem: {
      pt: [
        'O funcionário mandava mensagem para o faturamento. Alguém lá parava o próprio trabalho e digitava o pedido no sistema, item por item.',
        'Ia item errado, ia valor errado, e demorava. O preço não era só o erro: era o tempo do faturamento, todo dia, gasto num trabalho que não era o deles.',
      ],
      en: [
        'The employee sent a message to the billing team. Someone there dropped their own work and typed the order into the system, item by item.',
        "The wrong item went out, the wrong price went out, and it was slow. The cost was not only the mistake: it was the billing team's time, every day, spent on work that was never theirs.",
      ],
    },
    solution: {
      pt: [
        'O funcionário monta o próprio pedido, com o saldo à vista e o preço já calculado. Ninguém digita mais nada em nome de ninguém.',
        'Dali o pedido entra sozinho no ERP, vira recibo e sai liberado para faturamento. Desde que a integração subiu, em agosto, 83 dos 85 pedidos fizeram esse caminho sem ninguém tocar.',
        'Ao faturamento sobrou imprimir a lista e entregar para a separação.',
      ],
      en: [
        'The employee builds their own order, with their balance in sight and the price already worked out. Nobody types anything on anyone else’s behalf any more.',
        'From there the order posts itself into the ERP, becomes a receipt and comes out cleared for billing. Since the integration went live in August, 83 of 85 orders made that trip untouched.',
        'What was left for the billing team is printing the list and handing it to the packing floor.',
      ],
    },
    gallery: [
      {
        src: '/cases/catalogo-funcionarios/vitrine.webp',
        alt: {
          pt: 'Destaques do catálogo, com as fotos e os preços dos produtos em linha',
          en: 'Catalog highlights, with product photos and prices in a row',
        },
        caption: {
          pt: 'A vitrine que abre o catálogo é escolhida e ordenada arrastando, com a prévia logo acima. Quem monta é a equipe da loja, e a prévia existe para não ter que publicar só pra descobrir como ficou.',
          en: 'The shop window that opens the catalog is picked and ordered by dragging, with a live preview right above. The shop team builds it, and the preview is there so nobody has to publish just to find out how it looks.',
        },
      },
      {
        src: '/cases/catalogo-funcionarios/catalogo.webp',
        alt: {
          pt: 'Catálogo interno, com o saldo do funcionário no topo',
          en: "Internal catalog, with the employee's balance at the top",
        },
        caption: {
          pt: 'O saldo fica no topo, do lado do nome, e acompanha a pessoa por todas as telas. Comprar aqui é gastar um crédito que tem limite, então esconder quanto sobrou seria esconder justo o que decide a compra.',
          en: 'The balance sits at the top, beside the name, and follows the person across every screen. Buying here means spending a credit that runs out, so hiding what is left would hide the very thing that decides the purchase.',
        },
      },
      {
        src: '/cases/catalogo-funcionarios/pedidos.webp',
        alt: {
          pt: 'Administração de pedidos, com a faixa de pedido liberado para hoje',
          en: 'Order administration, with the banner for an order released for today',
        },
        caption: {
          pt: 'A tela do faturamento. A faixa verde no topo é um pedido feito depois das 13:40 que o RH liberou para sair no mesmo dia: antes isso vivia fora do sistema, como recado por voz, e o pedido nascia no papel do dia seguinte.',
          en: "The billing team's screen. The green banner is an order placed after 13:40 that HR released to go out the same day: this used to live outside the system, as a spoken message, and the order was born on the next day's paperwork.",
        },
      },
      {
        src: '/cases/catalogo-funcionarios/relatorios.webp',
        alt: {
          pt: 'Relatório de pedidos, com faturamento, ticket médio e comparação entre meses',
          en: 'Order report, with revenue, average ticket and a month-to-month comparison',
        },
        caption: {
          pt: 'O relatório que o RH usa para fechar o mês. Compara ciclo com ciclo, não mês do calendário com mês do calendário, porque o ciclo real vai do dia 27 ao 26 e essa diferença fazia o total não bater com a folha.',
          en: 'The report HR uses to close the month. It compares cycle against cycle, not calendar month against calendar month, because the real cycle runs from the 27th to the 26th, and that gap is what kept the total from matching payroll.',
        },
      },
      {
        src: '/cases/catalogo-funcionarios/auditoria.webp',
        alt: {
          pt: 'Histórico operacional, com o registro das sincronizações',
          en: 'Operational history, with a record of every sync',
        },
        caption: {
          pt: 'Toda sincronização deixa rastro, inclusive as que rodam sozinhas de vinte em vinte minutos. A recarga de crédito já ficou quatro meses morta sem ninguém perceber, e foi essa tela que passou a ser o lugar onde isso apareceria.',
          en: 'Every sync leaves a trace, including the ones that run themselves every twenty minutes. The monthly credit top-up once sat dead for four months without anyone noticing, and this screen became the place where that would show.',
        },
      },
      {
        src: '/cases/catalogo-funcionarios/painel.webp',
        alt: {
          pt: 'Painel de operação, com as ações de sincronizar, restaurar saldo e liberar pedido',
          en: 'Operations panel, with actions to sync, restore balance and release an order',
        },
        caption: {
          pt: 'A sala de máquinas. Cada botão aqui era, antes, uma mensagem pra mim: sincronizar a planilha, restaurar o saldo do ciclo, liberar um pedido fora do horário. O topo mostra o estado de cada engrenagem, para a resposta a "está rodando?" não depender de perguntar.',
          en: 'The engine room. Every button here used to be a message to me: sync the spreadsheet, restore the cycle balance, release an order past the cut-off. The top shows the state of each moving part, so answering "is it running?" no longer means asking someone.',
        },
      },
    ],
  },
  {
    n: '07',
    slug: 'marsbeer',
    name: 'MARS BEER',
    status: 'live',
    context: 'Faculdade',
    groups: ['outros'],
    line: {
      pt: 'Trabalho de faculdade que passou do enunciado: loja com carrinho, painel administrativo e três cadastros que se cruzam num relatório.',
      en: 'University coursework that outgrew the brief: a shop with a cart, an admin panel, and three registries that meet in one report.',
    },
    stat: {
      pt: [
        'Tema claro e escuro, rota protegida e dois perfis de acesso',
        'Três cadastros servidos por um só componente de tabela',
        'Relatório cruza pedidos, clientes e cervejas em JavaScript',
      ],
      en: [
        'Light and dark themes, guarded routes and two access roles',
        'Three registries served by a single table component',
        'The report joins orders, customers and beers in JavaScript',
      ],
    },
    tags: ['React', 'Vite', 'React Router', 'JavaScript'],
    media: {
      frame: 'desktop',
      src: '/cases/marsbeer/capa.webp',
      video: '/cases/marsbeer/scroll.mp4',
      poster: '/cases/marsbeer/poster.webp',
      alt: {
        pt: 'Topo do site da MARS BEER, com três garrafas rotuladas ao lado do título',
        en: 'Top of the MARS BEER site, with three labelled bottles beside the headline',
      },
    },
    links: [
      {
        kind: 'github',
        href: 'https://github.com/WinistonAlle/trabalho-web-ucb',
      },
    ],
    gallery: [
      {
        src: '/cases/marsbeer/login.webp',
        alt: {
          pt: 'Tela de login dividida, com escolha entre Administrador e Cliente',
          en: 'Split login screen, choosing between Administrator and Customer',
        },
        caption: {
          pt: 'A entrada já pergunta quem está chegando, e a resposta muda o site inteiro: cliente cai na loja, administrador cai no painel. O enunciado pedia login; dois perfis foi o que tornou o resto necessário.',
          en: 'The door asks who is arriving, and the answer changes the whole site: a customer lands in the shop, an administrator in the panel. The brief asked for a login; two roles are what made everything else necessary.',
        },
      },
      {
        src: '/cases/marsbeer/loja.webp',
        alt: {
          pt: 'Loja com as cervejas em cards e o resumo do pedido ao lado',
          en: 'Shop with the beers as cards and the order summary beside them',
        },
        caption: {
          pt: 'O lado do cliente. O carrinho fica fixo ao lado da vitrine, com o total somando ao vivo: numa loja, o número que importa é o que você já gastou, e ele não deveria estar a um clique de distância.',
          en: 'The customer side. The cart stays pinned next to the shelf, with the total adding up live: in a shop, the number that matters is what you have already spent, and it should not be one click away.',
        },
      },
      {
        src: '/cases/marsbeer/crud.webp',
        alt: {
          pt: 'Cadastro de cervejas, com busca e as ações de editar e excluir',
          en: 'Beer registry, with search and the edit and delete actions',
        },
        caption: {
          pt: 'Um dos três cadastros. Cervejas, clientes e pedidos são telas diferentes servidas pelo mesmo componente de tabela, que recebe as colunas e as ações por parâmetro. Era a chance de escrever a mesma tela três vezes e não escrevi.',
          en: 'One of the three registries. Beers, customers and orders are different screens served by the same table component, which takes its columns and actions as parameters. It was a chance to write the same screen three times, and I did not.',
        },
      },
      {
        src: '/cases/marsbeer/relatorio.webp',
        alt: {
          pt: 'Relatório de pedidos cruzando cliente, cerveja, quantidade e total',
          en: 'Order report joining customer, beer, quantity and total',
        },
        caption: {
          pt: 'O relatório é onde os três cadastros se encontram: cada linha junta um pedido, o cliente que fez e a cerveja que saiu. Sem banco de dados, o cruzamento é feito em JavaScript, e é ele que transforma três listas soltas em uma informação.',
          en: 'The report is where the three registries meet: each row joins an order, the customer who placed it and the beer that went out. With no database, the join happens in JavaScript, and it is what turns three loose lists into one piece of information.',
        },
      },
    ],
  },
  {
    n: '08',
    slug: 'pdv-gm',
    name: 'PDV Gostinho Mineiro',
    status: 'live',
    context: 'Cliente',
    groups: ['gostinho-mineiro'],
    line: {
      pt: 'A frente de caixa da loja, refeita para fechar uma venda em poucos cliques e lançar direto no ERP.',
      en: 'The shop counter, rebuilt to close a sale in a few clicks and post it straight into the ERP.',
    },
    stat: {
      pt: [
        '684 vendas em produção desde 14 de agosto de 2026',
        '890 testes automatizados, em 53 arquivos',
        'Preço e estoque vêm do CIGAM, e a venda volta pra lá',
      ],
      en: [
        '684 sales in production since 14 August 2026',
        '890 automated tests, across 53 files',
        'Prices and stock come from CIGAM, and the sale goes back',
      ],
    },
    tags: ['React', 'TypeScript', 'Node', 'CIGAM'],
    media: {
      frame: 'desktop',
      src: '/cases/pdv/capa.webp',
      video: '/cases/pdv/scroll.mp4',
      poster: '/cases/pdv/poster.webp',
      alt: {
        pt: 'Menu do PDV, com os atalhos de venda, totem, relatório e administração',
        en: 'POS menu, with shortcuts for sales, kiosk, reports and administration',
      },
    },
    problem: {
      pt: [
        'O sistema anterior era moroso: muitos botões para clicar e muitos campos para digitar até uma venda fechar.',
        'Num caixa, esse tempo não é abstrato. Ele acontece com o cliente parado do outro lado do balcão.',
      ],
      en: [
        'The previous system was slow: too many buttons to click and too many fields to type before a sale closed.',
        'At a counter, that time is not abstract. It happens with the customer standing on the other side.',
      ],
    },
    solution: {
      pt: [
        'A venda fecha em poucos cliques: busca o produto, adiciona, cobra. O pagamento aceita dividir entre formas sem sair da tela.',
        'E ela nasce integrada. Preço e estoque vêm do CIGAM, e o pedido volta pra lá como documento, sem ninguém redigitar nada.',
        '684 vendas passaram por ele desde 14 de agosto, e 890 testes automatizados seguram o que não pode quebrar no meio de um atendimento.',
      ],
      en: [
        'A sale closes in a few clicks: search the product, add it, take the money. Payment can be split across methods without leaving the screen.',
        'And it is born integrated. Prices and stock come from CIGAM, and the order goes back there as a document, with nobody retyping anything.',
        '684 sales have gone through it since 14 August, and 890 automated tests hold up what cannot break in the middle of serving someone.',
      ],
    },
    gallery: [
      {
        src: '/cases/pdv/carrinho.webp',
        alt: {
          pt: 'Carrinho do PDV, com busca de produto, tabelas de preço e os itens do pedido',
          en: 'POS cart, with product search, price tables and the order items',
        },
        caption: {
          pt: 'Uma busca e um clique por item. Cada resultado já traz o estoque e o preço da tabela escolhida, então quem está no caixa não abre outra tela para conferir se tem e quanto custa.',
          en: 'One search and one click per item. Each result already carries stock and the price from the chosen table, so whoever is at the till never opens another screen to check availability or price.',
        },
      },
      {
        src: '/cases/pdv/pagamento.webp',
        alt: {
          pt: 'Tela de pagamento, com a venda dividida entre duas entradas de valor',
          en: 'Payment screen, with the sale split across two amounts',
        },
        caption: {
          pt: 'O pagamento aceita dividir: parte no débito, o resto em pix ou dinheiro, somando na tela até fechar o total. É o caso que mais aparece no balcão e o que mais travava o sistema antigo.',
          en: 'Payment can be split: part on card, the rest by transfer or cash, adding up on screen until the total is covered. It is the most common case at the counter, and the one that jammed the old system most.',
        },
      },
      {
        src: '/cases/pdv/dashboard.webp',
        alt: {
          pt: 'Painel administrativo com o total vendido no dia e os caixas abertos',
          en: 'Admin panel with the day total and the tills currently open',
        },
        caption: {
          pt: 'O painel de quem administra a loja: quanto saiu hoje, por qual forma de pagamento, e quais caixas estão abertos agora. A coluna de operador está tarjada porque são nomes de gente que trabalha lá.',
          en: 'The panel for whoever runs the shop: what went out today, by payment method, and which tills are open right now. The operator column is redacted because those are the names of people who work there.',
        },
      },
      {
        src: '/cases/pdv/impressoras.webp',
        alt: {
          pt: 'Tela de impressoras, com uma entrada de endereço por impressora',
          en: 'Printers screen, with one address field per printer',
        },
        caption: {
          pt: 'O sistema fala com as impressoras da loja e da portaria, e cada uma pode ser ligada ou desligada sem mexer em código. Os endereços estão tarjados por serem da rede interna da empresa.',
          en: 'The system talks to the printers on the shop floor and at the gate, and each one can be switched on or off without touching code. The addresses are redacted because they belong to the company network.',
        },
      },
    ],
  },
  {
    n: '09',
    slug: 'evolua',
    name: 'Evolua',
    status: 'wip',
    context: 'Produto próprio',
    groups: ['outros', 'sites'],
    line: {
      pt: 'Nasceu pra facilitar o plantão de um médico: paciente, prontuário, exames e observações no mesmo lugar, achados rápido.',
      en: "Built to make a doctor's shift easier: patient, records, tests and notes in one place, found fast.",
    },
    stat: {
      pt: [
        'Landing no ar; a área interna ficou em código',
        'Ficha reúne prontuário, exames e observações do paciente',
        'Multi-organização, com separação por clínica no banco',
      ],
      en: [
        'Landing page done; the private area stayed in code',
        'One record holds a patient’s history, tests and notes',
        'Multi-organisation, with clinics separated in the database',
      ],
    },
    tags: ['React', 'TypeScript', 'Supabase', 'styled-components'],
    media: {
      frame: 'desktop',
      src: '/cases/evolua/capa.webp',
      video: '/cases/evolua/scroll.mp4',
      poster: '/cases/evolua/poster.webp',
      alt: {
        pt: 'Topo da landing do Evolua, com o título sobre o fluxo de cuidado',
        en: 'Top of the Evolua landing page, with the headline about care flow',
      },
    },
    links: [{ kind: 'github', href: 'https://github.com/WinistonAlle/Evolua' }],
    gallery: [
      {
        src: '/cases/evolua/fluxo.webp',
        alt: {
          pt: 'Seção com as três etapas do fluxo de atendimento',
          en: 'Section with the three stages of the care flow',
        },
        caption: {
          pt: 'O produto resumido em três passos, na ordem em que acontecem: cadastrar, abrir na consulta, acompanhar depois. É a promessa central escrita sem rodeio, que é abrir prontuário e exame por botão em vez de caçar link.',
          en: 'The product in three steps, in the order they happen: register, open during the appointment, follow up after. It states the central promise plainly: open records and test results with a button instead of hunting for links.',
        },
      },
      {
        src: '/cases/evolua/sobre.webp',
        alt: {
          pt: 'Seção sobre o sistema, com as listas do que ele serve e onde ajuda',
          en: 'About section, listing what the system is for and where it helps',
        },
        caption: {
          pt: 'Duas listas em vez de um texto corrido: para que serve e onde ajuda mais. Quem decide comprar software de consultório não lê parágrafo, procura a linha que descreve o próprio dia.',
          en: 'Two lists instead of a block of prose: what it is for and where it helps most. People choosing clinic software do not read paragraphs, they look for the line that describes their own day.',
        },
      },
      {
        src: '/cases/evolua/login.webp',
        alt: {
          pt: 'Tela de login do Evolua, dividida entre a marca e o formulário',
          en: 'Evolua login screen, split between the brand and the form',
        },
        caption: {
          pt: 'A porta da área interna. Ela existe, e atrás dela existe o código da ficha do paciente, do prontuário e dos exames. O que não existe mais é o banco: o projeto parou antes de entrar em uso e o Supabase dele foi desativado.',
          en: 'The door to the private area. It exists, and behind it lives the code for the patient record, the history and the test results. What no longer exists is the database: the project stopped before going live and its Supabase was shut down.',
        },
      },
    ],
  },
  {
    n: '10',
    slug: 'totem-loja',
    name: 'Totem da Loja',
    status: 'live',
    context: 'Cliente',
    groups: ['gostinho-mineiro'],
    line: {
      pt: 'Totem de autoatendimento da loja: o cliente monta o pedido na tela e o caixa só cobra.',
      en: 'Self-service kiosk for the shop: the customer builds the order on screen and the till only takes the money.',
    },
    stat: {
      pt: [
        '178 produtos no catálogo, 177 já casados com o ERP',
        'O pedido sai do totem pronto pra ser cobrado no PDV',
        'PWA em tela cheia, servida pelo servidor da própria loja',
      ],
      en: [
        '178 products in the catalog, 177 already matched to the ERP',
        'The order leaves the kiosk ready to be charged at the POS',
        "Full-screen PWA, served from the shop's own server",
      ],
    },
    tags: ['React', 'TypeScript', 'Supabase', 'PWA'],
    media: {
      frame: 'totem',
      src: '/cases/totem/capa.webp',
      video: '/cases/totem/scroll.mp4',
      poster: '/cases/totem/poster.webp',
      alt: {
        pt: 'Tela de abertura do totem, com a marca e o botão de começar',
        en: 'Kiosk welcome screen, with the brand and the start button',
      },
    },
    problem: {
      pt: [
        'Fila na loja. E boa parte dela não era gente pagando: era gente decidindo, parada na frente do balcão.',
        'Escolher leva tempo, e ali esse tempo acontecia no lugar mais caro possível, com o caixa ocupado e a fila crescendo atrás.',
      ],
      en: [
        'Queues in the shop. And much of the queue was not people paying: it was people deciding, standing at the counter.',
        'Choosing takes time, and there that time happened in the most expensive place possible, with the till occupied and the line growing behind.',
      ],
    },
    solution: {
      pt: [
        'Agora escolher acontece antes do caixa, no totem, e no tempo de cada um. Ninguém mais segura a fila lendo o catálogo.',
        'O pedido confirmado cai montado na fila do PDV, e de lá vira documento no CIGAM sem ninguém redigitar. Ao caixa sobrou a parte rápida: abrir e cobrar.',
      ],
      en: [
        'Choosing now happens before the till, at the kiosk, at each person’s own pace. Nobody holds up the queue reading the catalog.',
        'The confirmed order lands fully built in the POS queue, and from there it becomes a document in CIGAM with nobody retyping it. What is left for the till is the fast part: open and charge.',
      ],
    },
    gallery: [
      {
        src: '/cases/totem/catalogo.webp',
        alt: {
          pt: 'Catálogo do totem, com as categorias na lateral e os produtos em grade',
          en: 'Kiosk catalog, with categories on the side and products in a grid',
        },
        caption: {
          pt: 'Tudo ao alcance do polegar, sem menu escondido: as categorias ficam abertas na lateral e cada produto tem foto, preço e o botão de adicionar na mesma célula. Quem está de pé na loja não vai caçar submenu.',
          en: 'Everything within thumb reach, nothing hidden in a menu: categories stay open on the side and each product carries photo, price and the add button in the same cell. Someone standing in a shop will not go hunting through submenus.',
        },
      },
      {
        src: '/cases/totem/sacola.webp',
        alt: {
          pt: 'Catálogo com a sacola mostrando itens e total na parte de baixo',
          en: 'Catalog with the bag showing items and total along the bottom',
        },
        caption: {
          pt: 'A sacola acompanha a pessoa pelo catálogo inteiro, com a conta somando ao vivo. Numa loja, saber quanto já deu antes de chegar no caixa é o que evita a desistência na frente da fila.',
          en: 'The bag follows the person through the whole catalog, with the total adding up live. In a shop, knowing the running total before reaching the till is what prevents someone backing out in front of the queue.',
        },
      },
      {
        src: '/cases/totem/revisao.webp',
        alt: {
          pt: 'Revisão do pedido, com itens, quantidades e total antes de confirmar',
          en: 'Order review, with items, quantities and total before confirming',
        },
        caption: {
          pt: 'A última tela do totem, e ela não cobra nada. O pedido confirmado aqui vai para a fila do PDV, e o caixa só abre e recebe. É esse recorte que faz o totem valer: ele tira do balcão a parte demorada, que é decidir.',
          en: 'The last screen of the kiosk, and it takes no payment. The order confirmed here goes into the POS queue, and the cashier just opens it and collects. That split is what makes the kiosk worth it: it takes the slow part, deciding, off the counter.',
        },
      },
    ],
  },
  {
    n: '11',
    slug: 'portfolio',
    name: 'Este portfólio',
    status: 'live',
    context: 'Produto próprio',
    groups: ['outros', 'sites'],
    line: {
      pt: 'O site que você está lendo agora: bilíngue, com abertura em 3D no computador e no celular, e um case por projeto.',
      en: 'The site you are reading right now: bilingual, with a 3D opening on desktop and on phones, and one case per project.',
    },
    stat: {
      pt: [
        'Vinte e três cases, cada um com vídeo do sistema rodando de verdade',
        'Português e inglês na mesma base: tradução faltando quebra o build',
        'A abertura é um MacBook 3D em three.js, guiado pela rolagem; no celular, um iPhone',
      ],
      en: [
        'Twenty-three cases, each with video of the system actually running',
        'Portuguese and English from one source: a missing translation breaks the build',
        'The opening is a 3D MacBook in three.js, driven by scroll; on phones, an iPhone',
      ],
    },
    tags: ['Next.js', 'TypeScript', 'three.js', 'Tailwind'],
    media: {
      frame: 'desktop',
      src: '/cases/portfolio/home-v2.webp',
      video: '/cases/portfolio/tour-v2.mp4',
      poster: '/cases/portfolio/poster-v2.webp',
      alt: {
        pt: 'Home do portfólio como uma área de trabalho de Mac, com barra de menu, widgets, ícones e o título Sistemas e sites que empresas usam todo dia',
        en: 'Portfolio home as a Mac desktop, with menu bar, widgets, icons and the headline Systems and sites that companies use every day',
      },
    },
    links: [
      { kind: 'site', href: 'https://winiston.com.br' },
      { kind: 'github', href: 'https://github.com/WinistonAlle/portfolio' },
    ],
    gallery: [
      {
        src: '/cases/portfolio/abertura3d-v2.webp',
        alt: {
          pt: 'MacBook 3D fechado, de costas, com adesivos de tecnologia na tampa',
          en: 'Closed 3D MacBook seen from behind, technology stickers on the lid',
        },
        caption: {
          pt: 'O site abre com este MacBook, em three.js puro, sem biblioteca de React por cima: ele gira, abre, e a câmera entra até a tela dele virar exatamente a moldura onde o site aparece. Nada disso é animação com duração própria, é tudo função da rolagem, então quem desce rápido chega ao site rápido. Os adesivos da tampa são desenhados num atlas único, pra tampa inteira custar uma textura só. E sim: este é o único lugar do portfólio onde a moldura do case é o próprio site.',
          en: 'The site opens with this MacBook, in plain three.js with no React layer on top: it spins, opens, and the camera moves in until its screen becomes exactly the frame the site appears in. None of it is an animation with a duration of its own, it is all a function of scroll, so scrolling fast gets you to the site fast. The lid stickers are drawn into a single atlas so the whole lid costs one texture. And yes: this is the one place in the portfolio where the case mockup is the site itself.',
        },
      },
      {
        src: '/cases/portfolio/abertura-tela-v2.webp',
        alt: {
          pt: 'MacBook 3D aberto, de frente, com a home do portfólio aparecendo na tela dele',
          en: '3D MacBook open, facing the viewer, with the portfolio home showing on its screen',
        },
        caption: {
          pt: 'Quando a tampa abre, o que aparece na tela do MacBook já é o site de verdade, projetado sobre a tela 3D, e não uma foto dele. Por isso a passagem para a página inteira não tem troca: o zoom só termina de encaixar o que já estava ali.',
          en: 'When the lid opens, what shows on the MacBook screen is already the real site, projected onto the 3D screen, not a picture of it. That is why the move to the full page has no swap: the zoom just finishes fitting what was already there.',
        },
      },
      {
        src: '/cases/portfolio/home-v2.webp',
        alt: {
          pt: 'Home do portfólio como área de trabalho de Mac, com widgets de foto e de total de sistemas, ícones de pasta e arquivo, e o Dock embaixo',
          en: 'Portfolio home as a Mac desktop, with photo and system-count widgets, folder and file icons, and the Dock at the bottom',
        },
        caption: {
          pt: 'A home é uma mesa de macOS: a barra de menu faz o papel do cabeçalho, e cada ícone abre uma janela que vira a página. O número do widget é contado a partir dos próprios dados dos projetos.',
          en: 'The home is a macOS desktop: the menu bar plays the role of the header, and each icon opens a window that becomes the page. The widget number is counted from the project data itself.',
        },
      },
      {
        src: '/cases/portfolio/iphone-v2.webp',
        alt: {
          pt: 'Três telas de celular lado a lado: um iPhone 3D de costas com o monograma WA, o mesmo iPhone de frente com a home na tela, e a home ocupando a tela inteira',
          en: 'Three phone screens side by side: a 3D iPhone seen from behind with the WA monogram, the same iPhone from the front with the home on its screen, and the home filling the whole screen',
        },
        caption: {
          pt: 'No celular o notebook ficaria pequeno demais para ler, então a abertura é um iPhone: ele gira, mostra a tela e o zoom entra nela. Lá dentro a home vira uma tela inicial de iPhone, com os mesmos atalhos em forma de aplicativo.',
          en: 'On a phone the laptop would be too small to read, so the opening is an iPhone: it spins, shows its screen and the zoom moves into it. Inside, the home becomes an iPhone home screen, with the same shortcuts as apps.',
        },
      },
      {
        src: '/cases/portfolio/projetos-v2.webp',
        alt: {
          pt: 'Página de projetos, com filtros por grupo e uma grade de cards em três colunas',
          en: 'Projects page, with group filters and a three-column grid of cards',
        },
        caption: {
          pt: 'Os projetos em grade, com filtro por grupo. Um mesmo projeto pode aparecer em mais de um filtro, porque as etiquetas respondem a perguntas diferentes: para quem foi feito e o que é.',
          en: 'The projects in a grid, filtered by group. The same project can show up under more than one filter, because the labels answer different questions: who it was made for and what it is.',
        },
      },
      {
        src: '/cases/portfolio/cracha-v2.webp',
        alt: {
          pt: 'Página sobre mim, com um crachá pendurado num cordão ao lado do texto',
          en: 'About me page, with a badge hanging from a lanyard beside the text',
        },
        caption: {
          pt: 'O crachá não é imagem: é um cordão com física, que balança e responde ao arrasto do mouse. Ele fica escondido enquanto a corda ainda está caindo, porque o que convence é ele já estar parado quando aparece.',
          en: 'The badge is not an image: it is a lanyard with physics, swinging and responding to the drag of the mouse. It stays hidden while the rope is still falling, because what convinces is finding it already at rest.',
        },
      },
      {
        src: '/cases/portfolio/stack-v2.webp',
        alt: {
          pt: 'Mapa da stack, com as ferramentas em leques ligados por linhas ao monograma WA no centro',
          en: 'Stack map, with tools in fans connected by lines to the WA monogram in the centre',
        },
        caption: {
          pt: 'Lista de tecnologia não diz nada: todo mundo tem uma. Aqui as peças aparecem ligadas, agrupadas por frente, porque o que interessa não é quais eu sei, é como elas se encaixam num sistema.',
          en: 'A list of technologies says nothing: everybody has one. Here the pieces appear connected, grouped by area, because what matters is not which ones I know, it is how they fit together into a system.',
        },
      },
      {
        src: '/cases/portfolio/contato-v2.webp',
        alt: {
          pt: 'Página de contato, com os canais em blocos isométricos e um formulário curto embaixo',
          en: 'Contact page, with channels as isometric blocks and a short form below',
        },
        caption: {
          pt: 'Três campos, e o botão abre o WhatsApp com a mensagem já montada. Formulário que manda e-mail e some é onde contato morre: aqui a conversa começa no lugar onde eu de fato respondo.',
          en: 'Three fields, and the button opens WhatsApp with the message already written. A form that sends an email into the void is where contact dies: here the conversation starts where I actually reply.',
        },
      },
    ],
  },
  {
    n: '12',
    slug: 'dashboard-financeiro',
    name: 'Dashboard Financeiro',
    status: 'live',
    context: 'Cliente',
    groups: ['outros'],
    line: {
      pt: 'Painel de vendas para a diretoria: 138 meses de faturamento em três empresas, com 18 análises comparativas prontas.',
      en: 'Sales dashboard for the board: 138 months of revenue across three companies, with 18 comparative analyses ready to use.',
    },
    nota: {
      pt: 'Todos os números, nomes de cliente e rotas deste case são FICTÍCIOS, gerados por um script feito para isso. O sistema é real e está em uso, mas os dados dele são faturamento e carteira de clientes de uma empresa, e isso não vai para um portfólio. A base falsa preserva as relações internas da verdadeira (o ticket é o faturamento dividido pelos pedidos, o diário soma o mês), então o que você vê aqui é o comportamento do painel, não a operação de ninguém.',
      en: 'Every number, client name and route in this case is FICTITIOUS, produced by a script written for that purpose. The system is real and in use, but its data is a company’s revenue and client base, and that does not belong in a portfolio. The fake dataset preserves the real one’s internal relations (ticket is revenue divided by orders, daily figures add up to the month), so what you see here is how the dashboard behaves, not anyone’s actual operation.',
    },
    stat: {
      pt: [
        'Dados fictícios: o sistema é real, os números não',
        '138 meses consolidados de três empresas, de 11/2021 a 04/2026',
        '18 análises comparativas, de Pareto 80/20 a coorte de retenção',
        'Roda local, sem nada saindo da máquina de quem usa',
      ],
      en: [
        'Fictitious data: the system is real, the numbers are not',
        '138 months consolidated across three companies, from 11/2021 to 04/2026',
        '18 comparative analyses, from Pareto 80/20 to retention cohorts',
        'Runs locally, with nothing leaving the machine of whoever uses it',
      ],
    },
    tags: ['React', 'Recharts', 'Python', 'Vite'],
    media: {
      frame: 'desktop',
      src: '/cases/dashboard/resumo.webp',
      video: '/cases/dashboard/scroll.mp4',
      poster: '/cases/dashboard/poster.webp',
      alt: {
        pt: 'Resumo executivo do painel, com indicadores do período e a evolução do faturamento (dados fictícios)',
        en: 'Executive summary of the dashboard, with period indicators and revenue over time (fictitious data)',
      },
    },
    gallery: [
      {
        src: '/cases/dashboard/detalhe.webp',
        alt: {
          pt: 'Painel lateral com o detalhamento de um mês: indicadores, participação por empresa e produtos (dados fictícios)',
          en: 'Side panel detailing one month: indicators, share per company and products (fictitious data)',
        },
        caption: {
          pt: 'Clicar em qualquer ponto do gráfico abre o mês por dentro: quanto cada empresa fez, o mix por linha de produto e os SKUs vendidos, sem sair da tela. Antes essa pergunta virava uma planilha nova.',
          en: 'Clicking any point on the chart opens the month from the inside: what each company made, the mix by product line and the SKUs sold, without leaving the screen. That question used to turn into a brand new spreadsheet.',
        },
      },
      {
        src: '/cases/dashboard/heatmap.webp',
        alt: {
          pt: 'Mapa de calor de clientes por mês, com as 18 análises comparativas acima (dados fictícios)',
          en: 'Heatmap of clients by month, with the 18 comparative analyses above (fictitious data)',
        },
        caption: {
          pt: 'O mapa de calor mostra quando cada cliente comprou nos últimos quatro anos. É onde um sumiço aparece: a linha que era cheia e ficou vazia é um cliente que parou, e ninguém tinha percebido.',
          en: 'The heatmap shows when each client bought over the last four years. It is where a disappearance becomes visible: a row that used to be full and went empty is a client who stopped, and nobody had noticed.',
        },
      },
      {
        src: '/cases/dashboard/ano.webp',
        alt: {
          pt: 'Comparação ano contra ano, com faturamento, pedidos, clientes e ticket lado a lado (dados fictícios)',
          en: 'Year against year comparison, with revenue, orders, clients and ticket side by side (fictitious data)',
        },
        caption: {
          pt: 'As comparações vêm prontas com a leitura já escrita em cima. A diretoria não precisa montar a conta nem lembrar contra o que está comparando: escolhe os dois anos e lê a frase.',
          en: 'The comparisons come ready with the reading already written on top. The board does not have to build the calculation or remember what it is comparing against: pick the two years and read the sentence.',
        },
      },
      {
        src: '/cases/dashboard/tabela.webp',
        alt: {
          pt: 'Tabela de dados brutos, mês a mês, ordenada por faturamento (dados fictícios)',
          en: 'Raw data table, month by month, sorted by revenue (fictitious data)',
        },
        caption: {
          pt: 'Embaixo de todo gráfico existe a tabela crua, ordenável e exportável em CSV. Painel que só mostra gráfico obriga a confiar nele; este deixa conferir linha por linha, que é o que faz alguém parar de manter a planilha paralela.',
          en: 'Underneath every chart there is the raw table, sortable and exportable to CSV. A dashboard that only shows charts forces you to trust it; this one lets you check row by row, which is what makes someone stop keeping the parallel spreadsheet.',
        },
      },
    ],
  },
  {
    n: '13',
    slug: 'lua-de-mel',
    name: 'Lua de Mel',
    status: 'live',
    context: 'Produto próprio',
    groups: ['outros', 'sites'],
    line: {
      pt: 'Roteiro interativo de uma lua de mel de 24 dias em Madri e no Japão, feito de presente e pensado pra ser usado na rua.',
      en: 'Interactive itinerary for a 24 day honeymoon in Madrid and Japan, made as a gift and built to be used out on the street.',
    },
    stat: {
      pt: [
        '24 dias e 156 paradas, 116 delas abrindo direto no Google Maps',
        'Madri é catálogo e o Japão é agenda, porque o roteiro real é assim',
        'Globo 3D, bilhete de embarque que rasga e busca que acha qualquer dia',
        'Site estático: abre sem depender de rede no meio da rua no Japão',
      ],
      en: [
        '24 days and 156 stops, 116 of them opening straight in Google Maps',
        'Madrid is a catalog and Japan is a schedule, because the real plan is like that',
        'A 3D globe, a boarding pass that tears and a search that finds any day',
        'Static site: it opens without depending on a signal mid street in Japan',
      ],
    },
    tags: ['Next.js', 'TypeScript', 'three.js', 'GSAP'],
    media: {
      frame: 'desktop',
      src: '/cases/lua-de-mel/capa.webp',
      video: '/cases/lua-de-mel/scroll.mp4',
      poster: '/cases/lua-de-mel/poster.webp',
      alt: {
        pt: 'Abertura do capítulo de Madri, com o globo girando até a Espanha ao lado do título',
        en: 'Opening of the Madrid chapter, with the globe turning to Spain beside the title',
      },
    },
    links: [
      { kind: 'site', href: 'https://lua-de-mel-olive.vercel.app' },
      { kind: 'github', href: 'https://github.com/WinistonAlle/lua-de-mel' },
    ],
    problem: {
      pt: [
        'O roteiro existia, mas existia como documento: vinte e tantas páginas que ninguém abre no meio da rua, com o celular na mão e a bateria caindo.',
        'E documento não sabe onde você está. Descobrir o que fazer na quinta à tarde em Kyoto era rolar o arquivo inteiro, e o endereço ainda precisava ser copiado na mão pro mapa.',
      ],
      en: [
        'The itinerary existed, but it existed as a document: twenty odd pages nobody opens mid street, phone in hand and the battery dropping.',
        'And a document does not know where you are. Finding out what to do on Thursday afternoon in Kyoto meant scrolling the whole file, and the address still had to be copied by hand into a map.',
      ],
    },
    solution: {
      pt: [
        'O roteiro virou uma linha do tempo por dia, com tudo aberto na tela. Nada escondido atrás de clique, porque na rua ninguém tem paciência de caçar, e cada lugar citado abre no Google Maps num toque.',
        'Madri e Japão são modelados diferente de propósito. O documento fecha o Japão hora a hora e deixa Madri em aberto, então o site mostra o Japão como agenda e Madri como catálogo de vontades. Forçar os dois no mesmo formato seria inventar um plano que não existe.',
        'Como também é presente, ele tem que emocionar: carta na abertura, globo girando até a próxima cidade, bilhete de embarque que rasga no dedo. A regra foi que nada disso podia atrapalhar quem só quer saber a que horas sai o trem.',
      ],
      en: [
        'The itinerary became a timeline by day, with everything open on screen. Nothing hidden behind a click, because out on the street nobody has the patience to go hunting, and every place named opens in Google Maps in one tap.',
        'Madrid and Japan are modelled differently on purpose. The document pins Japan down hour by hour and leaves Madrid open, so the site shows Japan as a schedule and Madrid as a catalog of wishes. Forcing both into the same format would be inventing a plan that does not exist.',
        'Since it is also a gift, it has to move them: a letter at the opening, a globe turning to the next city, a boarding pass that tears under your finger. The rule was that none of it could get in the way of someone who just wants to know when the train leaves.',
      ],
    },
    gallery: [
      {
        src: '/cases/lua-de-mel/abertura.webp',
        alt: {
          pt: 'Abertura do site, com o contador de dias em cima e a carta amassada como uma bola de papel',
          en: 'Site opening, with the day counter above and the letter crumpled into a ball of paper',
        },
        caption: {
          pt: 'O site abre com uma carta escrita pro casal e o contador de dias em cima dela. A carta não fica no caminho: amassa e joga fora, e a viagem começa. Presente que obriga a ler antes de usar vira obstáculo.',
          en: 'The site opens with a letter written to the couple and the day counter above it. The letter does not get in the way: crumple it, throw it out, and the trip begins. A gift that forces you to read before using it becomes an obstacle.',
        },
      },
      {
        src: '/cases/lua-de-mel/transito.webp',
        alt: {
          pt: 'Dia de voo, com o bilhete de embarque de Brasília para Madri e o roteiro da partida ao lado',
          en: 'Flight day, with the boarding pass from Brasília to Madrid and the departure plan beside it',
        },
        caption: {
          pt: 'Cada voo vira um bilhete de embarque de verdade, com número, horário e escala tirados do roteiro. O canhoto rasga quando se puxa. O dia de avião deixa de ser uma linha de texto e vira a coisa que ele é.',
          en: 'Each flight becomes a real boarding pass, with the number, the time and the stopover taken from the itinerary. The stub tears when you pull it. A flying day stops being a line of text and becomes the thing it actually is.',
        },
      },
      {
        src: '/cases/lua-de-mel/toquio.webp',
        alt: {
          pt: 'Cartão de um dia em Tóquio, dividido em fim de tarde e noite, com um selo de falta reservar e um plano B',
          en: 'Card for a day in Tokyo, split into late afternoon and night, with a still to book tag and a plan B',
        },
        caption: {
          pt: 'Um dia do Japão inteiro na tela, dividido em manhã, tarde e noite, porque às três da tarde o que importa é o que ainda vem. O selo vermelho marca só o que falta reservar, e o plano B já fica escrito embaixo, pronto pro dia em que chover.',
          en: 'A whole Japanese day on screen, split into morning, afternoon and night, because at three in the afternoon what matters is what is still ahead. The red tag marks only what is still to be booked, and plan B is already written underneath, ready for the day it rains.',
        },
      },
      {
        src: '/cases/lua-de-mel/busca.webp',
        alt: {
          pt: 'Busca aberta sobre o site, com as cidades da viagem e a contagem de dias que faltam',
          en: 'Search open over the site, with the cities of the trip and the countdown of days left',
        },
        caption: {
          pt: 'A busca abre em qualquer ponto do site e acha lugar, cidade ou dia pelo nome. Ela só existe porque o site vai ser usado durante a viagem: quando a pergunta é "era hoje o Ghibli?", ninguém quer rolar 24 dias pra descobrir.',
          en: 'Search opens from anywhere on the site and finds a place, a city or a day by name. It only exists because the site will be used during the trip: when the question is "was Ghibli today?", nobody wants to scroll 24 days to find out.',
        },
      },
    ],
  },
  {
    n: '14',
    slug: 'kings-table',
    name: "King’s Table",
    status: 'wip',
    context: 'Produto próprio',
    groups: ['outros', 'sites'],
    line: {
      pt: 'App de poker para home game: o relógio, quem pagou, a premiação e o ranking da temporada num lugar só.',
      en: 'A poker app for home games: the clock, who has paid, the payouts and the season ranking in one place.',
    },
    stat: {
      pt: [
        'Landing no ar com lista de espera; o app fica atrás do login',
        '8 áreas e 106 funcionalidades descritas na landing',
        '22 suítes de teste no app, do relógio à sincronia offline',
        '10 tabelas com RLS: cada conta só enxerga as próprias noites',
      ],
      en: [
        'Landing page live with a waiting list; the app sits behind the login',
        '8 areas and 106 features described on the landing page',
        '22 test suites in the app, from the clock to offline sync',
        '10 tables with RLS: each account only ever sees its own nights',
      ],
    },
    tags: ['Next.js', 'Expo', 'TypeScript', 'Supabase'],
    media: {
      frame: 'desktop',
      src: '/cases/kings-table/capa.webp',
      video: '/cases/kings-table/scroll.mp4',
      poster: '/cases/kings-table/poster.webp',
      alt: {
        pt: "Topo da landing do King’s Table, com uma maleta de fichas de poker aberta ao fundo",
        en: "Top of the King’s Table landing page, with an open poker chip case behind it",
      },
    },
    links: [
      { kind: 'site', href: 'https://kings-table-poker.vercel.app' },
      {
        kind: 'github',
        href: 'https://github.com/WinistonAlle/kings-table-app',
      },
    ],
    problem: {
      pt: [
        'Home game de amigos roda em planilha e memória. Alguém cronometra o blind no celular, alguém anota num papel quem já pagou, e no fim da noite a premiação sai na conta de cabeça com a mesa inteira esperando.',
        'O que se perde não é a conta de uma noite: é a temporada. Quem ganhou mais vezes no ano, quem está devendo desde abril, qual estrutura de blinds fez a noite acabar na hora certa. Nada disso sobrevive até o próximo encontro.',
      ],
      en: [
        'A home game among friends runs on a spreadsheet and memory. Someone times the blinds on their phone, someone else notes on paper who has already paid, and at the end of the night the payouts are worked out in someone’s head with the whole table waiting.',
        'What gets lost is not one night’s arithmetic: it is the season. Who won most this year, who has owed since April, which blind structure made the night end on time. None of it survives to the next gathering.',
      ],
    },
    solution: {
      pt: [
        'O produto tem duas metades. A landing apresenta e reserva vaga na lista de espera; o app é onde a noite acontece, com relógio de blinds, entradas e rebuys, acerto de contas, premiação calculada na hora e o ranking da liga fechando sozinho a cada noite encerrada.',
        'O relógio foi a parte teimosa. Ele precisa continuar certo com a tela bloqueada e o app em segundo plano, que é justamente onde esse tipo de app falha no meio da mesa. São 22 suítes de teste segurando o que não pode quebrar, e boa parte delas cobre sincronia offline: fila de operações, conflito entre dois aparelhos e recuperação depois que a internet cai.',
        'Landing e app moram no mesmo endereço, e isso foi decisão, não acaso. A sessão vive num cookie, e cookie não atravessa dois subdomínios de vercel.app. Servir o app dentro da própria landing, em /app, foi o que fez o login funcionar de ponta a ponta sem depender de comprar domínio.',
      ],
      en: [
        'The product has two halves. The landing page pitches it and holds a spot on the waiting list; the app is where the night happens, with the blind clock, buy-ins and rebuys, settling up, payouts worked out on the spot, and the league ranking closing itself every time a night ends.',
        'The clock was the stubborn part. It has to stay right with the screen locked and the app in the background, which is exactly where this kind of app fails mid-table. 22 test suites hold up what cannot break, and a good share of them cover offline sync: the queue of operations, a conflict between two devices, and recovery after the connection drops.',
        'The landing page and the app live at the same address, and that was a decision, not an accident. The session lives in a cookie, and a cookie does not cross two vercel.app subdomains. Serving the app inside the landing page itself, at /app, is what made the login work end to end without having to buy a domain.',
      ],
    },
    gallery: [
      {
        src: '/cases/kings-table/manifesto.webp',
        alt: {
          pt: 'Manifesto do produto ao lado da ficha de poker em 3D',
          en: 'Product manifesto beside the 3D poker chip',
        },
        caption: {
          pt: 'A promessa dita em uma frase só, ao lado da ficha em 3D que gira conforme a página rola. Relógio que não atrasa, controle de quem pagou, premiação calculada na hora e ranking saindo sozinho: são as quatro dores da noite, na ordem em que aparecem.',
          en: 'The promise said in a single sentence, beside the 3D chip that turns as the page scrolls. A clock that does not fall behind, a record of who paid, payouts worked out on the spot and a ranking that writes itself: the four pains of the night, in the order they turn up.',
        },
      },
      {
        src: '/cases/kings-table/areas.webp',
        alt: {
          pt: 'Navegador de funcionalidades, com as oito áreas do produto na lateral',
          en: 'Feature explorer, with the product’s eight areas down the side',
        },
        caption: {
          pt: 'São 106 funcionalidades divididas em oito áreas, e listar tudo de uma vez viraria parede de texto. Aqui a lista fica na lateral e só uma área abre por vez, com um exemplo de mesa montada em cima para a pessoa ver do que se trata antes de ler os doze itens.',
          en: 'There are 106 features split across eight areas, and listing them all at once would become a wall of text. Here the list stays on the side and only one area opens at a time, with a worked example of a table above it so people see what it is about before reading the twelve items.',
        },
      },
      {
        src: '/cases/kings-table/chip.webp',
        alt: {
          pt: 'Ficha de poker em 3D ao lado da lista de áreas em perspectiva',
          en: '3D poker chip beside the list of areas in perspective',
        },
        caption: {
          pt: 'A mesma ficha volta como âncora da navegação: as áreas passam inclinadas ao lado dela e só a que está em foco fica legível. É a mesma ideia do carrossel que uso nos sites de fachada, aplicada a um índice, para o olho saber onde está sem barra de progresso.',
          en: 'The same chip comes back as the anchor of the navigation: the areas slide past it at an angle and only the one in focus stays readable. It is the same idea as the carousel I use on the façade sites, applied to an index, so the eye knows where it is without a progress bar.',
        },
      },
      {
        src: '/cases/kings-table/noites.webp',
        alt: {
          pt: 'Mosaico de fotos de noites de poker entre amigos',
          en: 'Mosaic of photos of poker nights among friends',
        },
        caption: {
          pt: 'O mosaico existe para dizer de quem é o produto. Não é sala de cassino nem torneio profissional: é a turma de sempre, na mesa da sala, e a foto faz esse recorte mais rápido do que qualquer parágrafo faria.',
          en: 'The mosaic is there to say who the product belongs to. It is not a casino floor or a professional tournament: it is the usual crowd, at the table in the living room, and the photo makes that point faster than any paragraph would.',
        },
      },
      {
        src: '/cases/kings-table/mesa.webp',
        alt: {
          pt: 'Chamada final sobre uma mesa de poker vista de cima',
          en: 'Closing call to action over a poker table seen from above',
        },
        caption: {
          pt: 'A última tela é a mesa vista de cima, com o convite no feltro. Como o produto ainda não abriu, ela não tenta vender: reserva vaga na lista de espera, que é a única coisa honesta a pedir antes do lançamento.',
          en: 'The last screen is the table seen from above, with the invitation on the felt. Since the product has not opened yet, it does not try to sell: it holds a spot on the waiting list, which is the only honest thing to ask for before launch.',
        },
      },
    ],
  },
  {
    n: '15',
    slug: 'coro-hub',
    name: 'Coro Hub',
    status: 'live',
    context: 'Empresa própria',
    groups: ['sites'],
    line: {
      pt: 'Site institucional da Coro Hub, a empresa de IA aplicada que abri com três sócios: traz cliente e faz a operação dar conta dele.',
      en: 'Corporate site for Coro Hub, the applied AI company I started with three partners: it brings in customers and makes the operation keep up with them.',
    },
    stat: {
      pt: [
        'No ar na Vercel; cada push na main publica sozinho',
        'Sete componentes do React Bits portados sem React para o navegador',
        'Fundo em WebGL puro que troca de paleta na borda de cada seção clara',
        'Nenhum case, logo ou número inventado: a empresa ainda não tem clientes no site',
      ],
      en: [
        'Live on Vercel; every push to main publishes itself',
        'Seven React Bits components ported with no React sent to the browser',
        'Plain WebGL background that swaps palette at the edge of each light section',
        'No made up case, logo or number: the company has no clients on the site yet',
      ],
    },
    tags: ['Astro', 'TypeScript', 'GSAP', 'WebGL'],
    media: {
      frame: 'desktop',
      src: '/cases/coro-hub/capa.webp',
      video: '/cases/coro-hub/scroll.mp4',
      poster: '/cases/coro-hub/poster.webp',
      alt: {
        pt: 'Hero da Coro Hub, com o título Automatize o que importa e uma conversa de WhatsApp com o agente de IA ao lado',
        en: 'Coro Hub hero, with the headline Automate what matters and a WhatsApp chat with the AI agent beside it',
      },
    },
    links: [{ kind: 'site', href: 'https://coro-hub.vercel.app' }],
    problem: {
      pt: [
        'A Coro Hub nasceu com quatro sócios e nenhum cliente. O site precisava explicar uma oferta que junta duas coisas que o mercado vende separado: trazer cliente com anúncio e site, e fazer a operação dar conta dele com IA e automação.',
        'E precisava fazer isso sem o atalho de sempre. Sem cases, sem depoimentos e sem logos de clientes, qualquer número inventado viraria mentira na primeira conversa.',
      ],
      en: [
        'Coro Hub was born with four partners and no clients. The site had to explain an offer that puts together two things the market sells separately: bringing in customers with ads and a website, and making the operation keep up with them through AI and automation.',
        'And it had to do that without the usual shortcut. With no cases, no testimonials and no client logos, any made up number would turn into a lie on the first call.',
      ],
    },
    solution: {
      pt: [
        'O hero mostra o produto em vez de descrever: uma conversa de WhatsApp em que o agente de IA atende, qualifica e marca horário, e que termina com o que a automação fez por trás, como salvar o lead no CRM. É o serviço de entrada da empresa acontecendo na frente da pessoa.',
        'A página segue o modelo de negócio: os quatro braços agrupados em Aquisição e Operação, o caminho do primeiro clique até a automação e o Método CORO (Conectar, Organizar, Resolver, Otimizar). Onde entraria prova social entram exemplos de antes e depois, avisando que são exemplos e não histórias de clientes.',
        'Os efeitos vieram do React Bits, mas nenhum React vai para o navegador: cada componente foi portado para TypeScript puro dentro do Astro. O fundo em dither é WebGL escrito à mão e troca de paleta exatamente na borda das seções claras. A pilha de cartões usa position: sticky, porque a versão original movia os cartões por script e travava na rolagem.',
      ],
      en: [
        'The hero shows the product instead of describing it: a WhatsApp chat where the AI agent answers, qualifies and books a time, ending with what the automation did behind the scenes, like saving the lead to the CRM. It is the company’s entry service happening in front of the visitor.',
        'The page follows the business model: the four arms grouped into Acquisition and Operations, the path from the first click to the automation, and the CORO Method (Connect, Organize, Resolve, Optimize). Where social proof would go, there are before and after examples, saying plainly that they are examples and not client stories.',
        'The effects came from React Bits, but no React reaches the browser: every component was ported to plain TypeScript inside Astro. The dither background is hand written WebGL and swaps palette exactly at the edge of the light sections. The card stack uses position: sticky, because the original version moved the cards by script and stuttered on scroll.',
      ],
    },
    gallery: [
      {
        src: '/cases/coro-hub/servicos.webp',
        alt: {
          pt: 'Serviços em dois blocos, Aquisição e Operação, com o caminho do cliente em cinco passos embaixo',
          en: 'Services in two blocks, Acquisition and Operations, with the customer path in five steps below',
        },
        caption: {
          pt: 'A frase de posicionamento abre os serviços, e os quatro braços ficam em dois blocos: Aquisição traz o cliente, Operação dá conta dele. Embaixo, o caminho em cinco passos amarra os dois, do anúncio até o CRM.',
          en: 'The positioning line opens the services, and the four arms sit in two blocks: Acquisition brings the customer in, Operations keeps up with them. Below, the five step path ties both together, from the ad to the CRM.',
        },
      },
      {
        src: '/cases/coro-hub/metodo.webp',
        alt: {
          pt: 'Método CORO, com as letras C, O, R e O grandes sobre as quatro etapas',
          en: 'CORO Method, with the large letters C, O, R and O above the four steps',
        },
        caption: {
          pt: 'O nome da empresa vira o método. Um coro é várias vozes soando como uma só, e as quatro letras grandes são as etapas: Conectar, Organizar, Resolver e Otimizar.',
          en: 'The company name becomes the method. A choir is many voices sounding as one, and the four large letters are the steps: Connect, Organize, Resolve and Optimize.',
        },
      },
      {
        src: '/cases/coro-hub/exemplos.webp',
        alt: {
          pt: 'Cartão de exemplo em tela cheia, com o Antes apagado à esquerda e o Depois em letra grande à direita',
          en: 'Full screen example card, with the Before faded on the left and the After in large type on the right',
        },
        caption: {
          pt: 'Seis situações de antes e depois, um cartão por vez conforme a rolagem. O Antes fica apagado e o Depois em letra grande, porque é ele que a pessoa precisa lembrar.',
          en: 'Six before and after situations, one card at a time as you scroll. The Before stays faded and the After in large type, because that is the part people need to remember.',
        },
      },
      {
        src: '/cases/coro-hub/chamada.webp',
        alt: {
          pt: 'Chamada final com o símbolo da Coro Hub e a pergunta sobre qual processo tirar das costas da equipe',
          en: 'Closing call to action with the Coro Hub symbol and the question about which process to take off the team',
        },
        caption: {
          pt: 'A chamada final faz a pergunta que a conversa de 30 minutos vai responder. Não tem formulário: o botão abre o WhatsApp com a mensagem já escrita, uma diferente para cada seção do site.',
          en: 'The closing call asks the question the 30 minute call will answer. There is no form: the button opens WhatsApp with the message already written, a different one for each section of the site.',
        },
      },
    ],
  },
  {
    n: '16',
    slug: 'estudai',
    name: 'Estud.AI',
    status: 'wip',
    context: 'Produto próprio',
    groups: ['outros', 'sites'],
    line: {
      pt: 'App de estudos que transforma PDF em flashcards com IA e avisa a hora certa de revisar cada um, antes de esquecer.',
      en: 'A study app that turns a PDF into flashcards with AI and tells you the right moment to review each one, before you forget it.',
    },
    stat: {
      pt: [
        'No ar com teste grátis de 7 dias; o pagamento ainda não abriu',
        'Revisões agendadas com FSRS, o mesmo algoritmo que o Anki passou a oferecer',
        'Plano, XP, sequência e cota de IA validados no banco, com 63 verificações automáticas',
        'PDF e deck do Anki são lidos no navegador: o arquivo não sai do computador',
      ],
      en: [
        'Live with a 7 day free trial; payments have not opened yet',
        'Reviews scheduled with FSRS, the same algorithm Anki started offering',
        'Plan, XP, streak and AI quota enforced in the database, with 63 automated checks',
        'PDFs and Anki decks are read in the browser: the file never leaves the computer',
      ],
    },
    tags: ['Next.js', 'TypeScript', 'Supabase', 'Groq'],
    media: {
      frame: 'desktop',
      src: '/cases/estudai/capa.webp',
      video: '/cases/estudai/scroll.mp4',
      poster: '/cases/estudai/poster.webp',
      alt: {
        pt: 'Hero do Estud.AI, com o título Pare de reler, comece a lembrar sobre um fundo violeta em lâminas',
        en: 'Estud.AI hero, with the headline Stop rereading, start remembering over a slatted violet background',
      },
    },
    links: [{ kind: 'site', href: 'https://estudai-alpha.vercel.app' }],
    problem: {
      pt: [
        'Quem estuda pra prova costuma estudar do jeito que menos funciona: reler o resumo e grifar de novo. Dá a sensação de que o conteúdo ficou, mas a curva do esquecimento continua lá, e na semana da prova metade já sumiu.',
        'Repetição espaçada resolve isso, e o Anki prova há anos. Só que ele pede disciplina pra montar card por card e tem cara de planilha. O Estud.AI nasceu pra tirar essas duas barreiras: a IA monta os cards a partir do material, e o app diz o que revisar em cada dia.',
      ],
      en: [
        'People studying for an exam tend to study the way that works least: rereading the summary and highlighting it again. It feels like the content stuck, but the forgetting curve is still there, and by exam week half of it is gone.',
        'Spaced repetition fixes that, and Anki has proven it for years. But it asks for the discipline to build card after card and looks like a spreadsheet. Estud.AI was born to remove those two barriers: the AI builds the cards from the material, and the app says what to review each day.',
      ],
    },
    solution: {
      pt: [
        'O fluxo é curto: a pessoa sobe um PDF ou cola um texto, revisa os cards que a IA sugeriu e salva. Dali em diante o FSRS calcula quando cada card volta, e os botões de avaliação já mostram o próximo intervalo, de Errei em 1 minuto a Fácil em 4 dias. O PDF é lido no próprio navegador; só o texto segue pra IA.',
        'O que não pode ser burlado mora no banco. XP, nível, sequência de dias, teto diário de pontos, cota de cards por IA e o modo somente leitura de quem não assinou são triggers e políticas de RLS no Postgres, não condicionais na tela. Antes de irem pro ar, essas regras passaram por 63 verificações num Supabase rodando na minha máquina.',
        'A landing conta o jeito antigo de estudar antes de mostrar o produto, e abre com o logo se montando peça por peça, feito só com a Web Animations API do navegador. O que ainda não existe, como o tutor que responde com base nos seus arquivos, aparece marcado como em breve.',
      ],
      en: [
        'The flow is short: you upload a PDF or paste some text, review the cards the AI suggested and save them. From then on FSRS works out when each card comes back, and the rating buttons already show the next interval, from Again in 1 minute to Easy in 4 days. The PDF is read in the browser itself; only the text goes on to the AI.',
        'Whatever cannot be gamed lives in the database. XP, level, the daily streak, the daily points cap, the AI card quota and read only mode for people who have not subscribed are triggers and RLS policies in Postgres, not conditionals on the screen. Before going live, those rules went through 63 checks against a Supabase instance running on my machine.',
        'The landing page tells the old way of studying before it shows the product, and it opens with the logo assembling itself piece by piece, built only with the browser’s Web Animations API. What does not exist yet, like the tutor that answers from your own files, is marked as coming soon.',
      ],
    },
    gallery: [
      {
        src: '/cases/estudai/livro.webp',
        alt: {
          pt: 'Livro aberto com o resumo grifado de amarelo, um plano de estudo riscado e a curva do esquecimento',
          en: 'Open book with the summary highlighted in yellow, a crossed out study plan and the forgetting curve',
        },
        caption: {
          pt: 'O jeito antigo, desenhado como um caderno aberto: o plano riscado item por item, o resumo grifado e a curva do esquecimento com o rabisco “e no dia da prova…?”. Um livro 3D se abre conforme a página rola, e só depois disso o produto aparece.',
          en: 'The old way, drawn as an open notebook: the plan crossed off item by item, the highlighted summary and the forgetting curve with the scribble “and on exam day…?”. A 3D book opens as the page scrolls, and only after that does the product show up.',
        },
      },
      {
        src: '/cases/estudai/recursos.webp',
        alt: {
          pt: 'Grade de recursos com o texto de um PDF virando cards, uma revisão em andamento, um pomodoro e o chat do tutor',
          en: 'Feature grid with the text of a PDF turning into cards, a review in progress, a pomodoro timer and the tutor chat',
        },
        caption: {
          pt: 'Os recursos aparecem funcionando em vez de listados: o texto do PDF ganha grifos e vira cards, a revisão mostra o intervalo de cada botão e o pomodoro corre acelerado. O tutor está marcado como em breve, porque ainda não existe no app.',
          en: 'The features are shown working instead of listed: the PDF text gets highlighted and turns into cards, the review shows each button’s interval and the pomodoro runs fast forward. The tutor is marked as coming soon, because it does not exist in the app yet.',
        },
      },
      {
        src: '/cases/estudai/publico.webp',
        alt: {
          pt: 'Aba Concurseiros, com a cobertura do edital por disciplina e um card de lei seca com lacuna',
          en: 'Civil service exam tab, with syllabus coverage by subject and a fill in the blank law card',
        },
        caption: {
          pt: 'Cada público tem a sua tela. O concurseiro vê o edital por disciplina e a lei seca em cards de lacuna; vestibulandos, medicina e idiomas ganham exemplos próprios. É a mesma ferramenta contada na língua de quem vai usar.',
          en: 'Each audience gets its own screen. Civil service candidates see the syllabus by subject and the letter of the law as fill in the blank cards; university entrance, medicine and languages get their own examples. It is the same tool, told in the language of whoever is going to use it.',
        },
      },
      {
        src: '/cases/estudai/planos.webp',
        alt: {
          pt: 'Planos Plus e Pro, com a linha do tempo do teste grátis e uma régua de quantos PDFs a pessoa quer transformar por mês',
          en: 'Plus and Pro plans, with the free trial timeline and a slider for how many PDFs you want to turn into cards each month',
        },
        caption: {
          pt: 'O preço responde à pergunta que importa, quantos PDFs você quer transformar por mês, e recomenda o plano a partir dela. O teste de 7 dias aparece como uma linha do tempo do que acontece em cada dia, porque a repetição espaçada se prova dentro do próprio teste.',
          en: 'The pricing answers the question that matters, how many PDFs you want to turn into cards each month, and recommends the plan from it. The 7 day trial shows up as a timeline of what happens on each day, because spaced repetition proves itself within the trial.',
        },
      },
      {
        src: '/cases/estudai/chamada.webp',
        alt: {
          pt: 'Chamada final com a frase Pare de reler, comece a lembrar e um card perguntando qual organela produz ATP',
          en: 'Closing call to action with the line Stop rereading, start remembering and a card asking which organelle produces ATP',
        },
        caption: {
          pt: 'A chamada final repete a promessa com um card de verdade na mão: qual organela produz ATP? Sem formulário no meio do caminho, o botão leva direto ao cadastro do teste grátis.',
          en: 'The closing call repeats the promise with a real card in hand: which organelle produces ATP? With no form in the way, the button goes straight to the free trial sign up.',
        },
      },
      {
        src: '/cases/estudai/login.webp',
        alt: {
          pt: 'Tela de entrar desenhada como um caderno aberto, com boas vindas na página da esquerda e o formulário na da direita',
          en: 'Sign in screen drawn as an open notebook, with a welcome on the left page and the form on the right',
        },
        caption: {
          pt: 'Entrar e criar conta acontecem dentro de um caderno aberto: a página da esquerda fala com quem volta, a da direita tem o formulário. É a mesma metáfora do livro da landing, levada até a porta do app.',
          en: 'Signing in and creating an account happen inside an open notebook: the left page speaks to whoever is coming back, the right one holds the form. It is the same book metaphor as the landing page, carried all the way to the app’s front door.',
        },
      },
    ],
  },
  {
    n: '17',
    slug: 'chega-ai',
    name: 'Chega Aí',
    status: 'wip',
    context: 'Produto próprio',
    groups: ['outros', 'sites'],
    line: {
      pt: 'Convite digital de festa com a voz de quem faz a festa: o convidado ouve, confirma presença e entra na portaria com um QR.',
      en: 'A digital party invitation in the voice of whoever is throwing it: guests listen, RSVP and get through the door with a QR code.',
    },
    stat: {
      pt: [
        'Em desenvolvimento: roda completo na minha máquina, ainda sem data pra ir ao ar',
        'Editor em 7 etapas com prévia ao vivo, gravação de áudio no navegador e confirmações em tempo real',
        'Pagamento via Mercado Pago, hoje em modo simulado; falta só rodar no sandbox',
        '67 testes de unidade e de RLS e 24 de ponta a ponta, no computador e no celular',
      ],
      en: [
        'In development: it runs end to end on my machine, with no launch date yet',
        'A 7 step editor with live preview, in-browser audio recording and real-time RSVPs',
        'Payments through Mercado Pago, in simulated mode for now; only the sandbox run is left',
        '67 unit and RLS tests and 24 end to end tests, on desktop and mobile',
      ],
    },
    tags: ['Next.js', 'TypeScript', 'Supabase', 'Mercado Pago'],
    media: {
      frame: 'desktop',
      src: '/cases/chega-ai/capa.webp',
      video: '/cases/chega-ai/scroll.mp4',
      poster: '/cases/chega-ai/poster.webp',
      alt: {
        pt: 'Hero do Chega Aí, com o título O convite que fala e um celular mostrando um convite de casamento com áudio',
        en: 'Chega Aí hero, with the headline The invitation that talks and a phone showing a wedding invitation with audio',
      },
    },
    problem: {
      pt: [
        'Convite de festa hoje é uma arte no WhatsApp: bonita, mas muda. Ninguém confirma presença direito, o anfitrião passa a semana cobrando resposta no privado, e na porta do buffet a lista é um papel que alguém risca à mão.',
        'O Chega Aí começa por onde o convite de papel nunca chegou: a voz. Quem faz a festa grava os recados, o convidado ouve, e a partir daí o convite resolve o resto da festa, da confirmação à portaria.',
      ],
      en: [
        'Party invitations today are a graphic sent on WhatsApp: pretty, but silent. Nobody RSVPs properly, the host spends the week chasing answers in private messages, and at the venue door the list is a sheet of paper someone crosses off by hand.',
        'Chega Aí starts where the paper invitation never went: the voice. The host records the messages, the guest listens, and from there the invitation takes care of the rest of the party, from the RSVP to the door.',
      ],
    },
    solution: {
      pt: [
        'O anfitrião monta o convite em 7 etapas com a prévia ao lado, grava cada áudio pelo celular (até um minuto) e pode mandar um link pra avó gravar também, sem cadastro. O convidado abre o link, ouve, responde às perguntas e confirma com acompanhantes; o painel do anfitrião atualiza na hora, sem recarregar.',
        'Depois da confirmação, o convite vira a festa: QR de entrada com check-in por câmera ou PIN da equipe, mural de recados com moderação, lista de presentes com cotas por Pix e cartão, e artes prontas pra imprimir. Buffets assinam um plano próprio e publicam os convites dos clientes com a marca deles, no próprio endereço.',
        'Todas as tabelas têm RLS testado, os formulários públicos têm limite de tentativas e o IP é guardado só como hash. Ainda está em desenvolvimento: o pagamento roda em modo simulado até eu ter as credenciais de teste do Mercado Pago, e falta testar a gravação no Safari do iPhone.',
      ],
      en: [
        'The host builds the invitation in 7 steps with the preview alongside, records each audio clip on the phone (up to a minute) and can send grandma a link to record one too, no sign up needed. The guest opens the link, listens, answers the questions and RSVPs with their plus ones; the host dashboard updates instantly, without reloading.',
        'After the RSVP, the invitation becomes the party: an entry QR checked in by camera or by the staff PIN, a moderated guestbook, a gift list with Pix and card contributions, and print-ready artwork. Party venues have their own plan and publish their clients’ invitations under their own brand, on their own address.',
        'Every table has tested RLS, public forms are rate limited and IP addresses are stored only as a hash. It is still in development: payments run in simulated mode until I have Mercado Pago test credentials, and recording still needs testing in Safari on the iPhone.',
      ],
    },
    gallery: [
      {
        src: '/cases/chega-ai/como-funciona.webp',
        alt: {
          pt: 'Três cartões: escolher a festa e o tema, gravar as respostas e mandar o link',
          en: 'Three cards: pick the party and theme, record the answers and send the link',
        },
        caption: {
          pt: 'Os três passos, cada um mostrando o que acontece de verdade: os temas lado a lado, o microfone gravando e a conversa no WhatsApp com o link do convite.',
          en: 'The three steps, each showing what actually happens: the themes side by side, the microphone recording and the WhatsApp chat with the invitation link.',
        },
      },
      {
        src: '/cases/chega-ai/recursos.webp',
        alt: {
          pt: 'Seção escura com os recursos: confirmação de presença, presentes, mural, check-in e artes',
          en: 'Dark section with the features: RSVP, gifts, guestbook, check-in and artwork',
        },
        caption: {
          pt: 'Do “vou sim” ao “pode entrar”: a confirmação com os números de convidados, a lista de presentes com a cota enchendo, o mural, o check-in na porta e as artes pra imprimir.',
          en: 'From “I’ll be there” to “come on in”: the RSVP with guest counts, the gift list with a contribution filling up, the guestbook, the door check-in and the print-ready artwork.',
        },
      },
      {
        src: '/cases/chega-ai/precos.webp',
        alt: {
          pt: 'Planos grátis e completo, com abas para festa infantil, aniversário e casamento',
          en: 'Free and full plans, with tabs for kids party, birthday and wedding',
        },
        caption: {
          pt: 'Paga uma vez, sem mensalidade. O grátis fica 24 horas no ar e, quando a pessoa libera o completo, o link continua o mesmo. Os preços saem de um único arquivo de configuração.',
          en: 'Pay once, no subscription. The free plan stays live for 24 hours, and when the host unlocks the full one, the link stays the same. Prices come from a single configuration file.',
        },
      },
      {
        src: '/cases/chega-ai/buffets.webp',
        alt: {
          pt: 'Seção laranja para buffets, com um convite no endereço próprio do buffet',
          en: 'Orange section for party venues, with an invitation on the venue’s own address',
        },
        caption: {
          pt: 'Para buffets e cerimoniais: o convite sai com a marca do buffet, no endereço dele, com mensalidade fixa e uma taxa por convite publicado.',
          en: 'For party venues and planners: the invitation carries the venue’s brand, on its own address, with a flat monthly fee and a charge per published invitation.',
        },
      },
      {
        src: '/cases/chega-ai/perguntas.webp',
        alt: {
          pt: 'Perguntas frequentes à direita, com o título Ficou alguma dúvida? à esquerda',
          en: 'Frequently asked questions on the right, with the headline Any questions? on the left',
        },
        caption: {
          pt: 'As dúvidas que mais aparecem, respondidas antes de alguém perguntar: o convidado não baixa aplicativo nem cria conta, e o convite não aparece no Google.',
          en: 'The questions that come up most, answered before anyone asks: guests do not download an app or create an account, and the invitation does not show up on Google.',
        },
      },
      {
        src: '/cases/chega-ai/chamada.webp',
        alt: {
          pt: 'Chamada final com o título Bora fazer o convite que todo mundo vai querer ouvir',
          en: 'Closing call to action with the headline Let’s make the invitation everyone will want to hear',
        },
        caption: {
          pt: 'A chamada final, com os balões da marca. A logo é um par de balões que também são aspas: a festa e a fala no mesmo desenho.',
          en: 'The closing call to action, with the brand’s balloons. The logo is a pair of balloons that are also quotation marks: the party and the voice in one drawing.',
        },
      },
    ],
  },
  {
    n: '18',
    slug: 'onboarding-clientes',
    name: 'Onboarding de clientes',
    status: 'live',
    context: 'Produto próprio',
    groups: ['outros'],
    line: {
      pt: 'O formulário que eu mando para quem contrata um site: o cliente responde e envia fotos por um link, no ritmo dele, e eu acompanho todo mundo num quadro.',
      en: 'The form I send to whoever hires me for a website: the client answers and uploads photos through a link, at their own pace, and I follow everyone on a board.',
    },
    stat: {
      pt: [
        'No ar desde outubro de 2026, substituindo um Word e três pastas do Drive',
        '11 etapas, cada campo salvo sozinho; o link não expira e reabre na etapa onde a pessoa parou',
        'Sem login para o cliente: um link único por projeto, com upload direto para o Storage',
        'Banco fechado por RLS sem nenhuma política pública; todo acesso passa pelo servidor',
      ],
      en: [
        'Live since October 2026, replacing a Word file and three Drive folders',
        '11 steps, every field saved on its own; the link never expires and reopens on the step where the person stopped',
        'No login for the client: one unique link per project, uploading straight to Storage',
        'Database locked by RLS with no public policy at all; every access goes through the server',
      ],
    },
    tags: ['Next.js', 'TypeScript', 'Supabase', 'Tailwind CSS'],
    media: {
      frame: 'desktop',
      src: '/cases/onboarding-clientes/capa.webp',
      video: '/cases/onboarding-clientes/scroll.mp4',
      poster: '/cases/onboarding-clientes/poster.webp',
      alt: {
        pt: 'Quadro com quatro colunas, de Link enviado a Projeto iniciado, e um cartão por cliente com progresso e selos',
        en: 'Board with four columns, from Link sent to Project started, and one card per client with progress and badges',
      },
    },
    problem: {
      pt: [
        'Todo site que eu faço começa com as mesmas perguntas: o que a pessoa vende, para quem, por quanto, o que prova que funciona. Eu mandava um Word para preencher e três pastas do Drive para a pessoa subir logo, fotos e prints.',
        'O Word voltava pela metade, as fotos chegavam soltas pelo WhatsApp dias depois, e eu não tinha onde ver, de uma vez, quem já tinha respondido e o que ainda faltava de cada um.',
      ],
      en: [
        'Every website I build starts with the same questions: what the person sells, to whom, for how much, what proves it works. I used to send a Word file to fill in and three Drive folders for the logo, photos and screenshots.',
        'The Word file came back half done, the photos arrived loose over WhatsApp days later, and I had nowhere to see, at a glance, who had already answered and what was still missing from each one.',
      ],
    },
    solution: {
      pt: [
        'Eu crio o cliente, copio o link e mando. Ele abre no celular, sem cadastro, e responde em 11 etapas. Cada campo é salvo sozinho enquanto a pessoa digita; se fechar a aba, o link reabre na etapa onde parou, com tudo carregado. Quem ainda não tem as fotos finaliza o texto e volta dias depois no mesmo link, sem preencher nada de novo.',
        'Do meu lado é um quadro: Link enviado, Em preenchimento, Respondido e Projeto iniciado. O cartão anda sozinho quando o cliente começa e quando finaliza, e mostra o que falta: texto, fotos, identidade visual. Na página do cliente ficam as respostas na ordem do formulário, os arquivos por categoria com download em zip e um botão que copia tudo em Markdown, pronto para virar a copy do site.',
        'As perguntas moram em um único arquivo de configuração: mudar o questionário não mexe em nenhuma tela. O cliente nunca fala com o banco. Toda leitura e gravação passa pelo servidor, que confere o link, e os arquivos sobem por endereço assinado depois de checar tipo e tamanho.',
      ],
      en: [
        'I create the client, copy the link and send it. They open it on the phone, with no sign up, and answer in 11 steps. Every field is saved on its own as the person types; if they close the tab, the link reopens on the step where they stopped, with everything loaded. Whoever does not have the photos yet finishes the text and comes back days later on the same link, without filling anything in again.',
        'On my side it is a board: Link sent, Filling in, Answered and Project started. The card moves by itself when the client starts and when they finish, and shows what is missing: text, photos, visual identity. The client page holds the answers in the order of the form, the files by category with a zip download and a button that copies everything as Markdown, ready to become the site copy.',
        'The questions live in a single configuration file: changing the questionnaire touches no screen. The client never talks to the database. Every read and write goes through the server, which checks the link, and files go up through a signed address after type and size are checked.',
      ],
    },
    gallery: [
      {
        src: '/cases/onboarding-clientes/formulario.webp',
        alt: {
          pt: 'Primeira etapa do formulário, Serviço, com a lista das 11 etapas à esquerda e as respostas preenchidas',
          en: 'First step of the form, Service, with the list of 11 steps on the left and the answers filled in',
        },
        caption: {
          pt: 'O formulário que o cliente vê. A barra do topo e a lista ao lado mostram o que já foi respondido, e o aviso no canto diz quando salvou. Os clientes das telas são fictícios.',
          en: 'The form the client sees. The top bar and the side list show what has been answered, and the note in the corner says when it saved. The clients on these screens are fictional.',
        },
      },
      {
        src: '/cases/onboarding-clientes/identidade.webp',
        alt: {
          pt: 'Etapa de identidade visual com a opção Tenho parcialmente marcada e um aviso logo abaixo',
          en: 'Visual identity step with the option I have part of it selected and a note right below',
        },
        caption: {
          pt: 'Quem não tem logo ou cores definidas é avisado na hora de que isso se resolve, e o cartão dele ganha um selo no meu quadro. Eu fico sabendo antes de abrir o projeto.',
          en: 'Whoever has no logo or defined colors is told right away that it can be sorted out, and their card gets a badge on my board. I know before I open the project.',
        },
      },
      {
        src: '/cases/onboarding-clientes/fotos.webp',
        alt: {
          pt: 'Última etapa, Fotos, com a área de envio e as miniaturas das fotos já enviadas',
          en: 'Last step, Photos, with the upload area and thumbnails of the photos already sent',
        },
        caption: {
          pt: 'As fotos sobem direto para o Storage, com barra de progresso por arquivo. No celular a mesma área abre a câmera ou a galeria.',
          en: 'Photos go straight to Storage, with a progress bar per file. On the phone the same area opens the camera or the gallery.',
        },
      },
      {
        src: '/cases/onboarding-clientes/sucesso.webp',
        alt: {
          pt: 'Tela final com o título Tudo certo e o botão Avisar o Winiston no WhatsApp',
          en: 'Final screen with the headline All set and the button Let Winiston know on WhatsApp',
        },
        caption: {
          pt: 'Ao finalizar, um botão abre a conversa no WhatsApp com a mensagem pronta. Se as fotos ficaram para depois, a mensagem já diz isso.',
          en: 'On finishing, a button opens the WhatsApp chat with the message ready. If the photos were left for later, the message already says so.',
        },
      },
      {
        src: '/cases/onboarding-clientes/detalhe.webp',
        alt: {
          pt: 'Página de um cliente no painel, com as respostas por seção, anotações internas e as ações do link',
          en: 'A client page in the dashboard, with answers by section, internal notes and the link actions',
        },
        caption: {
          pt: 'A página de cada cliente: respostas na ordem do formulário, anotações que só eu vejo e o botão que copia tudo em Markdown.',
          en: 'Each client page: answers in the order of the form, notes only I can see and the button that copies everything as Markdown.',
        },
      },
      {
        src: '/cases/onboarding-clientes/arquivos.webp',
        alt: {
          pt: 'Arquivos do cliente agrupados em Fotos e Identidade visual, com miniaturas e botão de baixar tudo',
          en: 'Client files grouped into Photos and Visual identity, with thumbnails and a download all button',
        },
        caption: {
          pt: 'Os arquivos chegam separados por categoria, no lugar das três pastas do Drive. Cada um baixa sozinho ou a categoria inteira vem em um zip.',
          en: 'Files arrive split by category, in place of the three Drive folders. Each one downloads on its own, or the whole category comes as a zip.',
        },
      },
    ],
  },
  {
    n: '19',
    slug: 'dr-alipio',
    name: 'Dr. Alípio Vigolvino',
    status: 'live',
    context: 'Cliente',
    groups: ['sites'],
    line: {
      pt: 'Site de um médico de saúde mental do adulto: para quem continua dando conta de tudo por fora, mas percebe que não está bem, e precisa de um caminho curto até a consulta.',
      en: 'Website for a physician in adult mental health: for people who keep everything running on the outside but notice they are not well, and need a short path to an appointment.',
    },
    stat: {
      pt: [
        'No ar na Vercel, em endereço provisório até o domínio próprio',
        'Sete páginas em Astro, sem React: a única biblioteca no navegador é a da rolagem fluida',
        'Lighthouse no celular: 92 de desempenho e 100 de acessibilidade na home',
        'Recálculo forçado na rolagem: de 4,3 ms para 0,02 ms por quadro depois de unificar os efeitos num laço só',
      ],
      en: [
        'Live on Vercel, at a provisional address until the custom domain',
        'Seven pages in Astro, with no React: the only library sent to the browser is the smooth scrolling one',
        'Lighthouse on mobile: 92 performance and 100 accessibility on the home page',
        'Forced recalculation on scroll: from 4.3 ms to 0.02 ms per frame after merging the effects into a single loop',
      ],
    },
    tags: ['Astro', 'TypeScript', 'Canvas', 'Vercel'],
    media: {
      frame: 'desktop',
      src: '/cases/dr-alipio/capa-v3.webp',
      video: '/cases/dr-alipio/scroll-v2.mp4',
      poster: '/cases/dr-alipio/poster-v2.webp',
      alt: {
        pt: 'Primeira tela do site: um cartão azul escuro com o nome do médico, o título Sua vida segue em frente, mas você não está bem, o botão Agendar consulta e a foto dele de braços cruzados saindo pela borda do cartão',
        en: 'First screen of the site: a dark blue card with the physician’s name, the headline Your life keeps moving, but you are not well, the booking button and his photo with arms crossed breaking out of the card’s edge',
      },
    },
    links: [{ kind: 'site', href: 'https://dr-alipio.vercel.app' }],
    problem: {
      pt: [
        'O Dr. Alípio atende adultos com ansiedade, desânimo e dificuldade de concentração, online e presencial. O público dele é quem trabalha, cumpre compromissos e ninguém percebe nada, mas termina o dia esgotado. Essa pessoa demora a procurar ajuda porque acha que o que sente ainda não é grave o suficiente.',
        'O site precisava falar com ela sem diagnosticar ninguém por lista de sintomas, sem prometer resultado e dentro das regras de publicidade médica. E precisava terminar num gesto simples: chamar a secretaria no WhatsApp.',
      ],
      en: [
        'Dr. Alípio sees adults with anxiety, low mood and trouble concentrating, online and in person. His audience is people who work, keep their commitments and nobody notices anything, but end the day exhausted. That person takes a long time to seek help because they think what they feel is not serious enough yet.',
        'The site had to speak to them without diagnosing anyone through a symptom list, without promising results and within medical advertising rules. And it had to end in one simple gesture: messaging the front desk on WhatsApp.',
      ],
    },
    solution: {
      pt: [
        'A home segue a ordem em que a pessoa decide: primeiro se reconhece em quatro situações, depois entende que sintomas parecidos podem ter causas diferentes, vê como é o acompanhamento e o caminho do agendamento, e só então conhece quem vai atender. Cada página abre o WhatsApp com uma mensagem que já diz de onde a pessoa veio.',
        'Em dois momentos a rolagem conduz a tela. Os cinco passos passam de lado enquanto a página fica presa, e um vídeo curto do médico avança quadro a quadro conforme a janela se abre. O vídeo virou 52 imagens desenhadas num canvas, com cerca de 2 MB em tela grande e menos da metade no celular, baixadas só quando a dobra se aproxima. Quem pede menos movimento no sistema vê o quadro final parado.',
        'A primeira versão tinha efeito demais e engasgava. Medi dentro da própria página: os efeitos alternavam leitura de posição e escrita de estilo no mesmo quadro, e isso custava 4,3 ms de recálculo forçado por quadro num computador rápido. Passei tudo para um laço único, que lê primeiro e escreve depois, e o custo caiu para 0,02 ms. Depois o próprio médico pediu menos animação, e ficou só o que ajuda a ler.',
        'Quando a identidade visual dele ficou pronta, o site passou a segui-la: azul profundo, verde sálvia e cinza claro, títulos numa letra geométrica fina próxima à do logotipo, e uma abertura em que a marca se desenha antes de a página aparecer. O verde da marca não tem contraste para texto, então em texto ele entra mais fechado no fundo claro e mais aberto no escuro.',
      ],
      en: [
        'The home page follows the order in which the person decides: first they recognise themselves in four situations, then they understand that similar symptoms can have different causes, see what the follow-up is like and the path to booking, and only then meet who will see them. Each page opens WhatsApp with a message that already says where the person came from.',
        'At two points scrolling drives the screen. The five steps move sideways while the page stays pinned, and a short video of the physician advances frame by frame as the window opens. The video became 52 images drawn on a canvas, about 2 MB on large screens and less than half of that on phones, downloaded only when the section gets close. Whoever asks the system for less motion sees the final frame, still.',
        'The first version had too many effects and it stuttered. I measured inside the page itself: the effects alternated reading positions and writing styles within the same frame, which cost 4.3 ms of forced recalculation per frame on a fast computer. I moved everything into a single loop that reads first and writes after, and the cost dropped to 0.02 ms. Then the physician himself asked for less animation, and only what helps reading stayed.',
        'When his visual identity was ready, the site started following it: deep blue, sage green and light grey, headlines in a thin geometric typeface close to the logotype, and an opening in which the brand draws itself before the page appears. The brand green lacks contrast for text, so in text it goes darker on the light background and lighter on the dark one.',
      ],
    },
    gallery: [
      {
        src: '/cases/dr-alipio/abertura-v2.webp',
        alt: {
          pt: 'Tela clara com o símbolo AV, o nome Dr Alípio Vigolvino e a linha Médico, Saúde Mental no centro',
          en: 'Light screen with the AV symbol, the name Dr Alípio Vigolvino and the line Physician, Mental Health in the centre',
        },
        caption: {
          pt: 'A abertura: o A e o V se desenham, entram as linhas e o nome letra por letra, e a marca sai para revelar a página. Aparece ao abrir o site e ao atualizar, não nas trocas de página.',
          en: 'The opening: the A and the V draw themselves, the lines and the name come in letter by letter, and the brand leaves to reveal the page. It plays when the site opens and on reload, not when moving between pages.',
        },
      },
      {
        src: '/cases/dr-alipio/sinais-v2.webp',
        alt: {
          pt: 'Dobra escura com o título Tudo parece exigir mais esforço do que deveria e quatro cards',
          en: 'Dark section with the headline Does everything seem to take more effort than it should and four cards',
        },
        caption: {
          pt: 'A pessoa se reconhece em quatro situações do dia a dia, antes de qualquer nome de diagnóstico. A borda do card acende perto do cursor.',
          en: 'The person recognises themselves in four everyday situations, before any diagnosis is named. The card border lights up near the cursor.',
        },
      },
      {
        src: '/cases/dr-alipio/causas-v2.webp',
        alt: {
          pt: 'Seção Sintomas parecidos podem ter causas diferentes, com quatro causas ligadas por linhas a falta de foco',
          en: 'Section Similar symptoms can have different causes, with four causes linked by lines to lack of focus',
        },
        caption: {
          pt: 'O argumento central do médico em um desenho: a mesma queixa pode vir de quatro origens, e é isso que a consulta separa.',
          en: 'The physician’s core argument in one drawing: the same complaint can come from four sources, and telling them apart is what the appointment is for.',
        },
      },
      {
        src: '/cases/dr-alipio/acompanhamento-v2.webp',
        alt: {
          pt: 'Seção de acompanhamento com quatro itens em duas colunas e o botão Agendar consulta',
          en: 'Follow-up section with four items in two columns and the Book an appointment button',
        },
        caption: {
          pt: 'O que a consulta inclui, em quatro frases. A copy desta versão veio do próprio médico.',
          en: 'What the appointment includes, in four sentences. The copy in this version came from the physician himself.',
        },
      },
      {
        src: '/cases/dr-alipio/passos-v2.webp',
        alt: {
          pt: 'Cinco passos numerados lado a lado, com os passos três e quatro no centro da tela',
          en: 'Five numbered steps side by side, with steps three and four in the centre of the screen',
        },
        caption: {
          pt: 'Do agendamento ao acompanhamento em cinco passos. A página fica presa e a rolagem leva os passos para o lado.',
          en: 'From booking to follow-up in five steps. The page stays pinned and scrolling moves the steps sideways.',
        },
      },
      {
        src: '/cases/dr-alipio/video-abrindo-v2.webp',
        alt: {
          pt: 'Janela no centro da tela com o médico escrevendo e o título Quem vai te atender por cima',
          en: 'Window in the centre of the screen with the physician writing and the headline Who will see you over it',
        },
        caption: {
          pt: 'O vídeo começa numa janela pequena, com ele de cabeça baixa escrevendo. A rolagem abre a janela e avança o vídeo ao mesmo tempo.',
          en: 'The video starts in a small window, with him looking down and writing. Scrolling opens the window and advances the video at the same time.',
        },
      },
      {
        src: '/cases/dr-alipio/video-v2.webp',
        alt: {
          pt: 'Vídeo em tela cheia com o médico olhando para a câmera e a frase Ouvir antes de classificar',
          en: 'Full screen video with the physician looking at the camera and the line Listen before labelling',
        },
        caption: {
          pt: 'Com a tela cheia ele já levantou o rosto, e a frase entra. São 52 imagens desenhadas num canvas, baixadas só quando a dobra se aproxima.',
          en: 'At full screen he has already looked up, and the line comes in. It is 52 images drawn on a canvas, downloaded only when the section gets close.',
        },
      },
      {
        src: '/cases/dr-alipio/quem-v2.webp',
        alt: {
          pt: 'Retrato do médico ao lado do texto de apresentação e das credenciais',
          en: 'Portrait of the physician next to the introduction text and credentials',
        },
        caption: {
          pt: 'A apresentação segue as regras de publicidade médica: médico, os dois CRMs e a formação em andamento, sem título de especialista.',
          en: 'The introduction follows medical advertising rules: physician, both licence numbers and the ongoing training, with no specialist title.',
        },
      },
      {
        src: '/cases/dr-alipio/interna-v2.webp',
        alt: {
          pt: 'Abertura da página de Ansiedade, com o título Seu corpo está cansado, mas a cabeça não desliga',
          en: 'Top of the Anxiety page, with the headline Your body is tired, but your head will not switch off',
        },
        caption: {
          pt: 'Cada tema tem sua página, escrita a partir do que a pessoa sente e não de uma lista de sintomas.',
          en: 'Each topic has its own page, written from what the person feels and not from a list of symptoms.',
        },
      },
    ],
  },
  {
    n: '20',
    slug: 'painel-tv',
    name: 'Painel de Operações',
    status: 'live',
    context: 'Cliente',
    groups: ['gostinho-mineiro'],
    line: {
      pt: 'O monitoramento dos sistemas da empresa virou um escritório em 3D: cada sistema é um boneco, e dá para ver de longe, na TV da sala, quem está bem e quem caiu.',
      en: 'Monitoring for the company systems became a 3D office: each system is a character, and from across the room, on the wall TV, you can tell who is fine and who is down.',
    },
    stat: {
      pt: [
        '71 checagens a cada 30 segundos, em 7 sistemas e no que eles usam de fora',
        '18 personagens, cada um com barra de vida em cinco degraus',
        'As sondas só leem: nenhuma escreve, reinicia ou entra com o usuário de outro sistema',
      ],
      en: [
        '71 checks every 30 seconds, across 7 systems and what they rely on outside',
        '18 characters, each with a five-step health bar',
        'Probes only read: none writes, restarts or signs in as another system',
      ],
    },
    tags: ['React', 'TypeScript', 'Three.js', 'Node', 'SQLite'],
    media: {
      frame: 'desktop',
      src: '/cases/painel-tv/capa.webp',
      video: '/cases/painel-tv/tour.mp4',
      poster: '/cases/painel-tv/poster.webp',
      alt: {
        pt: 'Escritório em 3D visto de cima, com um boneco por sistema e o mostrador do servidor no canto',
        en: '3D office seen from above, with one character per system and the server gauge in the corner',
      },
    },
    problem: {
      pt: [
        'Sete sistemas rodam num servidor só, dentro da empresa, e dependem de coisas que ninguém ali controla: a internet, o ERP na nuvem, a SEFAZ. Quando algo parava, quem avisava era o usuário, no balcão ou pelo telefone.',
        'Os casos que mais doeram nem eram queda. Era sistema de pé e travado por dentro: fila que não andava, nota que não saía, rotina agendada que parou de rodar sem avisar.',
      ],
      en: [
        'Seven systems run on a single server inside the company, and depend on things nobody there controls: the internet link, the cloud ERP, the tax authority. When something stopped, the user was the one who reported it, at the counter or over the phone.',
        'The cases that hurt most were not even outages. They were systems standing but stuck inside: a queue that did not move, an invoice that did not go out, a scheduled job that quietly stopped running.',
      ],
    },
    solution: {
      pt: [
        'Um coletor roda no próprio servidor e faz 71 checagens a cada 30 segundos: processos, páginas, bancos, rotinas agendadas, endereços públicos e leituras de uma linha em cada assunto do ERP. Ele só lê, e guarda as últimas 24 horas num banco que é só dele.',
        'A tela começou como painel de sala de controle, com cartões apagados quando está tudo normal. Depois virou um escritório: cada sistema é um boneco com barra de vida. Falha isolada é um espirro, erro repetido adoece aos poucos, serviço fora do ar derruba na hora. O servidor é o zelador, e é ele quem atravessa o prédio para socorrer quem caiu.',
        'Duas regras deixam a cena honesta. Só o culpado adoece: quem depende de algo que caiu fica esperando na porta, com o pedido na mão. E pendência de negócio não é doença, é papel empilhando na mesa.',
        'No computador a maquete aceita clique: gira, aproxima e abre a ficha de cada sistema, checagem por checagem. Na TV ela fica parada na vista geral, e se a máquina esquentar a cena 3D dá lugar aos cartões sozinha.',
      ],
      en: [
        'A collector runs on the server itself and performs 71 checks every 30 seconds: processes, pages, databases, scheduled jobs, public addresses and one-row reads on each ERP subject. It only reads, and keeps the last 24 hours in a database of its own.',
        'The screen started as a control-room board, with cards that stay dark when everything is normal. Then it became an office: each system is a character with a health bar. A single failure is a sneeze, repeated errors make it sick little by little, a service that is down drops on the spot. The server is the janitor, and he is the one who crosses the building to help whoever fell.',
        'Two rules keep the scene honest. Only the culprit gets sick: whoever depends on something that fell waits at the door, order in hand. And a business backlog is not an illness, it is paper piling up on the desk.',
        'On a computer the model takes clicks: it rotates, zooms and opens a sheet for each system, check by check. On the TV it stays on the overview, and if the machine runs hot the 3D scene gives way to the cards by itself.',
      ],
    },
    gallery: [
      {
        src: '/cases/painel-tv/ficha.webp',
        alt: {
          pt: 'Câmera aproximada numa sala, com a ficha do sistema aberta ao lado',
          en: 'Camera zoomed into one room, with the system sheet open beside it',
        },
        caption: {
          pt: 'Um clique no boneco aproxima a câmera e abre a ficha: o que é o sistema, a saúde, de quem ele depende e cada checagem com as últimas 24 horas em fatias de 15 minutos.',
          en: 'One click on a character zooms the camera in and opens the sheet: what the system is, its health, what it depends on, and each check with the last 24 hours in 15-minute slices.',
        },
      },
      {
        src: '/cases/painel-tv/queda.webp',
        alt: {
          pt: 'Sala com o chão vermelho, um boneco caído e outro ajoelhado ao lado, sob uma faixa de alerta',
          en: 'Room with a red floor, one character on the ground and another kneeling beside it, under an alert banner',
        },
        caption: {
          pt: 'Sistema fora do ar: o boneco cai, o chão da sala fica vermelho e a faixa do topo diz o que parou e desde quando. O servidor sai da sala dele e vai socorrer. Esta queda é encenada por um parâmetro no endereço, nada foi derrubado para a foto.',
          en: 'System down: the character falls, the room floor turns red and the top banner says what stopped and since when. The server leaves his room to help. This fall is staged through a URL parameter, nothing was taken down for the picture.',
        },
      },
      {
        src: '/cases/painel-tv/espera.webp',
        alt: {
          pt: 'Vários bonecos parados na beira das salas com crachá cinza, e um caído na rua',
          en: 'Several characters standing at the edge of their rooms with grey badges, and one down in the street',
        },
        caption: {
          pt: 'A internet caiu, e só ela adoece. Quem depende dela vai para a beira da sala e espera, com o crachá cinza. Assim a tela aponta a causa, em vez de acender vermelho em tudo.',
          en: 'The internet link fell, and it alone gets sick. Whoever depends on it walks to the edge of the room and waits, badge turned grey. That way the screen points at the cause instead of lighting everything red.',
        },
      },
      {
        src: '/cases/painel-tv/cartoes.webp',
        alt: {
          pt: 'Oito cartões com as checagens de cada sistema, um deles vermelho, sob uma faixa de alerta',
          en: 'Eight cards with the checks for each system, one of them red, under an alert banner',
        },
        caption: {
          pt: 'A mesma informação em cartões, que é a versão leve e a que entra sozinha se o servidor esquentar. Tudo apagado quando está normal: a cor aparece só no que foge do normal. Este alerta também é simulado.',
          en: 'The same information as cards, which is the light version and the one that takes over by itself if the server runs hot. Everything stays dark when normal: colour shows up only on what is off. This alert is simulated too.',
        },
      },
      {
        src: '/cases/painel-tv/cafe.webp',
        alt: {
          pt: 'Bonecos reunidos em volta de uma mesa pequena no pátio, com balões de fala',
          en: 'Characters gathered around a small table in the yard, with speech bubbles',
        },
        caption: {
          pt: 'Às 10h e às 15h30 o pessoal da casa vai até a mesa do pátio pegar pão de queijo. Não mede nada. É o que faz alguém olhar para a TV num dia em que está tudo bem, e é nesse dia que o painel precisa continuar sendo olhado.',
          en: 'At 10 and at 3:30 pm the in-house crew walks to the table in the yard for cheese bread. It measures nothing. It is what makes someone look at the TV on a day when everything is fine, and that is the day the board still needs to be looked at.',
        },
      },
    ],
  },
  {
    n: '21',
    slug: 'cardume',
    name: 'Cardume',
    status: 'live',
    context: 'Projeto de portfólio',
    groups: ['sites'],
    line: {
      pt: 'Uma loja de aquarismo inteira, do hero ao Pix: um koi de verdade nada atrás do cursor, a loja avisa quando um peixe come o outro e o aquário montado ganha vida na tela.',
      en: 'A complete aquarium store, from the hero to the checkout: a real koi swims after the cursor, the store warns you when one fish eats another and the tank you build comes alive on screen.',
    },
    stat: {
      pt: [
        'No ar na Vercel, inteiro no navegador: 29 produtos, carrinho, ficha técnica e checkout com Pix de demonstração',
        'O koi do hero é uma foto real recortada e fatiada em 32 tiras que seguem a curva do corpo',
        '13 espécies recortadas das fotos nadam, comem e se assustam no aquário que a pessoa monta',
        '60 quadros por segundo medidos no hero, nas categorias e no aquário montado',
      ],
      en: [
        'Live on Vercel, entirely in the browser: 29 products, cart, spec sheets and a demo Pix checkout',
        'The hero koi is a real photo, cut out and sliced into 32 strips that follow the curve of its body',
        '13 species cut out of photos swim, eat and get startled in the tank the visitor builds',
        '60 frames per second measured on the hero, the categories and the tank builder',
      ],
    },
    tags: ['React', 'Vite', 'Tailwind CSS', 'WebGL', 'Canvas'],
    media: {
      frame: 'desktop',
      src: '/cases/cardume/capa.webp',
      video: '/cases/cardume/scroll.mp4',
      poster: '/cases/cardume/poster.webp',
      alt: {
        pt: 'Primeira tela da loja: o nome Cardume em letras enormes sobre água escura com cáusticas, e um koi laranja e branco nadando por cima das letras',
        en: 'First screen of the store: the name Cardume in huge letters over dark water with caustics, and an orange and white koi swimming over the letters',
      },
    },
    links: [{ kind: 'site', href: 'https://cardume-beta.vercel.app' }],
    nota: {
      pt: 'A Cardume é uma loja FICTÍCIA, feita para este portfólio. Os produtos e preços são de exemplo e o Pix do checkout não cobra nada. As fotos das espécies são do Wikimedia Commons, com os créditos no rodapé do site.',
      en: 'Cardume is a FICTITIOUS store, built for this portfolio. Products and prices are examples and the checkout Pix charges nothing. The species photos come from Wikimedia Commons, credited in the site footer.',
    },
    problem: {
      pt: [
        'Eu queria um e-commerce no portfólio que não parecesse mais um template de loja. Aquarismo dava o assunto certo: é um produto vivo, bonito de ver e cheio de regra escondida, porque peixe bonito no aquário errado morre ou come o vizinho.',
        'Quem começa no hobby compra pela vitrine e descobre o problema em casa. O neon e o acará-bandeira nadam juntos na loja; meses depois o acará cresce e o neon vira comida. Uma loja boa precisava mostrar o peixe e, ao mesmo tempo, avisar isso antes da compra.',
      ],
      en: [
        'I wanted an e-commerce piece in the portfolio that did not look like yet another store template. Fishkeeping was the right subject: a living product, beautiful to look at and full of hidden rules, because a beautiful fish in the wrong tank dies or eats its neighbour.',
        'Newcomers buy from the shop window and find the problem at home. The neon and the angelfish swim together in the store; months later the angelfish grows and the neon becomes food. A good store had to show the fish and, at the same time, warn about that before the purchase.',
      ],
    },
    solution: {
      pt: [
        'O site inteiro mora debaixo d’água. Um único fundo em WebGL desenha as cáusticas e as bolhas atrás de todas as dobras e escurece conforme a página desce, como quem mergulha. No hero, o nome da loja fica enorme e um koi nada por cima das letras atrás do cursor. Tentei primeiro um koi desenhado em código e ficou com cara de ilustração. A versão final é uma foto real, recortada do fundo com o Vision do próprio Mac e fatiada em 32 tiras que acompanham uma cadeia de pontos: a cabeça persegue o cursor e uma onda cresce até a cauda.',
        'Cada peixe tem ficha técnica com temperatura, pH, tamanho adulto e temperamento em réguas visuais. Uma regra compara os peixes do carrinho entre si e avisa quando a água é diferente, quando a temperatura não fecha ou quando um pode comer o outro. O mesmo aviso aparece no Monte seu aquário, onde a pessoa escolhe tanque, equipamento, plantas e peixes e vê o resultado vivo: os peixes recortados das fotos nadam, vão atrás da ração quando ela clica na água e fogem se o cursor passa rápido.',
        'Tudo roda no navegador, sem servidor: o carrinho fica salvo na própria máquina e o checkout vai até um Pix de demonstração que avisa, com todas as letras, que nada é cobrado. A tipografia passou por três tentativas até chegar numa serifa grossa, a Zodiak, com uma palavra em itálico ciano em cada título.',
      ],
      en: [
        'The whole site lives underwater. A single WebGL background draws caustics and bubbles behind every section and gets darker as the page goes down, like diving. In the hero, the store name is huge and a koi swims over the letters after the cursor. I first tried a koi drawn in code and it looked like an illustration. The final version is a real photo, cut out of its background with the Mac’s own Vision framework and sliced into 32 strips that follow a chain of points: the head chases the cursor and a wave grows towards the tail.',
        'Every fish has a spec sheet with temperature, pH, adult size and temperament on visual rulers. A rule compares the fish in the cart with each other and warns when the water differs, when the temperatures do not overlap or when one can eat the other. The same warning shows up in the tank builder, where the visitor picks the tank, equipment, plants and fish and watches the result alive: the fish cut out of the photos swim, chase the food when you click the water and flee if the cursor moves fast.',
        'Everything runs in the browser, with no server: the cart is saved on the visitor’s own machine and the checkout goes as far as a demo Pix that says, in plain words, that nothing is charged. The typography went through three attempts before landing on a heavy serif, Zodiak, with one word in cyan italics in every heading.',
      ],
    },
    gallery: [
      {
        src: '/cases/cardume/oceano.webp',
        alt: { pt: 'Dobra com o título Um oceano inteiro cabe na sua sala e um vídeo de peixes laranja num feixe de luz', en: 'Section with the heading A whole ocean fits in your living room and a video of orange fish in a beam of light' },
        caption: { pt: 'A promessa da loja e as quatro garantias de entrega de peixe vivo, ao lado do vídeo que começou o projeto.', en: 'The store’s promise and the four live-delivery guarantees, next to the video that started the project.' },
      },
      {
        src: '/cases/cardume/categorias.webp',
        alt: { pt: 'Lista de categorias em letras grandes com a foto de um peixe-palhaço flutuando ao lado do cursor', en: 'List of categories in large type with a clownfish photo floating next to the cursor' },
        caption: { pt: 'As categorias são uma lista tipográfica. A foto de cada uma segue o cursor com atraso, como algo boiando, e ondula como vista através da água.', en: 'The categories are a typographic list. Each one’s photo follows the cursor with a delay, like something floating, and ripples as if seen through water.' },
      },
      {
        src: '/cases/cardume/loja.webp',
        alt: { pt: 'Grade da loja com filtros por categoria, busca e cards de peixes com nome científico e preço', en: 'Store grid with category filters, search and fish cards with scientific name and price' },
        caption: { pt: 'A loja: busca que aceita nome popular ou científico, filtros por água e um botão que solta uma bolha até o carrinho.', en: 'The store: search that takes the common or the scientific name, filters by water and a button that releases a bubble up to the cart.' },
      },
      {
        src: '/cases/cardume/ficha.webp',
        alt: { pt: 'Painel lateral com a ficha do betta: réguas de temperatura, pH e tamanho adulto', en: 'Side panel with the betta’s spec sheet: rulers for temperature, pH and adult size' },
        caption: { pt: 'A ficha técnica mostra a faixa ideal de cada espécie em réguas e já diz se o peixe convive com o que está no carrinho.', en: 'The spec sheet shows each species’ ideal range on rulers and already says whether the fish gets along with what is in the cart.' },
      },
      {
        src: '/cases/cardume/plantado.webp',
        alt: { pt: 'Vídeo de um aquário plantado com neons e um acará-bandeira, com o título Um pedaço de rio na sua estante', en: 'Video of a planted tank with neons and an angelfish, with the heading A piece of river on your shelf' },
        caption: { pt: 'O vídeo mostra um acará-bandeira entre os neons, e o texto aponta o problema: quando ele crescer, o neon vira comida. É a ponte para o aviso de compatibilidade.', en: 'The video shows an angelfish among the neons, and the text points at the problem: when it grows, the neon becomes food. It bridges into the compatibility warning.' },
      },
      {
        src: '/cases/cardume/monte.webp',
        alt: { pt: 'Monte seu aquário: um tanque animado com plantas e peixes de um lado, e as escolhas de aquário, equipamento e plantas do outro', en: 'Tank builder: an animated tank with plants and fish on one side, and the choices of tank, equipment and plants on the other' },
        caption: { pt: 'O aquário que a pessoa monta aparece vivo. A barra mede a ocupação pela regra de um centímetro de peixe por litro, e os avisos mudam a cada peixe que entra.', en: 'The tank the visitor builds shows up alive. The bar measures stocking by the one centimetre of fish per litre rule, and the warnings change with every fish added.' },
      },
      {
        src: '/cases/cardume/carrinho.webp',
        alt: { pt: 'Carrinho lateral com aquário, neons, acará-bandeira e anúbias, e um aviso de que o acará pode comer o neon', en: 'Side cart with a tank, neons, an angelfish and anubias, and a warning that the angelfish may eat the neon' },
        caption: { pt: 'No carrinho, a mesma regra: aqui ela pega a combinação do vídeo. O frete com garantia de peixe vivo some acima de R$ 300.', en: 'In the cart, the same rule: here it catches the combination from the video. The live-fish delivery fee disappears above R$ 300.' },
      },
      {
        src: '/cases/cardume/celular.webp',
        alt: { pt: 'Três telas de celular: o hero com o koi, a loja e o Monte seu aquário', en: 'Three phone screens: the hero with the koi, the store and the tank builder' },
        caption: { pt: 'No celular o koi passeia sozinho e segue o toque, e o aquário montado fica acima das escolhas.', en: 'On the phone the koi wanders by itself and follows touch, and the built tank sits above the choices.' },
      },
    ],
  },
  {
    n: '22',
    slug: 'visitantes',
    name: 'Visitantes da Catraca',
    status: 'live',
    context: 'Cliente',
    groups: ['gostinho-mineiro'],
    line: {
      pt: 'O RH cadastra quem vem de fora, o WhatsApp abre sozinho com o QR pronto e a catraca da empresa libera a entrada e a saída com ele.',
      en: 'HR registers an outside visitor, WhatsApp opens by itself with the QR ready and the company turnstile lets them in and out with it.',
    },
    stat: {
      pt: [
        'Um QR por visita, válido de algumas horas a um mês, que vale na entrada e na saída',
        'Cria e apaga o acesso direto na catraca por API, e o bloqueio vale na hora do cancelamento',
        '29 testes, com uma catraca falsa que roda o sistema inteiro sem o equipamento',
        'Dados apagados sozinhos depois de 90 dias, por causa da LGPD',
      ],
      en: [
        'One QR per visit, valid from a few hours to a month, working on the way in and on the way out',
        'Creates and removes access on the turnstile through its API, and a cancellation blocks the QR at once',
        '29 tests, with a fake turnstile that runs the whole system without the hardware',
        'Data deleted automatically after 90 days, for data protection law',
      ],
    },
    tags: ['Node', 'JavaScript', 'API REST', 'WhatsApp', 'nginx', 'pm2'],
    media: {
      frame: 'desktop',
      src: '/cases/visitantes/capa.webp',
      video: '/cases/visitantes/tour.mp4',
      poster: '/cases/visitantes/poster.webp',
      alt: {
        pt: 'Painel de visitantes com três números do dia e a lista de quem está dentro, quem ainda não chegou e quem já saiu',
        en: 'Visitors board with three numbers for the day and the list of who is inside, who has not arrived and who has left',
      },
    },
    nota: {
      pt: 'Os nomes, empresas e documentos que aparecem nas telas e no vídeo são inventados, gravados numa catraca de teste. O sistema real roda atrás de login, e só a página do QR de cada visitante é aberta.',
      en: 'The names, companies and documents shown on the screens and in the video are made up, recorded on a test turnstile. The real system runs behind a login, and only each visitor’s QR page is open.',
    },
    problem: {
      pt: [
        'Os funcionários já entravam pela catraca com o rosto. Quem vinha de fora ficava de fora do sistema: alguém abria a porta, ninguém sabia dizer quantos visitantes estavam no prédio, e não havia registro de hora de entrada e de saída.',
        'A primeira ideia foi um leitor de cartão na recepção, com o cartão devolvido ao RH na saída. Cartão se perde, precisa de estoque e de gente para entregar e recolher. O QR no celular do próprio visitante resolve sem nada para devolver.',
      ],
      en: [
        'Employees already went through the turnstile with their face. Outside visitors stayed outside the system: someone opened the door, nobody could say how many visitors were in the building, and there was no record of when they came in and left.',
        'The first idea was a card reader at reception, with the card handed back to HR on the way out. Cards get lost, need stock and someone to hand them out and collect them. A QR on the visitor’s own phone solves it with nothing to return.',
      ],
    },
    solution: {
      pt: [
        'O RH preenche nome, documento, WhatsApp e quem vai receber, escolhe a validade e aperta um botão. O sistema cria um usuário temporário direto na catraca, com data de início e de fim, e gera o QR. No mesmo clique o WhatsApp abre com a mensagem pronta e a imagem do QR copiada, é só colar e enviar. O visitante também recebe um link com o QR grande e o horário de validade.',
        'Testando no equipamento de verdade descobri duas coisas que a documentação não diz. A catraca lê um QR só de números como se fosse um cartão, então o acesso é cadastrado como cartão e não como QR. E ela guarda a hora local como se fosse UTC, o que deslocaria toda validade em três horas se eu tivesse seguido o óbvio.',
        'O painel mostra quem está dentro agora, quem ainda tem acesso e quem já saiu, lendo as passagens da própria catraca. Cancelar bloqueia o QR na hora, estender o prazo muda a validade, e a etiqueta impressa serve para quem chega sem celular.',
        'Para ninguém precisar de explicação, o sistema abre com um tutorial em máscara que ilumina uma parte por vez. Ele mora no mesmo endereço do painel da catraca, atrás do mesmo login, com uma página no início para escolher entre as duas áreas. Só a página do QR do visitante é aberta, e ela não mostra documento nem número de acesso.',
      ],
      en: [
        'HR fills in name, ID, WhatsApp and who is hosting, picks the validity and presses one button. The system creates a temporary user straight on the turnstile, with start and end dates, and generates the QR. On the same click WhatsApp opens with the message ready and the QR image copied, so it is just paste and send. The visitor also gets a link with the large QR and the validity time.',
        'Testing on the real equipment I found two things the documentation does not say. The turnstile reads a numbers-only QR as if it were a card, so access is registered as a card and not as a QR. And it stores local time as if it were UTC, which would have shifted every validity by three hours had I followed the obvious path.',
        'The board shows who is inside now, who still has access and who has left, reading the passes from the turnstile itself. Cancelling blocks the QR at once, extending changes the validity, and a printed label covers whoever arrives without a phone.',
        'So nobody needs an explanation, the system opens with a masked tutorial that lights up one part at a time. It lives at the same address as the turnstile panel, behind the same login, with a page up front to choose between the two areas. Only the visitor’s QR page is open, and it shows neither ID nor access number.',
      ],
    },
    gallery: [
      {
        src: '/cases/visitantes/menu.webp',
        alt: { pt: 'Página de escolha com dois cartões: Visitantes e Painel da catraca', en: 'Choice page with two cards: Visitors and Turnstile panel' },
        caption: { pt: 'Depois do login, uma página escolhe a área. O RH e o administrador entram pelo mesmo endereço e com a mesma senha de antes.', en: 'After login, a page picks the area. HR and the administrator come in at the same address with the same password as before.' },
      },
      {
        src: '/cases/visitantes/lista.webp',
        alt: { pt: 'Lista de visitantes com a Helena Moreira recém-criada no topo, ainda não chegou', en: 'Visitor list with Helena Moreira just created at the top, not yet arrived' },
        caption: { pt: 'Cada visita tem situação própria: ainda não chegou, dentro, já saiu, agendada, expirada ou cancelada, com a hora real de entrada e saída.', en: 'Each visit has its own status: not yet arrived, inside, left, scheduled, expired or cancelled, with the real entry and exit times.' },
      },
      {
        src: '/cases/visitantes/cadastro.webp',
        alt: { pt: 'Gaveta lateral com o formulário de novo visitante preenchido e atalhos de duração', en: 'Side drawer with the new visitor form filled in and duration shortcuts' },
        caption: { pt: 'O cadastro cabe numa gaveta e tem atalhos de validade: só hoje, três dias, uma semana ou um mês. O WhatsApp é obrigatório, porque é por ele que o QR chega.', en: 'The form fits in a drawer with validity shortcuts: today only, three days, a week or a month. WhatsApp is required, because that is how the QR arrives.' },
      },
      {
        src: '/cases/visitantes/pronto.webp',
        alt: { pt: 'Painel de confirmação com o QR gerado, aviso de WhatsApp aberto e botões de copiar e imprimir', en: 'Confirmation panel with the generated QR, a WhatsApp-opened notice and copy and print buttons' },
        caption: { pt: 'Ao gerar, o WhatsApp abre sozinho e a imagem do QR já está copiada. Se a janela for bloqueada, os mesmos passos ficam em botões.', en: 'On generating, WhatsApp opens by itself and the QR image is already copied. If the window gets blocked, the same steps stay as buttons.' },
      },
      {
        src: '/cases/visitantes/qr.webp',
        alt: { pt: 'Página pública do visitante com o nome, o selo de acesso liberado e um QR grande', en: 'Visitor public page with the name, an access granted badge and a large QR' },
        caption: { pt: 'O que o visitante recebe: nome inteiro, QR grande para a câmera da catraca, dois passos e a validade. Nenhum documento aparece.', en: 'What the visitor receives: full name, a large QR for the turnstile camera, two steps and the validity. No ID is shown.' },
      },
      {
        src: '/cases/visitantes/tutorial.webp',
        alt: { pt: 'Tutorial com a tela escurecida e o formulário iluminado ao lado de um balão de explicação', en: 'Tutorial with the screen dimmed and the form lit up next to an explanation bubble' },
        caption: { pt: 'O tutorial escurece a tela e ilumina uma parte por vez, em sete passos. Abre sozinho na primeira visita e volta pelo botão Como usar.', en: 'The tutorial dims the screen and lights up one part at a time, in seven steps. It opens by itself on the first visit and returns through the How to use button.' },
      },
      {
        src: '/cases/visitantes/celular.webp',
        alt: { pt: 'Três telas de celular: a escolha de área, a lista de visitantes e a página do QR', en: 'Three phone screens: area choice, the visitor list and the QR page' },
        caption: { pt: 'No celular a tabela vira lista de cartões e o botão de novo visitante fica fixo. O RH cadastra de onde estiver.', en: 'On the phone the table becomes a list of cards and the new visitor button stays fixed. HR can register from wherever they are.' },
      },
    ],
  },
  {
    n: '23',
    slug: 'painel-comercial',
    name: 'Painel Comercial',
    status: 'live',
    context: 'Cliente',
    groups: ['gostinho-mineiro'],
    line: {
      pt: 'Os supervisores comerciais veem quem parou de comprar, quem ligar hoje, onde a venda está e como cada representante vai na meta, tudo direto do ERP.',
      en: 'Sales supervisors see who stopped buying, who to call today, where sales are concentrated and how each rep is doing against target, straight from the ERP.',
    },
    stat: {
      pt: [
        'Lê o ERP da empresa a cada hora, só em leitura, com um usuário próprio que nunca derruba os outros sistemas',
        'Cada supervisor enxerga só os representantes dele, e a regra vale no servidor, não só na tela',
        'Fila de cobrança com a mensagem de WhatsApp pronta e a medição de quem voltou a comprar depois do contato',
        'Dezesseis telas com tutorial guiado, PDF com gráficos por representante e 20 testes automáticos',
      ],
      en: [
        'Reads the company ERP every hour, read-only, with its own user that never knocks the other systems off',
        'Each supervisor sees only their own reps, and the rule holds on the server, not just on screen',
        'Collection queue with the WhatsApp message ready and a measure of who came back to buy after the contact',
        'Sixteen screens with a guided tutorial, PDF with charts per rep and 20 automated tests',
      ],
    },
    tags: ['React', 'TypeScript', 'Vite', 'Node', 'Hono', 'SQLite', 'API REST', 'MapLibre', 'PDF', 'Excel'],
    media: {
      frame: 'desktop',
      src: '/cases/painel-comercial/capa.webp',
      video: '/cases/painel-comercial/tour.mp4',
      poster: '/cases/painel-comercial/poster.webp',
      alt: {
        pt: 'Visão geral do painel com faturamento, volume, clientes novos e clientes que deixaram de comprar, e o gráfico de evolução do mês',
        en: 'Overview with revenue, volume, new customers and customers who stopped buying, and the month evolution chart',
      },
    },
    nota: {
      pt: 'Todos os nomes, documentos, telefones, representantes e valores das telas, do vídeo e dos PDFs são inventados, gerados só para esta demonstração. Nenhum dado real da empresa aparece. O sistema de verdade roda atrás de login por CPF.',
      en: 'All names, IDs, phone numbers, reps and amounts in the screens, the video and the PDFs are made up, generated only for this demo. No real company data appears. The real system runs behind a CPF login.',
    },
    problem: {
      pt: [
        'Os supervisores comerciais acompanhavam a carteira por planilhas montadas à mão. Quando um cliente bom parava de comprar, ninguém via até a venda do mês já ter caído, e cada pergunta nova virava um pedido de relatório.',
        'Para piorar, a empresa trocou de ERP no meio do caminho. O histórico estava num sistema, as vendas de hoje no outro, e os números só batiam se alguém juntasse os dois com cuidado.',
      ],
      en: [
        'Sales supervisors tracked the portfolio with hand-built spreadsheets. When a good customer stopped buying, nobody noticed until the month’s sales had already dropped, and every new question became a report request.',
        'On top of that, the company switched ERP halfway. The history lived in one system and today’s sales in the other, and the numbers only matched if someone merged them carefully.',
      ],
    },
    solution: {
      pt: [
        'O painel junta o histórico antigo com as vendas novas do ERP e trata os dois como uma coisa só. Venda é a nota de venda líquida de devolução, o cliente é identificado pelo CPF ou CNPJ, e bonificação, remessa e nota cancelada ficam de fora, para o total conferir com o que o financeiro enxerga.',
        'Em vez de esperar a pergunta, ele aponta: cliente que passou de duas vezes o intervalo habitual de compra, cliente que parou de levar uma categoria, oportunidade de venda cruzada. Tudo cai numa fila do dia, do maior valor em risco para o menor, com a mensagem de WhatsApp escrita e um registro do contato. Depois de 30 dias o painel mede quantos dos contatados voltaram a comprar.',
        'As metas são definidas pelo supervisor por representante e acompanhadas com projeção do mês. O mapa mostra onde a venda se concentra, a tela Comparar põe até quatro representantes, regiões ou produtos lado a lado, e a ficha de produto mostra onde e quem mais vende. Toda tabela baixa em planilha e cada representante tem um PDF com gráficos, gerado sozinho toda segunda-feira.',
        'Uma descoberta que mudou o desenho: o ERP só aceita uma sessão por usuário, então usar o login de outro sistema derrubaria a loja. O painel tem usuário de serviço próprio, só de leitura, e uma tela de qualidade dos dados mostra o que está faltando no cadastro. Alterações em meses já fechados e quem baixou o quê ficam registradas.',
      ],
      en: [
        'The panel merges the old history with the ERP’s new sales and treats both as one. A sale is the sales invoice net of returns, the customer is identified by CPF or CNPJ, and giveaways, shipments and cancelled invoices are left out, so the total matches what finance sees.',
        'Instead of waiting for the question, it points things out: a customer past twice their usual buying interval, a customer who stopped taking one category, a cross-sell opportunity. All of it lands in a daily queue, from highest value at risk to lowest, with the WhatsApp message written and a contact log. After 30 days the panel measures how many of the contacted came back to buy.',
        'Targets are set by the supervisor per rep and tracked with a month projection. The map shows where sales are concentrated, the Compare screen puts up to four reps, regions or products side by side, and the product sheet shows where and who sells most. Every table downloads as a spreadsheet and each rep gets a PDF with charts, generated automatically every Monday.',
        'One discovery shaped the design: the ERP accepts only one session per user, so using another system’s login would knock the store offline. The panel has its own read-only service user, and a data quality screen shows what is missing in the records. Changes to already closed months and who downloaded what are logged.',
      ],
    },
    gallery: [
      {
        src: '/cases/painel-comercial/fila.webp',
        alt: { pt: 'Fila de cobrança com quatro números do dia e a lista de clientes com dias sem comprar e botões de WhatsApp e registrar', en: 'Collection queue with four numbers for the day and the customer list with days without buying and WhatsApp and log buttons' },
        caption: { pt: 'A fila do dia, do maior valor em risco para o menor. O WhatsApp abre com a mensagem pronta e quem foi contatado há menos de uma semana sai da frente.', en: 'The daily queue, from highest value at risk to lowest. WhatsApp opens with the message ready and anyone contacted less than a week ago steps aside.' },
      },
      {
        src: '/cases/painel-comercial/gaveta.webp',
        alt: { pt: 'Gaveta do cliente com contato, histórico de compras, o botão Não vou mais vender pra este cliente e o gráfico por mês', en: 'Customer drawer with contact, purchase history, the Stop selling to this customer button and the monthly chart' },
        caption: { pt: 'A ficha do cliente abre numa gaveta. Quem o supervisor decide não atender mais sai das listas de ativos com um clique, e o histórico de vendas continua nos totais.', en: 'The customer sheet opens in a drawer. A customer the supervisor decides to stop serving leaves the active lists in one click, and sales history stays in the totals.' },
      },
      {
        src: '/cases/painel-comercial/metas.webp',
        alt: { pt: 'Tela de metas com a meta de cada representante, barra de andamento, projeção e situação', en: 'Targets screen with each rep’s target, progress bar, projection and status' },
        caption: { pt: 'O supervisor define a meta de cada representante, e o painel mostra quanto já vendeu, para onde vai no ritmo atual e quanto falta por dia.', en: 'The supervisor sets each rep’s target, and the panel shows what has been sold, where the current pace leads and how much is needed per day.' },
      },
      {
        src: '/cases/painel-comercial/mapa.webp',
        alt: { pt: 'Mapa do Distrito Federal e entorno com bolhas por região e a lista das maiores regiões', en: 'Map of the Federal District and surroundings with bubbles per region and the list of largest regions' },
        caption: { pt: 'Cada bolha é uma região e o tamanho mostra o faturamento, o volume ou os clientes. Clicar numa bolha filtra o painel inteiro por ela.', en: 'Each bubble is a region and its size shows revenue, volume or customers. Clicking a bubble filters the whole panel by it.' },
      },
      {
        src: '/cases/painel-comercial/oportunidades.webp',
        alt: { pt: 'Lista de oportunidades de venda cruzada com a categoria a oferecer e o motivo', en: 'Cross-sell opportunity list with the category to offer and the reason' },
        caption: { pt: 'Venda cruzada: clientes que ainda não levam uma categoria que quase todo cliente parecido leva, com o potencial por mês e a oferta pronta no WhatsApp.', en: 'Cross-sell: customers who do not yet take a category that almost every similar customer takes, with monthly potential and the offer ready on WhatsApp.' },
      },
      {
        src: '/cases/painel-comercial/comparar.webp',
        alt: { pt: 'Gráfico de linhas comparando o faturamento de três representantes no mesmo período', en: 'Line chart comparing the revenue of three reps in the same period' },
        caption: { pt: 'Comparar põe de dois a quatro representantes, regiões, categorias ou produtos lado a lado, com os mesmos filtros do topo.', en: 'Compare puts two to four reps, regions, categories or products side by side, with the same filters from the top.' },
      },
      {
        src: '/cases/painel-comercial/produto.webp',
        alt: { pt: 'Ficha de um produto com faturamento, onde mais vende, quem mais vende e clientes que pararam de comprar', en: 'Product sheet with revenue, where it sells most, who sells it most and customers who stopped buying' },
        caption: { pt: 'A ficha do produto responde onde se vende mais, quem mais vende e quem parou de levar, com a posição dele dentro da categoria.', en: 'The product sheet answers where it sells most, who sells it most and who stopped taking it, with its position inside the category.' },
      },
      {
        src: '/cases/painel-comercial/relatorio.webp',
        alt: { pt: 'Página de PDF com quatro números, gráfico de evolução do período contra o anterior e rankings de produtos, categorias e clientes', en: 'PDF page with four numbers, an evolution chart of the period against the previous one and rankings of products, categories and customers' },
        caption: { pt: 'O PDF de cada representante abre com um painel de gráficos: o período contra o anterior, produtos, categorias e maiores clientes, e segue com as tabelas.', en: 'Each rep’s PDF opens with a chart panel: the period against the previous one, products, categories and top customers, and goes on with the tables.' },
      },
      {
        src: '/cases/painel-comercial/resumos.webp',
        alt: { pt: 'Resumos semanais com a lista de semanas à esquerda e os representantes da semana com faturamento e botão de PDF', en: 'Weekly summaries with the week list on the left and the week’s reps with revenue and a PDF button' },
        caption: { pt: 'Toda segunda-feira às 6h o painel gera o PDF da semana de cada representante. Dá para baixar um por um ou todos num zip.', en: 'Every Monday at 6am the panel generates each rep’s weekly PDF. You can download them one by one or all in a zip.' },
      },
      {
        src: '/cases/painel-comercial/auditoria.webp',
        alt: { pt: 'Tela de auditoria com as alterações em meses já fechados, mês, valor antes e depois', en: 'Audit screen with changes to already closed months, month, value before and after' },
        caption: { pt: 'Se uma carga do ERP muda o total de um mês que já fechou, a diferença fica registrada. A mesma tela mostra a qualidade dos dados e quem baixou o quê.', en: 'If an ERP load changes the total of an already closed month, the difference is logged. The same screen shows data quality and who downloaded what.' },
      },
      {
        src: '/cases/painel-comercial/tutorial.webp',
        alt: { pt: 'Tutorial com a tela escurecida e o menu iluminado ao lado de um balão de explicação', en: 'Tutorial with the screen dimmed and the menu lit up next to an explanation bubble' },
        caption: { pt: 'Toda tela nova abre com um tutorial em máscara que ilumina uma parte por vez e explica onde apertar, para ninguém precisar de treinamento.', en: 'Every new screen opens with a masked tutorial that lights up one part at a time and explains where to press, so nobody needs training.' },
      },
      {
        src: '/cases/painel-comercial/celular.webp',
        alt: { pt: 'Três telas de celular: a visão geral, a fila de cobrança e o mapa', en: 'Three phone screens: the overview, the collection queue and the map' },
        caption: { pt: 'No celular o menu vira uma faixa que rola de lado e os filtros ficam recolhidos num botão. O supervisor confere a fila e liga de onde estiver.', en: 'On the phone the menu becomes a strip that scrolls sideways and the filters collapse into a button. The supervisor checks the queue and calls from wherever they are.' },
      },
    ],
  },
  {
    n: '24',
    slug: 'prospecta',
    name: 'Prospecta',
    status: 'live',
    context: 'Produto próprio',
    groups: ['outros'],
    line: {
      pt: 'Acha no Google Maps os negócios que precisam de site, dá uma nota de 0 a 100 que explica o porquê e deixa a mensagem de WhatsApp pronta para quem vende site.',
      en: 'Finds businesses on Google Maps that need a website, gives each a 0 to 100 score that explains itself and leaves the WhatsApp message ready for someone who sells websites.',
    },
    stat: {
      pt: [
        'A área é escolhida no mapa, com raio ajustável, e a coleta de um nicho leva de 1 a 3 minutos',
        'Cada site é analisado sozinho e o lead cai em sem site, só rede social, fora do ar, ruim ou ok',
        'Nota de 0 a 100 com a lista dos motivos ao lado, e o dono achado pelo CNPJ quando o site mostra',
        '460 testes automáticos e nada é enviado sozinho: a ferramenta prepara, eu aperto enviar',
      ],
      en: [
        'The area is picked on the map, with an adjustable radius, and collecting one niche takes 1 to 3 minutes',
        'Each site is analysed automatically and the lead lands as no site, social media only, offline, poor or fine',
        'A 0 to 100 score with the list of reasons beside it, and the owner found through the company ID when the site shows it',
        '460 automated tests and nothing is sent automatically: the tool prepares, I press send',
      ],
    },
    tags: ['React', 'TypeScript', 'Vite', 'Node', 'Hono', 'SQLite', 'MapLibre', 'Go', 'Vitest'],
    media: {
      frame: 'desktop',
      src: '/cases/prospecta/capa.webp',
      video: '/cases/prospecta/tour.mp4',
      poster: '/cases/prospecta/poster.webp',
      alt: {
        pt: 'Mapa com os leads marcados e, à esquerda, a ficha de uma clínica com nota 96, os motivos da nota e a mensagem de WhatsApp pronta',
        en: 'Map with the leads marked and, on the left, a clinic sheet with a score of 96, the reasons for the score and the WhatsApp message ready',
      },
    },
    nota: {
      pt: 'Os nomes, telefones, donos e endereços das telas e do vídeo são inventados, num banco de demonstração. O banco de verdade, com negócios reais, fica só no meu computador e não aparece aqui. O mapa é real e os negócios marcados nele não são.',
      en: 'The names, phone numbers, owners and addresses in the screens and the video are made up, in a demo database. The real database, with real businesses, stays on my computer only and does not appear here. The map is real and the businesses marked on it are not.',
    },
    problem: {
      pt: [
        'Eu vendo sites como freelancer, e o primeiro passo é sempre achar quem precisa de um. As listas de empresas que existem por aí vêm sem critério: nome, telefone e nada sobre o que importa, que é saber se o negócio tem site, se vale a conversa e com quem falar.',
        'Fazer isso à mão era abrir o Maps, procurar negócio por negócio, abrir o site de cada um e anotar numa planilha. Dava uma ou duas dúzias de contatos por tarde, e metade nem era dos bons.',
      ],
      en: [
        'I sell websites as a freelancer, and the first step is always finding who needs one. The business lists out there come with no criteria: name, phone number and nothing about what matters, which is whether the business has a site, whether it is worth the conversation and who to talk to.',
        'Doing it by hand meant opening Maps, going business by business, opening each site and noting it down in a spreadsheet. It gave a dozen or two contacts per afternoon, and half of them were not even good ones.',
      ],
    },
    solution: {
      pt: [
        'O Prospecta começa pelo mapa. Eu busco a cidade, marco o centro com um clique, ajusto o raio e digo o nicho. Um coletor compilado para o chip do Mac traz os negócios do Google Maps daquela área, e os que ficam fora do raio são cortados. Cada site é aberto e analisado em seguida: ele diz se o negócio não tem site, só tem Instagram, tem um site fora do ar ou um site ruim, com os sinais que justificam, como página sem versão para celular ou muito lenta.',
        'A nota vai de 0 a 100 e nunca aparece sozinha. Ao lado dela está a conta: sem site vale 45 pontos, muitas avaliações no Google somam, ter celular provável para WhatsApp soma, saber o nome do dono soma. A lista fica ordenada por ela, então o melhor contato é sempre o primeiro. O dono vem da Receita pelo CNPJ quando o site mostra o número, ou eu preencho na ficha.',
        'A abordagem é toda manual de propósito. A ficha tem a mensagem escrita a partir de um modelo, com o nome da empresa, o bairro, um elogio tirado das avaliações e o meu portfólio no fim, e eu ajusto antes de abrir o WhatsApp. Há modelos para quem não tem site, para quem só tem Instagram, para o retorno em três dias e para quem respondeu. O funil marca em que ponto cada lead está, e o botão Voltar a falar agenda o retorno para amanhã, três dias, uma semana ou três meses.',
        'A tela de resultados mostra a taxa de resposta, o funil, quanto está em negociação e qual primeira mensagem responde mais, para eu parar de adivinhar o que funciona. O sistema abre com um tutorial em máscara, tem tema claro e escuro, exporta em CSV e roda no endereço local do Mac, com um ícone no Dock.',
      ],
      en: [
        'Prospecta starts from the map. I search the city, mark the centre with a click, adjust the radius and name the niche. A collector compiled for the Mac chip brings the businesses from Google Maps for that area, and those outside the radius are cut. Each site is then opened and analysed: it says whether the business has no site, only an Instagram, an offline site or a poor one, with the signals that justify it, such as a page with no mobile version or a very slow one.',
        'The score goes from 0 to 100 and never shows up alone. Beside it is the sum: no site is worth 45 points, many Google reviews add up, a likely WhatsApp mobile number adds up, knowing the owner’s name adds up. The list is sorted by it, so the best contact is always first. The owner comes from the tax authority through the company ID when the site shows the number, or I fill it in on the sheet.',
        'The approach is manual on purpose. The sheet has the message written from a template, with the company name, the neighbourhood, a compliment taken from the reviews and my portfolio at the end, and I adjust it before opening WhatsApp. There are templates for businesses with no site, for those with only Instagram, for the three-day follow-up and for those who replied. The funnel marks where each lead stands, and the Follow up button schedules the return for tomorrow, three days, a week or three months.',
        'The results screen shows the reply rate, the funnel, how much is in negotiation and which first message gets the most replies, so I stop guessing what works. The system opens with a masked tutorial, has light and dark themes, exports to CSV and runs on a local address on the Mac, with a Dock icon.',
      ],
    },
    gallery: [
      {
        src: '/cases/prospecta/lista.webp',
        alt: { pt: 'Mapa com os leads marcados por pontos azuis e, à esquerda, a lista ordenada pela nota com filtros por tipo de presença', en: 'Map with leads marked by blue dots and, on the left, the list sorted by score with filters by type of presence' },
        caption: { pt: 'A lista é ordenada pela nota e cada linha mostra a situação do site, as avaliações e se tem celular. Clicar num lead leva o mapa até ele.', en: 'The list is sorted by score and each row shows the site status, the reviews and whether there is a mobile number. Clicking a lead takes the map to it.' },
      },
      {
        src: '/cases/prospecta/filtros.webp',
        alt: { pt: 'Painel de filtros avançados com etapa do funil, mínimo de avaliações, nota, categoria e bairro', en: 'Advanced filters panel with funnel stage, minimum reviews, rating, category and neighbourhood' },
        caption: { pt: 'Os filtros afinam a lista por etapa do funil, número de avaliações, nota, categoria, bairro e só quem tem celular. O mapa acompanha o que a lista mostra.', en: 'Filters narrow the list by funnel stage, number of reviews, rating, category, neighbourhood and only those with a mobile number. The map follows what the list shows.' },
      },
      {
        src: '/cases/prospecta/busca.webp',
        alt: { pt: 'Mapa com um círculo de raio marcado, o campo de nicho preenchido com pizzaria e o botão Buscar ativo', en: 'Map with a radius circle marked, the niche field filled with pizzeria and the Search button active' },
        caption: { pt: 'Uma busca nova: um clique no mapa marca o centro, o controle ajusta o raio e o nicho é digitado. A coleta roda em segundo plano, uma por vez.', en: 'A new search: one click on the map marks the centre, the control adjusts the radius and the niche is typed. Collection runs in the background, one at a time.' },
      },
      {
        src: '/cases/prospecta/hoje.webp',
        alt: { pt: 'Aba Para hoje com três leads, o aviso de retorno atrasado em vermelho e os botões Avançou e Recusou', en: 'Today tab with three leads, the overdue follow-up notice in red and the Moved forward and Declined buttons' },
        caption: { pt: 'Para hoje junta quem tem retorno marcado ou atrasado. Em cada linha, dois botões levam o lead adiante no funil ou o descartam.', en: 'Today gathers whoever has a follow-up due or overdue. On each row, two buttons move the lead forward in the funnel or discard it.' },
      },
      {
        src: '/cases/prospecta/resultados.webp',
        alt: { pt: 'Tela de resultados com taxa de resposta, valor em negociação, funil em barras e a tabela de qual mensagem responde mais', en: 'Results screen with reply rate, amount in negotiation, a bar funnel and the table of which message gets the most replies' },
        caption: { pt: 'Resultados mostra a taxa de resposta, o funil e, por modelo de mensagem, quantas foram enviadas e quantas responderam, com um aviso quando a amostra ainda é pequena.', en: 'Results shows the reply rate, the funnel and, per message template, how many were sent and how many replied, with a warning while the sample is still small.' },
      },
      {
        src: '/cases/prospecta/mensagens.webp',
        alt: { pt: 'Lista de modelos de mensagem com as variáveis disponíveis e os botões Editar e Apagar', en: 'List of message templates with the available variables and the Edit and Delete buttons' },
        caption: { pt: 'Os modelos aceitam variáveis como nome, bairro, dono, categoria e um elogio tirado das avaliações. Dá para editar, apagar e escolher qual é o padrão.', en: 'Templates accept variables such as name, neighbourhood, owner, category and a compliment taken from the reviews. You can edit, delete and choose the default.' },
      },
      {
        src: '/cases/prospecta/tutorial.webp',
        alt: { pt: 'Tutorial com a tela escurecida e o campo de cidade iluminado ao lado de um balão de explicação', en: 'Tutorial with the screen dimmed and the city field lit up next to an explanation bubble' },
        caption: { pt: 'O tutorial escurece a tela e ilumina uma parte por vez, em vinte passos. Abre sozinho na primeira visita e volta pelo botão Tutorial.', en: 'The tutorial dims the screen and lights up one part at a time, in twenty steps. It opens by itself on the first visit and returns through the Tutorial button.' },
      },
      {
        src: '/cases/prospecta/escuro.webp',
        alt: { pt: 'Tema escuro em azul-marinho com o mapa em tons escuros, o raio da busca e a ficha de um lead', en: 'Dark theme in navy blue with the map in dark tones, the search radius and a lead sheet' },
        caption: { pt: 'O tema escuro troca também o estilo do mapa. O claro é o padrão e a escolha fica salva.', en: 'The dark theme also swaps the map style. Light is the default and the choice is saved.' },
      },
    ],
  },
  {
    n: '25',
    slug: 'cintila',
    name: 'Cintila',
    status: 'live',
    context: 'Projeto de portfólio',
    groups: ['sites'],
    line: {
      pt: 'Uma loja de semijoias pensada para a cliente que vende pelo WhatsApp: vitrine bonita, sacola, cupom e painel simples, com o pedido fechando na conversa.',
      en: 'A costume-jewellery store built for a seller who closes sales on WhatsApp: a pretty shop window, bag, coupon and a simple admin, with the order wrapping up in the chat.',
    },
    stat: {
      pt: [
        '13 peças em 4 categorias, com fotos reais, cores trocáveis, favoritos e busca',
        'Sacola com frete grátis por faixa, cupom de primeira compra e pedido enviado ao WhatsApp',
        'Painel para cadastrar peças, preços e estoque, e páginas de política já no rodapé',
        'Astro, GSAP e Lenis, sem framework de interface: páginas estáticas e leves',
      ],
      en: [
        '13 pieces in 4 categories, with real photos, switchable colours, favourites and search',
        'A bag with free shipping above a threshold, a first-purchase coupon and the order sent to WhatsApp',
        'An admin to register pieces, prices and stock, and policy pages already in the footer',
        'Astro, GSAP and Lenis, no UI framework: static, light pages',
      ],
    },
    tags: ['Astro', 'TypeScript', 'GSAP', 'Lenis', 'Three.js'],
    media: {
      frame: 'desktop',
      src: '/cases/semijoias/capa.webp',
      poster: '/cases/semijoias/poster.webp',
      alt: {
        pt: 'Primeira tela da loja Cintila: título Peças delicadas para usar todo dia, botões Ver a coleção e Falar no WhatsApp e uma foto de anéis e correntes douradas num arco',
        en: 'First screen of the Cintila store: the headline Delicate pieces for everyday wear, the See the collection and Talk on WhatsApp buttons and a photo of gold rings and chains in an arch',
      },
    },
    nota: {
      pt: 'A Cintila é uma loja FICTÍCIA, feita para este portfólio: nome, preços e dados da empresa são de exemplo. As fotos das peças vêm do Unsplash, de uso livre, e o WhatsApp do pedido é um número de teste.',
      en: 'Cintila is a FICTITIOUS store, built for this portfolio: name, prices and company details are examples. The product photos come from Unsplash, free to use, and the order WhatsApp is a test number.',
    },
    problem: {
      pt: [
        'Quem vende semijoia pequeno costuma começar pelo Instagram e pelo WhatsApp. Funciona, mas cada pedido vira uma conversa longa: qual peça, que cor, quanto fica, se tem estoque. A vendedora repete a mesma explicação o dia todo.',
        'Uma plataforma pronta resolveria, mas cobra mensalidade, comissão e entrega uma loja igual à de todo mundo. Joia vende por delicadeza, e isso se perde num modelo genérico.',
      ],
      en: [
        'People who sell costume jewellery on a small scale usually start on Instagram and WhatsApp. It works, but every order turns into a long chat: which piece, what colour, how much, whether it is in stock. The seller repeats the same explanation all day.',
        'A ready-made platform would solve it, but it charges a subscription, takes a commission and delivers a store like everyone else’s. Jewellery sells through delicacy, and that gets lost in a generic template.',
      ],
    },
    solution: {
      pt: [
        'A Cintila é uma vitrine própria que termina onde a vendedora já trabalha. A pessoa escolhe a peça, troca a cor, junta tudo na sacola e o pedido já sai montado para o WhatsApp, com nome, peças, cores e total. O frete é combinado na conversa, que é como ela já faz.',
        'O visual tem a calma que joia pede: tipografia fina, tons de marfim e dourado, fotos grandes e cartões que mostram uma segunda foto ao passar o mouse. No celular, as categorias aparecem logo no começo, a barra de compra da peça não cobre o conteúdo e a sacola abre por cima da tela.',
        'Para vender mais sem complicar, há cupom de primeira compra, barra de frete grátis que avança conforme a sacola enche, favoritos e busca instantânea. Um painel simples deixa a dona cadastrar peças, preços e estoque sem mexer em código.',
        'A loja é toda estática, por isso abre rápido mesmo em rede ruim. Os dados da empresa e as políticas de troca, envio e privacidade já estão no rodapé como exemplo, porque a lei pede isso de quem vende online.',
      ],
      en: [
        'Cintila is a storefront of its own that ends where the seller already works. The person picks a piece, switches the colour, gathers everything in the bag and the order leaves already assembled for WhatsApp, with name, pieces, colours and total. Shipping is agreed in the chat, which is how she already does it.',
        'The look has the calm that jewellery asks for: thin typography, ivory and gold tones, big photos and cards that show a second photo on hover. On the phone the categories appear right at the start, the buy bar of a piece does not cover the content and the bag opens over the screen.',
        'To sell more without complication there is a first-purchase coupon, a free-shipping bar that advances as the bag fills, favourites and instant search. A simple admin lets the owner register pieces, prices and stock without touching code.',
        'The store is fully static, so it opens fast even on a bad network. The company details and the exchange, shipping and privacy policies are already in the footer as examples, because the law asks that of anyone selling online.',
      ],
    },
    gallery: [
      {
        src: '/cases/semijoias/brincos.webp',
        alt: { pt: 'Página de Brincos com o banner de nós dourados, filtros por cor e ordenação, e a grade de peças com fotos reais', en: 'Earrings page with the gold-knot banner, colour and sort filters and the grid of pieces with real photos' },
        caption: { pt: 'Cada categoria tem banner próprio, filtro por cor e ordenação por novidade ou preço. A segunda foto do cartão aparece ao passar o mouse.', en: 'Each category has its own banner, a colour filter and sorting by newness or price. The card’s second photo appears on hover.' },
      },
      {
        src: '/cases/semijoias/colares.webp',
        alt: { pt: 'Página de Colares com banner de correntes douradas e cartões de corrente de elos, gargantilha e pingente de coração', en: 'Necklaces page with a gold-chain banner and cards for a link chain, a medallion choker and a heart pendant' },
        caption: { pt: 'A grade mantém preço e botão sempre na mesma linha, mesmo quando o nome da peça ocupa duas linhas.', en: 'The grid keeps price and button on the same line, even when a piece’s name takes two lines.' },
      },
      {
        src: '/cases/semijoias/ficha.webp',
        alt: { pt: 'Página de um anel solitário dourado com preço, seletor de cor, botão Adicionar à sacola e garantias de atendimento', en: 'Page of a gold solitaire ring with price, colour picker, an Add to bag button and service guarantees' },
        caption: { pt: 'A ficha da peça troca a cor sem recarregar, explica que o pedido se fecha pelo WhatsApp e deixa a dúvida a um clique.', en: 'The piece page switches colour without reloading, explains that the order is closed on WhatsApp and keeps a question one click away.' },
      },
      {
        src: '/cases/semijoias/carrinho.webp',
        alt: { pt: 'Sacola aberta à direita com dois itens, barra de frete grátis, campos de nome e cupom e o botão Finalizar pelo WhatsApp', en: 'Bag open on the right with two items, a free-shipping bar, name and coupon fields and the Checkout on WhatsApp button' },
        caption: { pt: 'A sacola mostra quanto falta para o frete grátis e finaliza montando a mensagem do pedido no WhatsApp.', en: 'The bag shows how much is missing for free shipping and checks out by building the order message on WhatsApp.' },
      },
      {
        src: '/cases/semijoias/celular.webp',
        alt: { pt: 'Duas telas de celular: o começo da loja com as categorias em círculos e a lista de anéis em duas colunas', en: 'Two phone screens: the start of the store with the categories in circles and the rings list in two columns' },
        caption: { pt: 'No celular as categorias vêm logo no começo e as peças ficam em duas colunas, com a sacola sempre ao alcance do polegar.', en: 'On the phone the categories come right at the start and the pieces sit in two columns, with the bag always within reach of the thumb.' },
      },
    ],
  },
];
