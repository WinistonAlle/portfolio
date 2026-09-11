'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { setScrollLocked } from '@/components/scroll/SmoothScroll';
import GlowButton from '@/components/ui/GlowButton';

/* Amplia a moldura do projeto sem tirá-la do lugar.
 *
 * O jeito óbvio seria jogar a moldura num portal no <body> e mostrar em tela
 * cheia. Três coisas do site impedem isso, e é por elas que o componente tem
 * a forma que tem:
 *
 * 1. O SlideIn que envolve a moldura aplica `transform`. Elemento transformado
 *    vira bloco de contenção, então `position: fixed` lá dentro se posiciona
 *    contra ELE, e não contra a janela. Por isso quem amplia é um `transform`,
 *    não uma mudança de posicionamento.
 * 2. O <main> tem `z-index: 10`, o que cria um contexto de empilhamento. Um
 *    fundo escurecido em portal no <body> ficaria POR CIMA da moldura, por
 *    mais alto que fosse o z-index dela. Por isso o fundo é irmão da moldura,
 *    dentro do mesmo contexto.
 * 3. Trocar o elemento de lugar no DOM remonta o <video>, e a reprodução
 *    recomeça do zero no meio da animação. Ficando parado, ele continua
 *    tocando.
 *
 * O resultado é o efeito pedido: o notebook se aproxima, em vez de a tela
 * "abrir" um modal por cima dele.
 *
 * Não vai a tela cheia de propósito: para em 88% da janela, então as bordas do
 * notebook continuam visíveis. Ampliar até encostar nas bordas transformaria a
 * moldura num quadro cortado, que é justamente o que ela não é.
 */

/** Quanto da janela a moldura ampliada ocupa. O resto é a folga que deixa as
 *  bordas do notebook aparecendo. */
const OCUPACAO = 0.88;

