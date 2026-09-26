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
        'Quinze cases, cada um com vídeo do sistema rodando de verdade',
        'Português e inglês na mesma base: tradução faltando quebra o build',
        'A abertura é um MacBook 3D em three.js, guiado pela rolagem',
      ],
      en: [
        'Fifteen cases, each with video of the system actually running',
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
      src: '/cases/dashboard/resumo.jpg',
      video: '/cases/dashboard/scroll.mp4',
      poster: '/cases/dashboard/poster.jpg',
      alt: {
        pt: 'Resumo executivo do painel, com indicadores do período e a evolução do faturamento (dados fictícios)',
        en: 'Executive summary of the dashboard, with period indicators and revenue over time (fictitious data)',
      },
    },
    gallery: [
      {
        src: '/cases/dashboard/detalhe.jpg',
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
        src: '/cases/dashboard/heatmap.jpg',
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
        src: '/cases/dashboard/ano.jpg',
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
        src: '/cases/dashboard/tabela.jpg',
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
      src: '/cases/lua-de-mel/capa.jpg',
      video: '/cases/lua-de-mel/scroll.mp4',
      poster: '/cases/lua-de-mel/poster.jpg',
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
        src: '/cases/lua-de-mel/abertura.jpg',
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
        src: '/cases/lua-de-mel/transito.jpg',
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
        src: '/cases/lua-de-mel/toquio.jpg',
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
        src: '/cases/lua-de-mel/busca.jpg',
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
      src: '/cases/kings-table/capa.jpg',
      video: '/cases/kings-table/scroll.mp4',
      poster: '/cases/kings-table/poster.jpg',
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
        src: '/cases/kings-table/manifesto.jpg',
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
        src: '/cases/kings-table/areas.jpg',
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
        src: '/cases/kings-table/chip.jpg',
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
        src: '/cases/kings-table/noites.jpg',
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
        src: '/cases/kings-table/mesa.jpg',
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
      src: '/cases/coro-hub/capa.jpg',
      video: '/cases/coro-hub/scroll.mp4',
      poster: '/cases/coro-hub/poster.jpg',
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
        src: '/cases/coro-hub/servicos.jpg',
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
        src: '/cases/coro-hub/metodo.jpg',
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
        src: '/cases/coro-hub/exemplos.jpg',
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
        src: '/cases/coro-hub/chamada.jpg',
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
];
