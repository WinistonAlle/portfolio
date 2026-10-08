import { useSyncExternalStore } from 'react';

export type Tema = 'claro' | 'escuro';

const ler = (): Tema =>
  document.documentElement.dataset.tema === 'claro' ? 'claro' : 'escuro';

function assinar(avisar: () => void) {
  const olho = new MutationObserver(avisar);
  olho.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-tema'],
  });
  return () => olho.disconnect();
}

/* O tema mora no <html data-tema> (posto antes da primeira pintura, trocado
   pelo BotaoTema). O CSS lê isso sozinho; este hook é para o que não é CSS:
   textura de cena 3D e desenho em canvas. No servidor responde 'escuro', que
   é o padrão do site. */
export function useTema(): Tema {
  return useSyncExternalStore(assinar, ler, () => 'escuro');
}
