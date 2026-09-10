'use client';

/* Cortina de pixels entre páginas.
 *
 * A ideia é a mesma do PixelSwap do React Bits — uma grade de quadrados que
 * cresce em cascata até fechar a tela —, só que aqui os pixels não carregam
 * conteúdo clonado: eles são a cortina. O ciclo é
 *
 *   cover  → pixels crescem e fecham a viewport
 *   hold   → router.push() e espera o pathname novo assumir
 *   reveal → pixels encolhem e devolvem a tela, já com a página nova atrás
 *
 * Como os pixels são divs sólidas, dá para usar uma grade bem mais densa do
 * que o componente original permite (ele clona o DOM inteiro por pixel).
 *
 * `revealPage()` pula direto pro reveal: usado por quem já cobre a tela por
 * conta própria (o boot intro da home) e só quer emprestar a mesma animação
 * de abertura, sem cover/hold/troca de rota.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';

const PIXEL_SIZE = 56;
const MAX_PIXELS = 900;
const COVER_MS = 760;
const REVEAL_MS = 760;
/* revealPage() (boot intro) só faz a metade "reveal" do ciclo, sem o "cover"
   que antecede toda troca de página — pra render na mesma velocidade
   percebida da transição completa entre páginas, precisa da soma das duas. */
const BOOT_REVEAL_MS = COVER_MS + REVEAL_MS;
const PIXEL_MS = 420;
const PIXEL_SCALE = 0.35;
const EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';
/* Se a rota nova travar, a cortina não pode ficar presa na tela. */
const HOLD_TIMEOUT_MS = 2500;

type Phase = 'idle' | 'cover' | 'hold' | 'reveal';

type Pixel = {
  id: number;
  left: number;
  top: number;
  /* 0..1 — posição do pixel na cascata */
  offset: number;
  tone: 0 | 1 | 2;
};

type Grid = { pixels: Pixel[]; size: number; scale: number; covered: boolean };

type Ctx = {
  navigate: (href: string) => void;
  /* Abre a cortina sem trocar de rota — pra handoffs como o boot intro, que
     já cobre a tela por conta própria e só precisa da mesma animação de
     "reveal" pra devolver a página. */
  revealPage: () => void;
  isTransitioning: boolean;
  /* true enquanto o boot intro da home está rodando — o header (que vive no
     layout raiz, fora do <main> onde o boot mora) usa isso pra sumir
     durante o boot em vez de aparecer por trás dele. */
  bootActive: boolean;
  setBootActive: (active: boolean) => void;
  /* true enquanto algo está tomando a tela inteira e o header não deve
     aparecer (o portal do MacBook, na home). Separado de bootActive porque
     as duas fases se sobrepõem: o boot termina e o portal continua. */
  chromeHidden: boolean;
  setChromeHidden: (hidden: boolean) => void;
};

const PixelTransitionContext = createContext<Ctx | null>(null);

export function usePixelTransition() {
  const ctx = useContext(PixelTransitionContext);
  if (!ctx) {
    throw new Error('usePixelTransition precisa de <PixelTransitionProvider>');
  }
  return ctx;
}

/* Ruído determinístico: a mesma célula sempre recebe o mesmo atraso e o mesmo
   tom, então a cortina não "pisca" diferente a cada re-render. */
const noise = (seed: number) => {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
};

const buildGrid = (
  width: number,
  height: number,
  covered = false,
): Grid => {
  let size = PIXEL_SIZE;
  let columns = Math.max(1, Math.ceil(width / size));
  let rows = Math.max(1, Math.ceil(height / size));

  if (columns * rows > MAX_PIXELS) {
    size = Math.ceil(size * Math.sqrt((columns * rows) / MAX_PIXELS));
    columns = Math.max(1, Math.ceil(width / size));
    rows = Math.max(1, Math.ceil(height / size));
  }

  /* Sobra centrada nas bordas: os pixels das pontas continuam quadrados em vez
     de serem cortados pela viewport. */
  const originX = (width - columns * size) / 2;
  const originY = (height - rows * size) / 2;
  const pixels: Pixel[] = [];

  /* offset dirige a cascata: onda diagonal (canto superior-esquerdo → inferior-
     direito) com um jitter leve por cima, pra parecer orgânico sem virar
     ruído puro — pixels vizinhos entram quase juntos em vez de espalhados. */
  const maxDiagonal = Math.max(1, rows - 1 + columns - 1);

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const id = row * columns + column;
      const random = noise(id + 1);
      const diagonal = (row + column) / maxDiagonal;
      const jitter = (random - 0.5) * 0.18;
      pixels.push({
        id,
        left: originX + column * size,
        top: originY + row * size,
        offset: Math.min(1, Math.max(0, diagonal + jitter)),
        tone: (random < 0.05 ? 2 : random < 0.3 ? 1 : 0) as 0 | 1 | 2,
      });
    }
  }

  /* Cresce um tico além da própria caixa para não sobrar costura entre
     pixels vizinhos no fim da animação. */
  return { pixels, size, scale: 1.02, covered };
};

const cleanPath = (href: string) => href.split('#')[0].split('?')[0];

