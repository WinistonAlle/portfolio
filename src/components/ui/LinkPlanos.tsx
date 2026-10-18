import TransitionLink from '@/components/transition/TransitionLink';

/* Caminho discreto até a página de planos. Ela saiu do menu de propósito: o
   portfólio não abre dizendo que há preço, e quem chega aqui (fim dos projetos,
   página de contato) já viu o trabalho. */
export default function LinkPlanos({ href, texto }: { href: string; texto: string }) {
  return (
    <TransitionLink href={href} className="link-planos">
      {texto}
      <span aria-hidden="true">→</span>
    </TransitionLink>
  );
}
