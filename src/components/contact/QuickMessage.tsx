'use client';

/* Formulário curto que abre a conversa no WhatsApp com a mensagem montada.
 *
 * Sem backend, e aqui isso não é remendo: wa.me é uma URL https comum, então
 * ela sempre carrega alguma coisa. Quem tem WhatsApp cai na conversa, quem
 * não tem cai na página do próprio WhatsApp explicando o que fazer. É o
 * oposto do mailto, que em máquina sem cliente de e-mail configurado não faz
 * nada visível e deixa a pessoa achando que o site quebrou.
 *
 * Assunto é uma lista fechada em vez de campo livre: quem chega decidido não
 * trava escrevendo, e a mensagem já chega classificada.
 */

import { useState } from 'react';
import { WHATSAPP_NUMBER } from '@/data/socials';
import GlowButton, { GlowArrow } from '@/components/ui/GlowButton';

const ASSUNTOS = [
  'Um site simples ou landing page',
  'Um sistema sob medida',
  'Automação ou alguma coisa com IA',
  'Uma vaga',
  'Outro assunto',
];

const CAMPO =
  'mt-3 w-full rounded-xl border border-line bg-surface/60 px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted/60 focus:border-accent';

export default function QuickMessage() {
  const [abriu, setAbriu] = useState(false);
  const [link, setLink] = useState('');

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const nome = String(form.get('nome') ?? '').trim();
    const assunto = String(form.get('assunto') ?? '');
    const mensagem = String(form.get('mensagem') ?? '').trim();

    const texto = `Oi, Winiston! Aqui é ${nome}, vim pelo seu portfólio.\n\nAssunto: ${assunto}\n\n${mensagem}`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(texto)}`;

    /* Aba nova para a pessoa não perder o portfólio de vista. Como a chamada
       vem do clique dela, o bloqueador de pop-up deixa passar. */
    window.open(url, '_blank', 'noopener,noreferrer');
    setLink(url);
    setAbriu(true);
  };

  return (
    <div>
      <form
        onSubmit={onSubmit}
        className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-[1fr_1.1fr_1.5fr_auto] lg:items-end"
      >
        <label className="block">
          <span className="label">Nome</span>
          <input
            name="nome"
            required
            autoComplete="name"
            placeholder="Como te chamo"
            className={CAMPO}
          />
        </label>

        <label className="block">
          <span className="label">Assunto</span>
          {/* color-scheme dark: sem isso a lista que o sistema desenha abre
              branca por cima de uma página preta. */}
          <select
            name="assunto"
            required
            defaultValue={ASSUNTOS[0]}
            className={`${CAMPO} [color-scheme:dark] cursor-pointer appearance-none bg-[length:11px] bg-[right_1rem_center] bg-no-repeat pr-10`}
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8' fill='none' stroke='%2378879f' stroke-width='1.6'><path d='M1 1.5 6 6.5 11 1.5'/></svg>\")",
            }}
          >
            {ASSUNTOS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="label">Mensagem</span>
          <input
            name="mensagem"
            required
            placeholder="uma linha já basta pra começar"
            className={CAMPO}
          />
        </label>

        <GlowButton type="submit" className="justify-center">
          Chamar no WhatsApp
          <GlowArrow />
        </GlowButton>
      </form>

      {/* Se o navegador barrar a aba nova, nada acontece na tela e a pessoa
          fica sem saber. O link fica aqui como saída. */}
      {abriu && (
        <p className="mt-5 text-sm text-muted">
          Abri a conversa numa aba nova, com a mensagem pronta. Se não abriu,{' '}
          <a
            href={link}
            target="_blank"
            rel="noreferrer"
            className="text-foreground underline decoration-line underline-offset-4 transition-colors hover:text-accent"
          >
            clica aqui
          </a>
          .
        </p>
      )}
    </div>
  );
}