export function PixelTransitionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [phase, setPhase] = useState<Phase>('idle');
  const [grid, setGrid] = useState<Grid | null>(null);
  /* A home sempre toca o boot ao chegar em '/' — assume rodando por padrão
     pra essa rota (evita o header piscar antes do BootIntro montar) e
     reflete qualquer troca de rota daí em diante. BootIntro desliga isso no
     handoff, no mesmo commit que libera a cortina. */
  const [bootActive, setBootActive] = useState(() => pathname === '/');
  const [chromeHidden, setChromeHidden] = useState(false);
  useEffect(() => {
    setBootActive(pathname === '/');
  }, [pathname]);
  const targetRef = useRef<string | null>(null);
  const pixelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const animationsRef = useRef<Animation[]>([]);
  const timerRef = useRef(0);

  const stopAnimations = useCallback(() => {
    animationsRef.current.forEach((animation) => animation.cancel());
    animationsRef.current = [];
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = 0;
  }, []);

  useEffect(() => stopAnimations, [stopAnimations]);

  const navigate = useCallback(
    (href: string) => {
      if (phase !== 'idle') return;

      const target = cleanPath(href);
      if (target === pathname) return;

      const reduced = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;

      if (reduced) {
        router.push(href);
        return;
      }

      targetRef.current = href;
      setGrid(buildGrid(window.innerWidth, window.innerHeight));
      setPhase('cover');
    },
    [pathname, phase, router],
  );

  /* Entra direto em "reveal": quem chamou já cobria a tela por conta própria
     (ex.: o boot intro) e só quer a animação de abertura, sem cover/hold/
     router.push. A grade nasce com covered:true — pixels já opacos desde o
     primeiro paint — pra não piscar antes do reveal começar. */
  const revealPage = useCallback(() => {
    if (phase !== 'idle') return;

    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (reduced) return;

    setGrid(buildGrid(window.innerWidth, window.innerHeight, true));
    setPhase('reveal');
  }, [phase]);

  /* cover — fecha a tela e só então troca de rota */
  useEffect(() => {
    if (phase !== 'cover' || !grid) return;

    const spread = COVER_MS - PIXEL_MS;

    grid.pixels.forEach((pixel, index) => {
      const element = pixelRefs.current[index];
      if (!element) return;

      animationsRef.current.push(
        element.animate(
          [
            {
              opacity: 0,
              transform: `scale(${PIXEL_SCALE * grid.scale})`,
            },
            { opacity: 1, transform: `scale(${grid.scale})` },
          ],
          {
            duration: PIXEL_MS,
            delay: pixel.offset * spread,
            easing: EASING,
            fill: 'both',
          },
        ),
      );
      /* Estado-base pós-animação: se a animação for cancelada no reveal, o
         pixel cai para "tela fechada" em vez de sumir por um frame. */
      element.style.opacity = '1';
    });

    timerRef.current = window.setTimeout(() => {
      const href = targetRef.current;
      setPhase('hold');
      if (href) router.push(href);
    }, COVER_MS);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = 0;
    };
  }, [grid, phase, router]);

  /* hold — espera o pathname novo assumir (com escape hatch por timeout) */
  useEffect(() => {
    if (phase !== 'hold') return;

    const target = targetRef.current ? cleanPath(targetRef.current) : null;
    if (target && pathname === target) {
      setPhase('reveal');
      return;
    }

    timerRef.current = window.setTimeout(
      () => setPhase('reveal'),
      HOLD_TIMEOUT_MS,
    );
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = 0;
    };
  }, [pathname, phase]);

  /* reveal — devolve a tela na ordem inversa da cascata */
  useEffect(() => {
    if (phase !== 'reveal' || !grid) return;

    stopAnimations();
    /* Reveal "solo" (boot intro) roda mais devagar que o reveal que segue um
       cover — ver BOOT_REVEAL_MS. */
    const revealMs = grid.covered ? BOOT_REVEAL_MS : REVEAL_MS;
    const spread = revealMs - PIXEL_MS;

    grid.pixels.forEach((pixel, index) => {
      const element = pixelRefs.current[index];
      if (!element) return;

      animationsRef.current.push(
        element.animate(
          [
            { opacity: 1, transform: `scale(${grid.scale})` },
            {
              opacity: 0,
              transform: `scale(${PIXEL_SCALE * grid.scale})`,
            },
          ],
          {
            duration: PIXEL_MS,
            delay: (1 - pixel.offset) * spread,
            easing: EASING,
            fill: 'both',
          },
        ),
      );
    });

    timerRef.current = window.setTimeout(() => {
      stopAnimations();
      targetRef.current = null;
      pixelRefs.current = [];
      setGrid(null);
      setPhase('idle');
    }, revealMs);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = 0;
    };
  }, [grid, phase, stopAnimations]);

  const value = useMemo<Ctx>(
    () => ({
      navigate,
      revealPage,
      isTransitioning: phase !== 'idle',
      bootActive,
      setBootActive,
      chromeHidden,
      setChromeHidden,
    }),
    [navigate, revealPage, phase, bootActive, chromeHidden],
  );

  return (
    <PixelTransitionContext.Provider value={value}>
      {children}
      {grid && (
        <div className="pixel-curtain" aria-hidden="true">
          {grid.pixels.map((pixel, index) => (
            <div
              key={pixel.id}
              ref={(element) => {
                pixelRefs.current[index] = element;
              }}
              className="pixel-curtain__px"
              data-tone={pixel.tone}
              style={{
                left: pixel.left,
                top: pixel.top,
                width: grid.size,
                height: grid.size,
                transform: `scale(${grid.scale})`,
                opacity: grid.covered ? 1 : undefined,
              }}
            />
          ))}
        </div>
      )}
    </PixelTransitionContext.Provider>
  );
}
