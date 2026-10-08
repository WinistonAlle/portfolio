'use client';

/* Alterna entre o tema escuro (padrão do site, sempre) e o claro, e guarda a
   escolha neste navegador. O ícone certo aparece por CSS (.so-escuro /
   .so-claro), então o botão não depende de estado do React nem pisca na
   hidratação.

   O rótulo mora aqui, e não no dicionário, de propósito: são duas frases, e
   passar por prop obrigaria Header, HomeShell e MacbookPortal a carregá-las. */

import type { Locale } from '@/i18n/config';

const ROTULO: Record<Locale, { claro: string; escuro: string }> = {
  pt: { claro: 'Mudar para o tema claro', escuro: 'Mudar para o tema escuro' },
  en: { claro: 'Switch to light theme', escuro: 'Switch to dark theme' },
};

export default function BotaoTema({ locale }: { locale: Locale }) {
  function alternar(e: React.MouseEvent<HTMLButtonElement>) {
    const raiz = document.documentElement;
    const trocar = () => {
      const novo = raiz.dataset.tema === 'claro' ? 'escuro' : 'claro';
      raiz.dataset.tema = novo;
      try {
        localStorage.setItem('tema', novo);
      } catch {
        // Sem armazenamento (aba anônima): o tema vale só até recarregar.
      }
    };
    // Navegador sem View Transitions, ou quem pediu menos movimento: troca seca.
    if (
      !document.startViewTransition ||
      matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      trocar();
      return;
    }
    // O tema novo se abre em círculo a partir do botão, até o canto mais distante.
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const raio = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    raiz.style.setProperty('--tema-x', `${x}px`);
    raiz.style.setProperty('--tema-y', `${y}px`);
    raiz.style.setProperty('--tema-raio', `${raio}px`);
    raiz.classList.add('trocando-tema');
    document
      .startViewTransition(trocar)
      .finished.finally(() => raiz.classList.remove('trocando-tema'));
  }

  const r = ROTULO[locale];
  return (
    <button type="button" onClick={alternar} className="theme-toggle">
      <svg className="so-escuro" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
      <span className="so-escuro sr-only">{r.claro}</span>
      <svg className="so-claro" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
      </svg>
      <span className="so-claro sr-only">{r.escuro}</span>
    </button>
  );
}
