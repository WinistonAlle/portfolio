'use client';

/* Aviso de cookies do Microsoft Clarity. Não bloqueia a página: é um cartão
   no canto, com o mesmo vidro do header, e some depois da escolha.

   O consentimento vale pelo Clarity, não pela presença do script: ele roda
   sempre, mas sem cookie (consentv2 negado, ver CLARITY no layout) até a
   pessoa aceitar. Recusar continua gerando mapa de calor, só que cada página
   conta como uma visita separada.

   A escolha fica no localStorage de propósito: lembrar a resposta entre
   visitas é o ponto do aviso (o tema escuro, que é outra regra, usa
   sessionStorage). */

import { useEffect, useState } from 'react';
import { usePixelTransition } from '@/components/transition/PixelTransition';

export const CHAVE_COOKIES = 'cookies';

type Texto = { message: string; accept: string; decline: string; label: string };

declare global {
  interface Window {
    clarity?: (...args: unknown[]) => void;
  }
}

export default function AvisoCookies({ texto }: { texto: Texto }) {
  const { bootActive } = usePixelTransition();
  const [pendente, setPendente] = useState(false);
  const [saindo, setSaindo] = useState(false);

  useEffect(() => {
    if (bootActive) return;
    let escolhido: string | null = null;
    try {
      escolhido = localStorage.getItem(CHAVE_COOKIES);
    } catch {}
    if (escolhido) return;
    /* Depois do boot e com folga: na visita fria a primeira pintura já
       disputa CPU com a abertura 3D. */
    const t = window.setTimeout(() => setPendente(true), 1200);
    return () => window.clearTimeout(t);
  }, [bootActive]);

  function escolher(aceito: boolean) {
    try {
      localStorage.setItem(CHAVE_COOKIES, aceito ? 'aceito' : 'recusado');
    } catch {}
    window.clarity?.('consentv2', {
      ad_Storage: 'denied',
      analytics_Storage: aceito ? 'granted' : 'denied',
    });
    setSaindo(true);
  }

  if (!pendente) return null;

  return (
    <section
      aria-label={texto.label}
      className={`aviso-cookies${saindo ? ' aviso-cookies--saindo' : ''}`}
      onAnimationEnd={() => saindo && setPendente(false)}
    >
      <p className="aviso-cookies__texto">{texto.message}</p>
      <div className="aviso-cookies__acoes">
        <button type="button" className="aviso-cookies__btn" onClick={() => escolher(false)}>
          {texto.decline}
        </button>
        <button
          type="button"
          className="aviso-cookies__btn aviso-cookies__btn--aceitar"
          onClick={() => escolher(true)}
        >
          {texto.accept}
        </button>
      </div>
    </section>
  );
}