export default function ExpandableFrame({
  children,
  expandLabel,
  collapseLabel,
}: {
  children: ReactNode;
  expandLabel: string;
  collapseLabel: string;
}) {
  const [aberto, setAberto] = useState(false);
  const [transform, setTransform] = useState<string>('');
  /* Começa falso de propósito: o servidor não renderiza o botão e ele só
     aparece depois que der para medir que ampliar muda alguma coisa. No
     celular a moldura já ocupa a largura quase toda, e ali o botão nunca
     aparece: um botão que não faz nada é pior que botão nenhum. */
  const [podeAmpliar, setPodeAmpliar] = useState(false);
  const alvoRef = useRef<HTMLDivElement>(null);
  /* Ref na raiz, e não no botão: o GlowButton não expõe ref, e o que eu
     preciso é só devolver o foco pra ele ao fechar. */
  const raizRef = useRef<HTMLDivElement>(null);

  /* Mede a moldura onde ela está e devolve o transform que a leva ao centro da
     janela, no tamanho ampliado. Medir no clique, e não uma vez só, é o que
     faz isto continuar certo depois de rolar a página ou girar o aparelho. */
  const calcular = useCallback(() => {
    const el = alvoRef.current;
    if (!el) return '';

    /* Mede com a ampliação desligada. Sem isso, recalcular com a moldura já
       ampliada leria o tamanho ampliado e ela cresceria a cada medição. Ligar
       e desligar no mesmo quadro não chega a pintar. */
    const antes = el.style.transform;
    if (antes) el.style.transform = 'none';
    const pai = el.getBoundingClientRect();
    /* O CONTEÚDO, não este wrapper: o SlideIn lá dentro é
       `calc(100% + 6rem)`, porque a moldura sangra pra fora da coluna de
       propósito. Centralizar pela caixa do wrapper deixava o notebook visível
       jogado pra direita. */
    const conteudo = (el.firstElementChild as HTMLElement | null) ?? el;
    const filho = conteudo.getBoundingClientRect();
    if (antes) el.style.transform = antes;

    if (!filho.width || !filho.height) return '';

    const escala = Math.min(
      (window.innerWidth * OCUPACAO) / filho.width,
      (window.innerHeight * OCUPACAO) / filho.height,
    );
    /* Se a moldura já é maior que o alvo, ampliar encolheria. Melhor não fazer
       nada do que fazer o contrário do que o botão promete. */
    if (escala <= 1.02) return '';

    /* O `scale` gira em torno do centro do PAI (é nele que o transform é
       aplicado), mas quem precisa terminar no centro da janela é o FILHO.
       Ignorar essa diferença era o que deixava o notebook fora do meio:
       um ponto p vai parar em  origem + d + escala * (p - origem),
       então d = alvo - origem - escala * (centroDoFilho - origem). */
    const ox = pai.left + pai.width / 2;
    const oy = pai.top + pai.height / 2;
    const cx = filho.left + filho.width / 2;
    const cy = filho.top + filho.height / 2;
    const dx = window.innerWidth / 2 - ox - escala * (cx - ox);
    const dy = window.innerHeight / 2 - oy - escala * (cy - oy);

    return `translate(${dx}px, ${dy}px) scale(${escala})`;
  }, []);

  const abrir = useCallback(() => {
    const t = calcular();
    if (!t) return;
    setTransform(t);
    setAberto(true);
  }, [calcular]);

  const fechar = useCallback(() => {
    setTransform('');
    setAberto(false);
    /* O foco volta pro botão que abriu: quem navega por teclado não é
       despejado no começo da página quando fecha. */
    raizRef.current?.querySelector<HTMLButtonElement>('.frame-expand')?.focus();
  }, []);

  useEffect(() => {
    setScrollLocked(aberto);
    return () => setScrollLocked(false);
  }, [aberto]);

  /* ResizeObserver e não só o evento de resize: a moldura muda de tamanho
     quando a imagem ou o vídeo carrega, e não só quando a janela muda. */
  useEffect(() => {
    const el = alvoRef.current;
    if (!el) return;
    const checar = () => setPodeAmpliar(Boolean(calcular()));
    checar();
    const ro = new ResizeObserver(checar);
    ro.observe(el);
    window.addEventListener('resize', checar);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', checar);
    };
  }, [calcular]);

  useEffect(() => {
    if (!aberto) return;
    const onTecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') fechar();
    };
    /* Redimensionar com a moldura ampliada: recalcula, senão ela fica
       descentralizada ou maior que a janela nova. */
    const onResize = () => {
      const t = calcular();
      if (t) setTransform(t);
      else fechar();
    };
    window.addEventListener('keydown', onTecla);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('keydown', onTecla);
      window.removeEventListener('resize', onResize);
    };
  }, [aberto, calcular, fechar]);

  return (
    <div ref={raizRef} className="relative">
      {/* Fundo escurecido. Irmão da moldura e dentro do mesmo contexto de
          empilhamento, pelo motivo 2 do comentário do topo. */}
      <div
        aria-hidden="true"
        onClick={fechar}
        className={`fixed inset-0 z-[1] bg-background/85 backdrop-blur-sm transition-opacity duration-500 ${
          aberto ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      {/* A moldura. O transform é a única coisa que muda: ela não sai do fluxo,
          não troca de pai e o vídeo não remonta. */}
      <div
        ref={alvoRef}
        style={{ transform }}
        onClick={
          aberto
            ? (e) => {
                /* Clique no VÍDEO não fecha; em qualquer outro lugar, fecha.
                   O fundo escurecido só cobre o que está em volta do notebook,
                   então sem isto o corpo do aparelho (tampa, base, moldura da
                   tela) seria uma faixa larga onde clicar não fazia nada. */
                if ((e.target as HTMLElement).closest('video')) return;
                fechar();
              }
            : undefined
        }
        className={`relative z-[2] transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
          aberto ? 'cursor-zoom-out' : ''
        }`}
      >
        {children}
      </div>

      {/* O botão fica FORA do elemento que escala: dentro dele, cresceria
          junto e viraria um botão gigante no fim da animação. */}
      {(podeAmpliar || aberto) && (
        <GlowButton
          variant="quiet"
          onClick={aberto ? fechar : abrir}
          aria-expanded={aberto}
          aria-label={aberto ? collapseLabel : expandLabel}
          title={aberto ? collapseLabel : expandLabel}
          className={`frame-expand ${aberto ? 'frame-expand--open' : ''}`}
        >
          {aberto ? (
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="M5 5l10 10M15 5L5 15" />
            </svg>
          ) : (
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="M8 3H3v5M12 3h5v5M17 12v5h-5M3 12v5h5" />
            </svg>
          )}
        </GlowButton>
      )}
    </div>
  );
}
