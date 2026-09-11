import type pt from './pt';

/* Site copy in English.

   Typed against the Portuguese dictionary, so a missing key fails the build
   instead of rendering a blank on the page.

   This is a translation of intent, not of words. The Portuguese copy is written
   the way the author speaks; a literal rendering would read like a machine.
   Where an idiom has no English twin, the sentence was rewritten to land the
   same point. */

const en: typeof pt = {
  meta: {
    title: 'Winiston Alle — Full-Stack Developer',
    description:
      'Systems running in production: an internal catalog for 255 employees, a POS wired into a legacy ERP, a multi-tenant SaaS. React, Next.js, Supabase.',
  },

  nav: {
    about: 'About',
    projects: 'Projects',
    contact: 'Contact',
  },

  header: {
    switchLabel: 'Ler em português',
  },

  home: {
    title: 'PORTFOLIO',
    ctaProjects: 'See the projects',
    ctaAbout: 'About me',
  },

  about: {
    metaTitle: 'About — Winiston Alle',
    metaDescription:
      'Winiston Alle, full-stack developer. End-to-end systems in production, used by real people every day.',
    heroTitle: 'Full-stack developer.',
    bioLead: "I'm",
    bioName: 'Winiston Alle',
    bioRest:
      ", I'm 24 and I study software engineering. I model the database, write the backend, build the interface and look after the server the whole thing runs on. What I build is in production, used every day by hundreds of people. Outside of work I keep my own projects going, like a habit tracker and an iOS poker app. I work at something until it's actually good, not until it's acceptable.",
    ctaProjects: 'See the projects',
    ctaContact: 'Get in touch',
    stackTitle: 'Everything I work with, and how the pieces talk to each other.',
    workText:
      "I'm a systems developer at Gostinho Mineiro, a food manufacturer in Brasília. I joined as an intern and today I own the company's internal systems. The ordering portal I built is used by around 250 employees every day; before it existed, orders arrived over WhatsApp and someone in billing typed them into the system one by one. My focus is frontend and AI: interfaces people use without being trained, and automation that takes manual work out of the way.",
    timelineNow: 'Where I am today',
    timelineTitle: 'From finance to developer, in three years.',
    ctaTitle: 'Now tell me what you need.',
    ctaText:
      "A job, freelance work or just an idea you want to sanity-check: reach out and we'll sort the rest over email. And if you'd rather see the code before talking to me, the projects are right there.",
  },

  projects: {
    metaTitle: 'Projects — Winiston Alle',
    metaDescription:
      'A look at my work: client projects, my own products, university coursework and things still under construction.',
    title: 'A look at what I build.',
    filterLabel: 'Filter projects',
    filterAll: 'All',
    groups: {
      'gostinho-mineiro': 'Gostinho Mineiro',
      sites: 'Landing pages and sites',
      outros: 'Other',
    },
    countOne: 'project shown',
    countMany: 'projects shown',
    cardCta: 'View project',
    ctaTitle: 'Want one of these for your business?',
    ctaText:
      "Tell me what you need and I'll come back with scope, timeline and price. Quotes are free, and we adjust together until it fits what you actually want.",
    ctaButton: 'Request a quote',
    ctaAbout: 'About me',
  },

  project: {
    back: 'Projects',
    problemTitle: 'How it worked before.',
    solutionTitle: 'What changed.',
    galleryTitle: 'A look inside.',
    ctaTitle: 'Want to know how this part was built?',
    ctaButton: 'Request a quote',
    ctaOthers: 'See the other projects',
    expand: 'Expand the video',
    collapse: 'Close',
    linkSite: 'Open the site',
    linkGithub: 'View on GitHub',
    statusWip: 'In development',
  },

  contact: {
    metaTitle: 'Contact — Winiston Alle',
    metaDescription:
      'Get in touch with Winiston Alle about a job, freelance work or an idea.',
    titleStart: 'Pick where',
    titleEnd: ' we start.',
    intro:
      'A job, freelance work or just an idea you want to sanity-check. Click whichever block you prefer over there: they all reach me directly, with nobody in between.',
    quickTitle: 'Or just message me on WhatsApp.',
    quickText:
      'Fill in the three lines below and I open the chat with the message already written. On your side, just check it and hit send.',
    form: {
      name: 'Name',
      namePlaceholder: 'What should I call you',
      subject: 'Subject',
      message: 'Message',
      messagePlaceholder: 'one line is enough to start',
      submit: 'Message me on WhatsApp',
      greeting: 'Hi, Winiston! This is {nome}, I came from your portfolio.',
      subjectLine: 'Subject',
      opened: "I opened the chat in a new tab with the message ready. If it didn't open,",
      openedLink: 'click here',
      subjects: [
        'A simple site or landing page',
        'A custom-built system',
        'Automation or something with AI',
        'A job opening',
        'Something else',
      ],
    },
    whatsappGreeting: 'Hi, Winiston! I came from your portfolio.',
  },

  timeline: {
    estacio: {
      month: 'January',
      role: 'Financial Management',
      place: 'Estácio',
      line: 'First degree, in finance.',
    },
    claritti: {
      month: 'July',
      role: 'Administrative and financial assistant',
      place: 'Claritti, a glass and window manufacturer',
      line: 'First formal job, in administrative and financial routine.',
    },
    ucb: {
      month: 'July',
      role: 'Software Engineering',
      place: 'Universidade Católica de Brasília',
      line: 'Changed fields and started the degree over, now in software.',
    },
    'gm-estagio': {
      month: 'November',
      role: 'IT internship',
      place: 'Gostinho Mineiro, a food manufacturer',
      line: "Joined as an intern, looking after the plant's internal systems.",
    },
    'gm-junior': {
      month: 'February',
      role: 'Junior developer',
      place: 'Gostinho Mineiro',
      line: 'Hired full time. Today I own the internal systems, including the ordering portal used by around 250 employees every day.',
    },
  },
};

export default en;
