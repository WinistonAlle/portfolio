'use client';

import { useRef, useState, type ReactNode } from 'react';
import { rolarAte } from '@/components/scroll/SmoothScroll';

/* A parte que abre e fecha da dobra do currículo. O conteúdo chega pronto do
   servidor (children); aqui mora só o estado.

   A altura é animada por `grid-template-rows` (0fr -> 1fr) no CSS, com um
   `min-height` no filho fazendo a espiada: fechada, a folha mostra o começo
   do resto e some num degradê. Sem medir altura em JavaScript.

   Fechado, o resto fica `inert`: está cortado na tela, então também não pode
   receber foco de teclado nem ser lido pela metade. */
export default function CurriculoDobra({
  children,
  abrir,
  fechar,
}: {
  children: ReactNode;
  abrir: string;
  fechar: string;
}) {
  const [aberto, setAberto] = useState(false);
  const raiz = useRef<HTMLDivElement>(null);

  function alternar() {
    /* Ao fechar, a folha encolhe e quem estava lendo o fim dela cairia no
       meio da seção seguinte. Volta para o topo da folha, se ele já saiu da
       tela. */
    if (aberto && raiz.current) {
      const topo = raiz.current.getBoundingClientRect().top;
      if (topo < 0) rolarAte(window.scrollY + topo - 96, 0.6);
    }
    setAberto(!aberto);
  }

  return (
    <div ref={raiz} className="cv__dobra" data-aberto={aberto}>
      <div className="cv__resto">
        <div className="cv__resto-dentro" inert={!aberto}>
          {children}
        </div>
      </div>

      <div className="cv__alternar">
        <button
          type="button"
          className="cv__botao botao-texto"
          aria-expanded={aberto}
          onClick={alternar}
        >
          {aberto ? fechar : abrir}
          <svg aria-hidden="true" viewBox="0 0 12 12" className="cv__seta">
            <path d="M2.5 4.5 6 8l3.5-3.5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
