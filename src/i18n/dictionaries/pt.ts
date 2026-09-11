/* Texto do site em português.

   Este arquivo é a FORMA do dicionário: o `en.ts` é tipado como `typeof pt`,
   então esquecer uma chave lá não compila. Acrescentar texto novo aqui quebra
   o build até o inglês existir, que é exatamente o que se quer de um site
   bilíngue: sem meio-termo em que uma página aparece metade traduzida.

   Só texto que a pessoa lê na tela. Nome próprio, nome de tecnologia e nome de
   projeto ficam fora: "Supabase" e "Gostinho Mineiro" são os mesmos nos dois. */

const pt = {
  meta: {
    title: 'Winiston Alle — Desenvolvedor Full-Stack',
    description:
      'Sistemas em produção: catálogo interno para 255 funcionários, PDV integrado a ERP legado, SaaS multi-tenant. React, Next.js, Supabase.',
  },

  nav: {
    about: 'Sobre mim',
    projects: 'Projetos',
    contact: 'Contato',
  },

  header: {
    /* O botão mostra o idioma para onde ele leva, não o atual. "EN" num site em
       português é a promessa do que acontece no clique; "PT" ali seria um
       rótulo de estado, e ninguém clica em rótulo de estado. */
    switchLabel: 'Read in English',
  },

  home: {
    title: 'PORTFÓLIO',
    ctaProjects: 'Ver os projetos',
    ctaAbout: 'Sobre mim',
  },

  about: {
    metaTitle: 'Sobre mim — Winiston Alle',
    metaDescription:
      'Winiston Alle, desenvolvedor full-stack. Sistemas de ponta a ponta em produção, com gente usando todo dia.',
    heroTitle: 'Desenvolvedor full-stack.',
    bioLead: 'Sou',
    bioName: 'Winiston Alle',
    bioRest:
      ', tenho 24 anos e curso engenharia de software. Modelo o banco, escrevo o backend, construo a interface e cuido do servidor onde o sistema roda. O que eu desenvolvo está em produção, usado todos os dias por centenas de pessoas. Fora do trabalho mantenho projetos próprios, como um app de controle de hábitos e um app de poker para iOS. Trabalho até ficar bom de verdade, não até ficar aceitável.',
    ctaProjects: 'Ver os projetos',
    ctaContact: 'Falar comigo',
    stackTitle: 'Tudo que eu uso, e como as peças *se conversam*.',
    workText:
      'Sou desenvolvedor de sistemas na Gostinho Mineiro, uma indústria de alimentos em Brasília. Entrei como estagiário e hoje respondo pelos sistemas internos da empresa. O portal de pedidos que eu construí é usado por cerca de 250 funcionários todo dia, antes dele, o pedido chegava por WhatsApp e alguém do faturamento digitava um por um no sistema. Meu foco é frontend e IA: interface que a pessoa usa sem precisar de treinamento, e automação que tira trabalho manual do caminho.',
    timelineNow: 'Onde estou hoje',
    timelineTitle: 'De gestão financeira a desenvolvedor, em três anos.',
    ctaTitle: 'Agora me conta o que você precisa.',
    ctaText:
      'Vaga, projeto freelance ou só uma ideia pra validar: me chama que a gente combina o resto por e-mail. E se quiser ver o código antes de falar comigo, os projetos estão logo ali.',
  },

  projects: {
    metaTitle: 'Projetos — Winiston Alle',
    metaDescription:
      'Um pouco do meu trabalho: projetos de cliente, produtos próprios, trabalhos de faculdade e o que ainda está em construção.',
    title: 'Conheça um pouco do *meu trabalho*.',
    filterLabel: 'Filtrar projetos',
    filterAll: 'Todos',
    groups: {
      'gostinho-mineiro': 'Gostinho Mineiro',
      sites: 'Landing pages e sites',
      outros: 'Outros',
    },
    countOne: 'projeto exibido',
    countMany: 'projetos exibidos',
    cardCta: 'Ver projeto',
    ctaTitle: 'Quer um assim pro seu negócio?',
    ctaText:
      'Me conta o que você precisa e eu volto com escopo, prazo e preço. O orçamento é gratuito e a gente ajusta junto até chegar no que funciona pra você.',
    ctaButton: 'Solicitar orçamento',
    ctaAbout: 'Sobre mim',
  },

  project: {
    back: 'Projetos',
    problemTitle: 'Como era antes.',
    solutionTitle: 'O que mudou.',
    galleryTitle: 'Por dentro.',
    ctaTitle: 'Quer saber como essa parte foi feita?',
    ctaButton: 'Solicitar orçamento',
    ctaOthers: 'Ver os outros projetos',
    /* Rótulos de link e de estado ficam aqui, e não no dado do projeto: são os
       mesmos em todo card, e repetir "Abrir o site" seis vezes no projects.ts
       é seis lugares pra desencontrar tradução. */
    expand: 'Ampliar o vídeo',
    collapse: 'Fechar',
    linkSite: 'Abrir o site',
    linkGithub: 'Ver no GitHub',
    statusWip: 'Em desenvolvimento',
  },

  contact: {
    metaTitle: 'Contato — Winiston Alle',
    metaDescription:
      'Fale com Winiston Alle sobre uma vaga, um projeto freelance ou uma ideia.',
    titleStart: 'Escolhe por onde',
    titleEnd: ' a gente começa.',
    intro:
      'Vaga, projeto freelance ou só uma ideia pra validar. É só clicar no bloco do canal que você preferir aí do lado: todos caem direto comigo, sem intermediário no meio do caminho.',
    quickTitle: 'Ou já me chama no WhatsApp.',
    quickText:
      'Preenche as três linhas abaixo que eu abro a conversa com a mensagem montada. Do seu lado é só conferir e apertar enviar.',
    form: {
      name: 'Nome',
      namePlaceholder: 'Como te chamo',
      subject: 'Assunto',
      message: 'Mensagem',
      messagePlaceholder: 'uma linha já basta pra começar',
      submit: 'Chamar no WhatsApp',
      /* {nome} é trocado pelo que a pessoa digitou. Fica como marcador e não
         como concatenação no componente porque a ordem da frase muda de idioma
         pra idioma, e concatenar engessa a ordem em português. */
      greeting: 'Oi, Winiston! Aqui é {nome}, vim pelo seu portfólio.',
      subjectLine: 'Assunto',
      opened: 'Abri a conversa numa aba nova, com a mensagem pronta. Se não abriu,',
      openedLink: 'clica aqui',
      subjects: [
        'Um site simples ou landing page',
        'Um sistema sob medida',
        'Automação ou alguma coisa com IA',
        'Uma vaga',
        'Outro assunto',
      ],
    },
    /* Mensagem que já vai escrita no WhatsApp quando a pessoa clica no cubo. */
    whatsappGreeting: 'Oi, Winiston! Vim pelo seu portfólio.',
  },

  timeline: {
    estacio: {
      month: 'Janeiro',
      role: 'Gestão Financeira',
      place: 'Estácio',
      line: 'Primeira graduação, na área financeira.',
    },
    claritti: {
      month: 'Julho',
      role: 'Assistente administrativo e financeiro',
      place: 'Claritti, indústria de vidros e esquadrias',
      line: 'Primeiro emprego formal, na rotina administrativa e financeira.',
    },
    ucb: {
      month: 'Julho',
      role: 'Engenharia de Software',
      place: 'Universidade Católica de Brasília',
      line: 'Troquei de área e recomecei a graduação, agora em software.',
    },
    'gm-estagio': {
      month: 'Novembro',
      role: 'Estágio em TI',
      place: 'Gostinho Mineiro, indústria de alimentos',
      line: 'Entrei como estagiário, cuidando dos sistemas internos da indústria.',
    },
    'gm-junior': {
      month: 'Fevereiro',
      role: 'Desenvolvedor júnior',
      place: 'Gostinho Mineiro',
      line: 'Efetivado. Hoje respondo pelos sistemas internos, incluindo o portal de pedidos usado por cerca de 250 funcionários todo dia.',
    },
  },
};

export default pt;
