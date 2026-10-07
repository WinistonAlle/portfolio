'use client';

/* O crachá do celular: um cartão em CSS 3D, pendurado numa fita, no lugar da
 * cena com física (Lanyard) que roda no computador.
 *
 * A cena 3D não funcionava em tela de mão: ficava depois de todo o texto,
 * pequena, e arrastar o crachá disputava o dedo com a rolagem da página. Aqui
 * a interação é feita pra toque:
 *
 *  - tocar vira o cartão (frente e verso);
 *  - arrastar de lado inclina, e um brilho holográfico acompanha o dedo;
 *  - parado, ele balança de leve, pendurado pela fita.
 *
 * `touch-action: pan-y` deixa a rolagem vertical com o navegador: só o
 * movimento horizontal vira inclinação. Sem three, sem rapier, sem modelo.
 */

import { useRef, useState, type PointerEvent } from 'react';
import './cracha-cartao.css';

export default function CrachaCartao({
  dica,
  rotuloVirar,
  className = '',
}: {
  dica: string;
  rotuloVirar: string;
  className?: string;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [verso, setVerso] = useState(false);
  const [segurando, setSegurando] = useState(false);
  const inicio = useRef<{ x: number; y: number } | null>(null);

  const inclinar = (e: PointerEvent<HTMLButtonElement>) => {
    const el = ref.current;
    if (!el || !inicio.current) return;
    const r = el.getBoundingClientRect();
    /* -1..1 a partir do centro do cartão. */
    const nx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - 0.5) * 2));
    const ny = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height - 0.5) * 2));
    el.style.setProperty('--ry', `${(nx * 20).toFixed(2)}deg`);
    el.style.setProperty('--rx', `${(-ny * 12).toFixed(2)}deg`);
    el.style.setProperty('--bx', `${((nx + 1) * 50).toFixed(1)}%`);
    el.style.setProperty('--by', `${((ny + 1) * 50).toFixed(1)}%`);
  };

  const soltar = (e: PointerEvent<HTMLButtonElement>) => {
    const el = ref.current;
    const de = inicio.current;
    inicio.current = null;
    setSegurando(false);
    if (el) {
      el.style.setProperty('--ry', '0deg');
      el.style.setProperty('--rx', '0deg');
    }
    /* Toque sem arrasto vira o cartão. O clique do teclado cai em onClick. */
    if (de && Math.hypot(e.clientX - de.x, e.clientY - de.y) < 8) setVerso((v) => !v);
  };

  return (
    <div className={`cracha ${className}`}>
      <span className="cracha__fita" aria-hidden="true" />
      <span className="cracha__presilha" aria-hidden="true" />
      <button
        ref={ref}
        type="button"
        className={`cracha__cartao${verso ? ' cracha__cartao--verso' : ''}${segurando ? ' cracha__cartao--segurando' : ''}`}
        aria-label={rotuloVirar}
        aria-pressed={verso}
        onPointerDown={(e) => {
          inicio.current = { x: e.clientX, y: e.clientY };
          setSegurando(true);
          inclinar(e);
        }}
        onPointerMove={inclinar}
        onPointerUp={soltar}
        onPointerCancel={() => {
          inicio.current = null;
          setSegurando(false);
          ref.current?.style.setProperty('--ry', '0deg');
          ref.current?.style.setProperty('--rx', '0deg');
        }}
        onClick={(e) => {
          /* Só teclado (detail 0): o toque já foi tratado no pointerup. */
          if (e.detail === 0) setVerso((v) => !v);
        }}
      >
        <span className="cracha__giro">
          <span className="cracha__face">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/badge-front.png" alt="" draggable={false} />
          </span>
          <span className="cracha__face cracha__face--verso">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/badge-back.png" alt="" draggable={false} />
          </span>
        </span>
      </button>
      <p className="cracha__dica">
        <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
          <path d="M3 5.5a5 5 0 0 1 9-2.6M13 10.5a5 5 0 0 1-9 2.6M12.2 1v2.3H9.9M3.8 15v-2.3h2.3" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {dica}
      </p>
    </div>
  );
}
