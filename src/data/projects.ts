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
      src: '/cases/aluplex/capa.jpg',
      video: '/cases/aluplex/scroll.mp4',
      poster: '/cases/aluplex/poster.jpg',
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
        src: '/cases/aluplex/solucoes.jpg',
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
        src: '/cases/aluplex/obras.jpg',
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
        src: '/cases/aluplex/numeros.jpg',
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
        src: '/cases/aluplex/orcamento.jpg',
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
      src: '/cases/alucraft/capa.jpg',
      video: '/cases/alucraft/scroll.mp4',
      poster: '/cases/alucraft/poster.jpg',
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
        src: '/cases/alucraft/catalogo.jpg',
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
        src: '/cases/alucraft/garantias.jpg',
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
        src: '/cases/alucraft/etapas.jpg',
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
        src: '/cases/alucraft/orcamento.jpg',
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
      src: '/cases/gostinho-mineiro/capa.jpg',
      video: '/cases/gostinho-mineiro/scroll.mp4',
      poster: '/cases/gostinho-mineiro/poster.jpg',
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
        src: '/cases/gostinho-mineiro/linha.jpg',
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
        src: '/cases/gostinho-mineiro/galeria.jpg',
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
        src: '/cases/gostinho-mineiro/contato.jpg',
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
        src: '/cases/gostinho-mineiro/onde.jpg',
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
      src: '/cases/habit-exe/capa.jpg',
      video: '/cases/habit-exe/scroll.mp4',
      poster: '/cases/habit-exe/poster.jpg',
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
        src: '/cases/habit-exe/features.jpg',
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
        src: '/cases/habit-exe/comandos.jpg',
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
        src: '/cases/habit-exe/depoimentos.jpg',
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
        src: '/cases/habit-exe/waitlist.jpg',
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
      src: '/cases/delivery-gm/capa.jpg',
      video: '/cases/delivery-gm/scroll.mp4',
      poster: '/cases/delivery-gm/poster.jpg',
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
        src: '/cases/delivery-gm/combos.jpg',
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
        src: '/cases/delivery-gm/carrinho.jpg',
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
        src: '/cases/delivery-gm/preparo.jpg',
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
        src: '/cases/delivery-gm/admin.jpg',
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
        src: '/cases/delivery-gm/temas.jpg',
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
        src: '/cases/delivery-gm/funil.jpg',
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
      src: '/cases/catalogo-funcionarios/entrada.jpg',
      video: '/cases/catalogo-funcionarios/scroll.mp4',
      poster: '/cases/catalogo-funcionarios/poster.jpg',
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
        src: '/cases/catalogo-funcionarios/vitrine.jpg',
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
        src: '/cases/catalogo-funcionarios/catalogo.jpg',
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
        src: '/cases/catalogo-funcionarios/pedidos.jpg',
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
        src: '/cases/catalogo-funcionarios/relatorios.jpg',
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
        src: '/cases/catalogo-funcionarios/auditoria.jpg',
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
        src: '/cases/catalogo-funcionarios/painel.jpg',
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
      src: '/cases/marsbeer/capa.jpg',
      video: '/cases/marsbeer/scroll.mp4',
      poster: '/cases/marsbeer/poster.jpg',
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
        src: '/cases/marsbeer/login.jpg',
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
        src: '/cases/marsbeer/loja.jpg',
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
        src: '/cases/marsbeer/crud.jpg',
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
        src: '/cases/marsbeer/relatorio.jpg',
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
      src: '/cases/pdv/capa.jpg',
      video: '/cases/pdv/scroll.mp4',
      poster: '/cases/pdv/poster.jpg',
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
        src: '/cases/pdv/carrinho.jpg',
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
        src: '/cases/pdv/pagamento.jpg',
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
        src: '/cases/pdv/dashboard.jpg',
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
        src: '/cases/pdv/impressoras.jpg',
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
      src: '/cases/evolua/capa.jpg',
      video: '/cases/evolua/scroll.mp4',
      poster: '/cases/evolua/poster.jpg',
      alt: {
        pt: 'Topo da landing do Evolua, com o título sobre o fluxo de cuidado',
        en: 'Top of the Evolua landing page, with the headline about care flow',
      },
    },
    links: [{ kind: 'github', href: 'https://github.com/WinistonAlle/Evolua' }],
    gallery: [
      {
        src: '/cases/evolua/fluxo.jpg',
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
        src: '/cases/evolua/sobre.jpg',
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
        src: '/cases/evolua/login.jpg',
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
      src: '/cases/totem/capa.jpg',
      video: '/cases/totem/scroll.mp4',
      poster: '/cases/totem/poster.jpg',
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
        src: '/cases/totem/catalogo.jpg',
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
        src: '/cases/totem/sacola.jpg',
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
        src: '/cases/totem/revisao.jpg',
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
      pt: 'O site que você está lendo agora: bilíngue, com abertura em 3D e um case por projeto.',
      en: 'The site you are reading right now: bilingual, with a 3D opening and one case per project.',
    },
    stat: {
      pt: [
        'Onze cases, cada um com vídeo do sistema rodando de verdade',
        'Português e inglês na mesma base: tradução faltando quebra o build',
        'A abertura é um MacBook 3D em three.js, guiado pela rolagem',
      ],
      en: [
        'Eleven cases, each with video of the system actually running',
        'Portuguese and English from one source: a missing translation breaks the build',
        'The opening is a 3D MacBook in three.js, driven by scroll',
      ],
    },
    tags: ['Next.js', 'TypeScript', 'three.js', 'Tailwind'],
    media: {
      frame: 'desktop',
      src: '/cases/portfolio/home.jpg',
      video: '/cases/portfolio/tour.mp4',
      poster: '/cases/portfolio/poster.jpg',
      alt: {
        pt: 'Home do portfólio, com o retrato recortado no meio e adesivos de tecnologia em volta',
        en: 'Portfolio home, with the cut-out portrait in the middle and technology stickers around it',
      },
    },
    links: [
      { kind: 'site', href: 'https://winiston.vercel.app' },
      { kind: 'github', href: 'https://github.com/WinistonAlle/portfolio' },
    ],
    gallery: [
      {
        src: '/cases/portfolio/abertura3d.jpg',
        alt: {
          pt: 'MacBook 3D fechado, de costas, com adesivos de tecnologia na tampa',
          en: 'Closed 3D MacBook seen from behind, technology stickers on the lid',
        },
        caption: {
          pt: 'O site abre com este MacBook, em three.js puro, sem biblioteca de React por cima: ele gira, abre, e a câmera entra até a tela dele virar exatamente a moldura onde o site aparece. Nada disso é animação com duração própria, é tudo função da rolagem, então quem desce rápido chega ao site rápido. Os adesivos são os mesmos da home, desenhados num atlas único pra tampa inteira custar uma textura só. E sim: este é o único lugar do portfólio onde a moldura do case é o próprio site.',
          en: 'The site opens with this MacBook, in plain three.js with no React layer on top: it spins, opens, and the camera moves in until its screen becomes exactly the frame the site appears in. None of it is an animation with a duration of its own, it is all a function of scroll, so scrolling fast gets you to the site fast. The stickers are the same ones from the home page, drawn into a single atlas so the whole lid costs one texture. And yes: this is the one place in the portfolio where the case mockup is the site itself.',
        },
      },
      {
        src: '/cases/portfolio/cracha.jpg',
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
        src: '/cases/portfolio/stack.jpg',
        alt: {
          pt: 'Mapa da stack, com as ferramentas ligadas por linhas em torno de um núcleo central',
          en: 'Stack map, with tools connected by lines around a central core',
        },
        caption: {
          pt: 'Lista de tecnologia não diz nada: todo mundo tem uma. Aqui as peças aparecem ligadas, agrupadas por frente, porque o que interessa não é quais eu sei, é como elas se encaixam num sistema.',
          en: 'A list of technologies says nothing: everybody has one. Here the pieces appear connected, grouped by area, because what matters is not which ones I know, it is how they fit together into a system.',
        },
      },
      {
        src: '/cases/portfolio/contato.jpg',
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
];
